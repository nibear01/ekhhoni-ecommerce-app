import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { checkoutSessions, orderItems, orders } from "../db/schema";
import { getEnv } from "../lib/env";
import { sslValidate } from "../lib/sslcommerz";

const env = getEnv();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function field(req: Request, name: string) {
  const v = (req.body as Record<string, unknown> | undefined)?.[name] ?? req.query[name];
  return typeof v === "string" ? v : undefined;
}

/**
 * Validates a payment with SSLCommerz and turns the checkout session into a paid order.
 * Idempotent: the success redirect and the IPN can both arrive; the order is created once.
 */
async function settlePayment(valId: string | undefined): Promise<"paid" | "failed"> {
  if (!valId) return "failed";

  const v = await sslValidate(env, valId);
  if (v.status !== "VALID" && v.status !== "VALIDATED") return "failed";
  if (!UUID.test(v.tran_id)) return "failed";

  const alreadyPaid = async () => {
    const [row] = await db.select({ id: orders.id }).from(orders).where(eq(orders.tranId, v.tran_id)).limit(1);
    return Boolean(row);
  };
  if (await alreadyPaid()) return "paid";

  const result = await db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(checkoutSessions)
      .where(eq(checkoutSessions.id, v.tran_id))
      .for("update");
    if (!session) return "missing" as const;

    // the amount actually paid must match what we priced on the server
    const currency = (v.currency_type ?? v.currency ?? "").toUpperCase();
    if (currency !== "BDT" || Math.round(Number(v.amount) * 100) !== session.totalCents) {
      console.error("SSLCommerz amount mismatch", { tranId: v.tran_id, amount: v.amount, currency, expected: session.totalCents });
      return "failed" as const;
    }

    const [order] = await tx
      .insert(orders)
      .values({
        userId: session.userId,
        status: "paid",
        tranId: v.tran_id,
        valId: v.val_id,
        paymentMethod: v.card_type ?? null,
        currency: "bdt",
        shipping: session.shipping,
        totalCents: session.totalCents,
      })
      .returning();

    if (session.lines.length) {
      await tx.insert(orderItems).values(
        session.lines.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
        })),
      );
    }
    await tx.delete(checkoutSessions).where(eq(checkoutSessions.id, v.tran_id));
    return "paid" as const;
  });

  // session already consumed by a concurrent IPN/success call
  if (result === "missing") return (await alreadyPaid()) ? "paid" : "failed";
  return result;
}

function returnUrl(status: "success" | "failed" | "cancelled", tranId: string | undefined) {
  const url = new URL("/checkout/return", env.FRONTEND_URL);
  url.searchParams.set("status", status);
  if (tranId) url.searchParams.set("tran_id", tranId);
  return url.href;
}

/** SSLCommerz posts the shopper's browser here after a successful payment */
export async function sslSuccess(req: Request, res: Response, next: NextFunction) {
  try {
    const status = await settlePayment(field(req, "val_id"));
    res.redirect(303, returnUrl(status === "paid" ? "success" : "failed", field(req, "tran_id")));
  } catch (e) {
    next(e);
  }
}

export function sslFail(req: Request, res: Response) {
  res.redirect(303, returnUrl("failed", field(req, "tran_id")));
}

export function sslCancel(req: Request, res: Response) {
  res.redirect(303, returnUrl("cancelled", field(req, "tran_id")));
}

/** server-to-server notification; a backup for shoppers who close the tab before the redirect */
export async function sslIpn(req: Request, res: Response) {
  try {
    const status = await settlePayment(field(req, "val_id"));
    res.json({ ok: status === "paid" });
  } catch (e) {
    console.error("SSLCommerz IPN error", e);
    res.status(500).json({ ok: false });
  }
}
