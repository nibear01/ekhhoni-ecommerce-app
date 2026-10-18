import type { Env } from "./env.js";
import type { ShippingDetails } from "../db/schema.js";

// SSLCommerz v4: https://developer.sslcommerz.com/doc/v4/
function baseUrl(env: Env) {
  return env.SSLCOMMERZ_SANDBOX ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
}

export function sslcommerzConfigured(env: Env) {
  return Boolean(env.SSLCOMMERZ_STORE_ID && env.SSLCOMMERZ_STORE_PASSWORD);
}

type InitParams = {
  tranId: string;
  totalCents: number;
  numItems: number;
  productName: string;
  customer: ShippingDetails & { email: string };
  urls: { success: string; fail: string; cancel: string; ipn: string };
};

/** opens a payment session and returns the hosted payment page URL */
export async function sslInitSession(env: Env, p: InitParams) {
  const postcode = p.customer.postcode || "0000";
  const body = new URLSearchParams({
    store_id: env.SSLCOMMERZ_STORE_ID!,
    store_passwd: env.SSLCOMMERZ_STORE_PASSWORD!,
    total_amount: (p.totalCents / 100).toFixed(2),
    currency: "BDT",
    tran_id: p.tranId,
    success_url: p.urls.success,
    fail_url: p.urls.fail,
    cancel_url: p.urls.cancel,
    ipn_url: p.urls.ipn,
    cus_name: p.customer.name,
    cus_email: p.customer.email,
    cus_phone: p.customer.phone,
    cus_add1: p.customer.address,
    cus_city: p.customer.city,
    cus_postcode: postcode,
    cus_country: "Bangladesh",
    shipping_method: "Courier",
    num_of_item: String(p.numItems),
    ship_name: p.customer.name,
    ship_add1: p.customer.address,
    ship_city: p.customer.city,
    ship_postcode: postcode,
    ship_country: "Bangladesh",
    product_name: p.productName.slice(0, 250),
    product_category: "General",
    product_profile: "physical-goods",
  });

  const res = await fetch(`${baseUrl(env)}/gwprocess/v4/api.php`, { method: "POST", body });
  const data = (await res.json().catch(() => null)) as {
    status?: string;
    GatewayPageURL?: string;
    failedreason?: string;
  } | null;

  if (!res.ok || data?.status !== "SUCCESS" || !data.GatewayPageURL) {
    throw new Error(`SSLCommerz session failed: ${data?.failedreason ?? res.status}`);
  }
  return data.GatewayPageURL;
}

export type SslValidation = {
  status: string; // VALID | VALIDATED | INVALID_TRANSACTION
  tran_id: string;
  val_id: string;
  amount: string;
  currency_type?: string;
  currency?: string;
  card_type?: string;
};

/** server-side check of a payment; never trust the browser's success POST on its own */
export async function sslValidate(env: Env, valId: string) {
  const url = new URL(`${baseUrl(env)}/validator/api/validationserverAPI.php`);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", env.SSLCOMMERZ_STORE_ID!);
  url.searchParams.set("store_passwd", env.SSLCOMMERZ_STORE_PASSWORD!);
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`SSLCommerz validation failed: ${res.status}`);
  return (await res.json()) as SslValidation;
}
