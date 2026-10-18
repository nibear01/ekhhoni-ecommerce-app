import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lotus } from "@/components/Lotus";
import { useCart } from "@/cart/cart-context";
import { useI18n } from "@/i18n/i18n-context";

const LAST_CLEARED_KEY = "ekhhoni:cart:cleared-for";

/**
 * The server sends shoppers here after SSLCommerz: ?status=success|failed|cancelled&tran_id=…
 * "success" means the server already validated the payment with SSLCommerz and created the order.
 */
export function CheckoutReturnPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const tranId = searchParams.get("tran_id");
  const { clear } = useCart();
  const { t } = useI18n();
  const paid = status === "success";

  useEffect(() => {
    if (!paid || !tranId) return;
    // only clear once per payment, so revisiting this URL later doesn't wipe a new cart
    try {
      if (localStorage.getItem(LAST_CLEARED_KEY) === tranId) return;
      localStorage.setItem(LAST_CLEARED_KEY, tranId);
    } catch {
      // storage unavailable: clearing every time is the safe fallback
    }
    clear();
  }, [paid, tranId, clear]);

  if (status !== "success" && status !== "failed" && status !== "cancelled") {
    return (
      <div className="shell py-16 lg:py-24">
        <div className="cloth-panel mx-auto max-w-xl">
          <Lotus />
          <h1 className="display text-3xl">{t("cart.nothingTitle")}</h1>
          <p className="text-muted-foreground">{t("cart.nothingBody")}</p>
          <Button asChild className="mt-2">
            <Link to="/">{t("cart.goShop")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const copy = {
    success: { title: "cart.thanksTitle", body: "cart.thanksBody" },
    failed: { title: "cart.failedTitle", body: "cart.failedBody" },
    cancelled: { title: "cart.cancelledTitle", body: "cart.cancelledBody" },
  }[status];

  return (
    <div className="shell py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <div className="relative grid size-40 place-items-center">
          <Lotus className="absolute inset-0 size-full text-zari-ink opacity-60" />
          <span
            className={
              paid
                ? "relative grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_var(--shadow-ink)]"
                : "relative grid size-16 place-items-center rounded-full bg-sindoor text-sindoor-foreground shadow-[0_10px_30px_-10px_var(--shadow-ink)]"
            }
          >
            {paid ? (
              <Check className="size-8" strokeWidth={2.5} aria-hidden />
            ) : (
              <X className="size-8" strokeWidth={2.5} aria-hidden />
            )}
          </span>
        </div>
        <h1 className="display text-4xl lg:text-5xl">{t(copy.title)}</h1>
        <p className="max-w-md text-lg leading-relaxed text-muted-foreground bn:leading-[1.8]">
          {t(copy.body)}
        </p>
        {tranId && (
          <p className="rounded-full border border-dashed border-stitch px-4 py-1 text-xs text-muted-foreground">
            {t("cart.reference", { id: tranId.slice(0, 8).toUpperCase() })}
          </p>
        )}
        <Button asChild size="lg" className="mt-2">
          {paid ? (
            <Link to="/">{t("cart.continueShopping")}</Link>
          ) : (
            <Link to="/cart">{t("cart.backToCart")}</Link>
          )}
        </Button>
      </div>
    </div>
  );
}
