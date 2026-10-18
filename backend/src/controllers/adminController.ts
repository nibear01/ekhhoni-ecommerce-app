import { clerkClient, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { ensureLocalUser } from "../lib/users";
import { isAdmin, ROLES } from "../lib/roles";
import ImageKit from "@imagekit/nodejs";
import { getEnv } from "../lib/env";
import { db } from "../db";
import { orderItems, orders, products, users, type UserRole } from "../db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { deleteImageKitAsset } from "../lib/imagekit";

const env = getEnv();

const productCreate = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1).default("General"),
  description: z.string().default(""),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1).default("bdt"),
  imageUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  imageKitFileId: z
    .union([z.string().min(1), z.literal(""), z.null()])
    .optional(),
  active: z.boolean().default(true),
});

const productPatch = productCreate.partial();

function buildProductUpdateSet(body: z.infer<typeof productPatch>) {
  const data: Partial<typeof products.$inferInsert> = {};
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.name !== undefined) data.name = body.name;
  if (body.category !== undefined) data.category = body.category;
  if (body.description !== undefined) data.description = body.description;
  if (body.priceCents !== undefined) data.priceCents = body.priceCents;
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.imageUrl !== undefined)
    data.imageUrl = body.imageUrl === "" ? null : body.imageUrl;
  if (body.imageKitFileId !== undefined) {
    data.imageKitFileId =
      body.imageKitFileId === "" ? null : body.imageKitFileId;
  }
  if (body.active !== undefined) data.active = body.active;
  return data;
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await ensureLocalUser(userId);

    if (!user || !isAdmin(user.role)) {
      res.status(403).json({ error: "Admin only" });
      return;
    }
    res.locals.adminUser = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function getImageKitAuth(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const client = new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY });

    const auth = client.helper.getAuthenticationParameters();

    res.json({
      ...auth,
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (e) {
    next(e);
  }
}

export async function listAdminProducts(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const [rows, counts] = await Promise.all([
      db.select().from(products).orderBy(desc(products.createdAt)),
      db
        .select({ productId: orderItems.productId, n: count() })
        .from(orderItems)
        .groupBy(orderItems.productId),
    ]);
    // products that appear on orders can only be deactivated, not deleted
    const ordered = new Map(counts.map((c) => [c.productId, Number(c.n)]));
    res.json({ products: rows.map((p) => ({ ...p, orderCount: ordered.get(p.id) ?? 0 })) });
  } catch (e) {
    next(e);
  }
}

export async function createAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = productCreate.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const { imageUrl, imageKitFileId, ...rest } = parsed.data;

    const [row] = await db
      .insert(products)
      .values({
        ...rest,
        imageUrl: imageUrl || null,
        imageKitFileId: imageKitFileId || null,
      })
      .returning();
    res.status(201).json({ product: row });
  } catch (e) {
    if (isUniqueViolation(e)) {
      res.status(409).json({ error: "Slug already in use" });
      return;
    }
    next(e);
  }
}

export async function updateAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = productPatch.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const data = buildProductUpdateSet(parsed.data);

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const id = req.params.id as string;
    const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const [row] = await db.update(products).set(data).where(eq(products.id, id)).returning();

    // the photo was replaced or removed: clean up the old file in ImageKit
    if (existing.imageKitFileId && existing.imageKitFileId !== row.imageKitFileId) {
      await deleteImageKitAsset(env, existing.imageKitFileId).catch((err) =>
        console.error("Failed to delete old ImageKit file", err),
      );
    }

    res.json({ product: row });
  } catch (e) {
    if (isUniqueViolation(e)) {
      res.status(409).json({ error: "Slug already in use" });
      return;
    }
    next(e);
  }
}

export async function deleteAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const [countRow] = await db
      .select({ c: count() })
      .from(orderItems)
      .where(eq(orderItems.productId, id));

    if (Number(countRow?.c ?? 0) > 0) {
      res.status(409).json({
        error:
          "This product is on one or more orders and cannot be deleted. Deactivate it instead.",
      });
      return;
    }

    await deleteImageKitAsset(env, existing.imageKitFileId);
    await db.delete(products).where(eq(products.id, id));

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

/** Postgres unique-constraint violation (drizzle wraps the pg error in `cause`) */
function isUniqueViolation(e: unknown) {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

export async function getAdminStats(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const [[productStats], [orderStats], [userStats]] = await Promise.all([
      db
        .select({
          total: count(),
          active: count(sql`case when ${products.active} then 1 end`),
        })
        .from(products),
      db
        .select({
          paid: count(),
          revenueCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
        })
        .from(orders)
        .where(eq(orders.status, "paid")),
      db.select({ total: count() }).from(users),
    ]);

    res.json({
      products: { total: productStats.total, active: productStats.active },
      orders: { paid: orderStats.paid, revenueCents: Number(orderStats.revenueCents) },
      customers: { total: userStats.total },
    });
  } catch (e) {
    next(e);
  }
}

export async function listAdminOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const rows = await db.query.orders.findMany({
      orderBy: desc(orders.createdAt),
      limit,
      with: {
        user: { columns: { email: true, displayName: true } },
        items: { with: { product: { columns: { name: true, slug: true, imageUrl: true } } } },
      },
    });
    res.json({ orders: rows });
  } catch (e) {
    next(e);
  }
}

export async function listAdminUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const [rows, spend] = await Promise.all([
      db.select().from(users).orderBy(desc(users.createdAt)),
      db
        .select({
          userId: orders.userId,
          orders: count(),
          spentCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
        })
        .from(orders)
        .where(eq(orders.status, "paid"))
        .groupBy(orders.userId),
    ]);
    const byUser = new Map(spend.map((s) => [s.userId, s]));
    res.json({
      users: rows.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        createdAt: u.createdAt,
        orders: byUser.get(u.id)?.orders ?? 0,
        spentCents: Number(byUser.get(u.id)?.spentCents ?? 0),
      })),
    });
  } catch (e) {
    next(e);
  }
}

const rolePatch = z.object({ role: z.enum(ROLES as [UserRole, ...UserRole[]]) });

/** changes a user's role in Clerk (source of truth, synced by webhook) and locally (immediate) */
export async function updateUserRole(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = rolePatch.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const id = req.params.id as string;
    const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!target) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const me = res.locals.adminUser as typeof users.$inferSelect;
    if (target.id === me.id && parsed.data.role !== "admin") {
      res.status(400).json({ error: "You can't remove your own admin access" });
      return;
    }

    await clerkClient.users.updateUserMetadata(target.clerkUserId, {
      publicMetadata: { role: parsed.data.role },
    });
    const [row] = await db
      .update(users)
      .set({ role: parsed.data.role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    res.json({ user: { id: row.id, role: row.role } });
  } catch (e) {
    next(e);
  }
}
