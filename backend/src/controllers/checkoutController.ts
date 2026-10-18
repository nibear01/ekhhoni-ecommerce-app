import type { Request, Response, NextFunction } from "express";
import { getEnv } from "../lib/env";
import z from "zod";
import { getAuth } from "@clerk/express";
import { ensureLocalUser } from "../lib/users";
import { db } from "../db";
import { CheckoutSessionLine, checkoutSessions, products } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { sslcommerzConfigured, sslInitSession } from "../lib/sslcommerz";

const env = getEnv();

/** SSLCommerz rejects payments under ৳10 */
const MIN_TOTAL_CENTS = 10 * 100;

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    // Bangladeshi mobile: 01XXXXXXXXX, optionally with +880 / 880
    phone: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s-]/g, ""))
      .pipe(z.string().regex(/^(?:\+?880)?01[3-9]\d{8}$/)),
    address: z.string().trim().min(5).max(200),
    city: z.string().trim().min(2).max(60),
    postcode: z.string().trim().max(10).optional().default(""),
  }),
});

export async function createCheckout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // only signed-in users can start checkout
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid checkout", details: parsed.error.flatten() });
      return;
    }

    if (!sslcommerzConfigured(env)) {
      res.status(503).json({ error: "Payments are not configured" });
      return;
    }

    const localUser = await ensureLocalUser(userId);
    const { items, customer } = parsed.data;

    // dedupe so the same product on two cart lines isn't rejected below
    const ids = [...new Set(items.map((i) => i.productId))];

    // load every cart product that exists, is active, and matches the IDs we asked for.
    const prodRows = await db
      .select()
      .from(products)
      .where(and(inArray(products.id, ids), eq(products.active, true)));

    if (prodRows.length !== ids.length) {
      res.status(400).json({ error: "One or more products are invalid" });
      return;
    }

    // prices always come from the database, never from the client
    const byId = new Map(prodRows.map((p) => [p.id, p]));
    let totalCents = 0;
    const lines: CheckoutSessionLine[] = [];

    for (const line of items) {
      const p = byId.get(line.productId)!;
      totalCents += p.priceCents * line.quantity;
      lines.push({
        productId: p.id,
        quantity: line.quantity,
        unitPriceCents: p.priceCents,
      });
    }

    if (totalCents < MIN_TOTAL_CENTS) {
      res.status(400).json({ error: "Total below payment minimum (৳10)" });
      return;
    }

    const shipping = { ...customer, postcode: customer.postcode || undefined };

    // the session id doubles as the SSLCommerz transaction id
    const [session] = await db
      .insert(checkoutSessions)
      .values({ userId: localUser.id, lines, totalCents, currency: "bdt", shipping })
      .returning();

    // in production the API and the shop share FRONTEND_URL; in dev Vite proxies /api to Express
    const callback = (path: string) => new URL(`/api/payments/sslcommerz/${path}`, env.FRONTEND_URL).href;
    const first = byId.get(lines[0].productId)!;
    const quantity = lines.reduce((n, l) => n + l.quantity, 0);

    const checkoutUrl = await sslInitSession(env, {
      tranId: session.id,
      totalCents,
      numItems: quantity,
      productName: lines.length > 1 ? `${first.name} + ${lines.length - 1} more` : first.name,
      customer: { ...shipping, email: localUser.email || "customer@example.com" },
      urls: {
        success: callback("success"),
        fail: callback("fail"),
        cancel: callback("cancel"),
        ipn: callback("ipn"),
      },
    });

    res.json({ checkoutUrl });
  } catch (e) {
    next(e);
  }
}
