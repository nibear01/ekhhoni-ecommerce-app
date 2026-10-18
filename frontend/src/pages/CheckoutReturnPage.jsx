import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lotus } from "@/components/Lotus";
import { useCart } from "@/cart/cart-context";
import { useI18n } from "@/i18n/i18n-context";

const LAST_CLEARED_KEY = "ekhhoni:cart:cleared-for";

/**
 * Polar redirects here after a successful payment (`success_url`).
 * The order itself is recorded by the Polar webhook on the backend, not by this page.
 */
export function CheckoutReturnPage() {
  const [searchParams] = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const { clear } = useCart();
  const { t } = useI18n();

  useEffect(() => {
    if (!checkoutId) return;
    // only clear once per checkout, so revisiting this URL later doesn't wipe a new cart
    try {
      if (localStorage.getItem(LAST_CLEARED_KEY) === checkoutId) return;
      localStorage.setItem(LAST_CLEARED_KEY, checkoutId);
    } catch {
      // storage unavailable: clearing every time is the safe fallback
    }
    clear();
  }, [checkoutId, clear]);

  if (!checkoutId) {
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

  return (
    <div className="shell py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <div className="relative grid size-40 place-items-center">
          <Lotus className="absolute inset-0 size-full text-zari-ink opacity-60" />
          <span className="relative grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_var(--shadow-ink)]">
            <Check className="size-8" strokeWidth={2.5} aria-hidden />
          </span>
        </div>
        <h1 className="display text-4xl lg:text-5xl">{t("cart.thanksTitle")}</h1>
        <p className="max-w-md text-lg leading-relaxed text-muted-foreground bn:leading-[1.8]">
          {t("cart.thanksBody")}
        </p>
        <p className="rounded-full border border-dashed border-stitch px-4 py-1 text-xs text-muted-foreground">
          {t("cart.reference", { id: checkoutId })}
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link to="/">{t("cart.continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
