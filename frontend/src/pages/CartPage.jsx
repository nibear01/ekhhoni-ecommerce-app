import { useState } from "react";
import { Link } from "react-router";
import { Show } from "@clerk/react";
import { AlertCircle, ArrowRight, Loader2, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lotus } from "@/components/Lotus";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { DeliveryForm } from "@/components/cart/DeliveryForm";
import { useCart } from "@/cart/cart-context";
import { checkoutErrorKey, useCheckout } from "@/hooks/use-checkout";
import { useDeliveryDetails, validateDelivery } from "@/hooks/use-delivery-details";
import { useProducts } from "@/hooks/use-products";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";

export function CartPage() {
  const { t, price } = useI18n();
  const { items, count, setQuantity, remove } = useCart();
  const checkout = useCheckout();
  const [delivery, setDelivery] = useDeliveryDetails();
  const [deliveryErrors, setDeliveryErrors] = useState({});

  function startCheckout() {
    const errors = validateDelivery(delivery);
    setDeliveryErrors(errors);
    if (Object.keys(errors).length > 0) {
      document.getElementById("delivery-form")?.scrollIntoView({ block: "start" });
      return;
    }
    checkout.mutate({ items, customer: delivery });
  }

  // cross-check the saved cart against what's currently for sale, so removed
  // products and price changes show up here instead of failing at checkout
  const liveProducts = useProducts();
  const liveById = new Map((liveProducts.data ?? []).map((p) => [p.id, p]));

  const lines = items.map((item) => {
    const live = liveById.get(item.productId);
    return {
      ...item,
      priceCents: live?.priceCents ?? item.priceCents,
      imageUrl: live?.imageUrl ?? item.imageUrl,
      unavailable: Boolean(liveProducts.data) && !live,
    };
  });

  const hasUnavailable = lines.some((l) => l.unavailable);
  const subtotal = lines
    .filter((l) => !l.unavailable)
    .reduce((sum, l) => sum + l.priceCents * l.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="shell py-16 lg:py-24">
        <div className="cloth-panel mx-auto max-w-xl py-16">
          <Lotus className="w-24" />
          <h1 className="display text-3xl">{t("cart.emptyTitle")}</h1>
          <p className="text-muted-foreground">{t("cart.emptyHint")}</p>
          <Button asChild size="lg" className="mt-2">
            <Link to="/">
              {t("cart.startShopping")}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-10 lg:py-16">
      <p className="eyebrow">{t("cart.eyebrow")}</p>
      <h1 className="display h2 mt-2.5 mb-8 flex flex-wrap items-baseline gap-x-4 lg:mb-10">
        {t("cart.title")}
        <span className="font-sans text-lg font-medium tracking-normal text-muted-foreground">
          {t("common.items", { n: count })}
        </span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
          <ul className="divide-y divide-dashed divide-stitch rounded-[20px] border border-border bg-card">
            {lines.map((line) => (
              <li key={line.productId} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                <Link
                  to={`/products/${line.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-kantha sm:size-28"
                >
                  <ProductImage src={line.imageUrl} />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/products/${line.slug}`}
                        lang={scriptLang(line.name)}
                        className="line-clamp-2 text-[16px] font-medium hover:underline"
                      >
                        {line.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {t("cart.each", { price: price(line.priceCents) })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(line.productId)}
                      aria-label={t("cart.remove", { name: line.name })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>

                  {line.unavailable ? (
                    <p className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[13px] font-semibold text-destructive">
                      <AlertCircle className="size-3.5" aria-hidden />
                      {t("cart.unavailable")}
                    </p>
                  ) : (
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(q) => setQuantity(line.productId, q)}
                      />
                      <span className="price text-lg">
                        {price(line.priceCents * line.quantity)}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Show when="signed-in">
            <DeliveryForm
              id="delivery-form"
              value={delivery}
              onChange={(next) => {
                setDelivery(next);
                if (Object.keys(deliveryErrors).length) setDeliveryErrors(validateDelivery(next));
              }}
              errors={deliveryErrors}
              onSubmit={startCheckout}
            />
          </Show>
        </div>

        <aside className="h-fit rounded-[20px] border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="display text-2xl">{t("cart.summary")}</h2>
          <dl className="mt-5 space-y-3 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
              <dd className="font-semibold tabular-nums">{price(subtotal)}</dd>
            </div>
            <p className="text-sm text-muted-foreground">{t("cart.deliveryNote")}</p>
            <hr className="stitch-rule" />
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-lg font-semibold">{t("cart.total")}</dt>
              <dd className="price text-[26px] text-primary">{price(subtotal)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3">
            {checkout.isError && (
              <p role="alert" className="flex gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {t(checkoutErrorKey(checkout.error))}
              </p>
            )}
            {hasUnavailable && (
              <p className="text-sm text-muted-foreground">{t("cart.removeUnavailable")}</p>
            )}

            <Show when="signed-in">
              <Button
                type="submit"
                form="delivery-form"
                size="lg"
                disabled={hasUnavailable || checkout.isPending || checkout.isSuccess}
              >
                {checkout.isPending || checkout.isSuccess ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t("cart.redirecting")}
                  </>
                ) : (
                  <>
                    <Lock />
                    {t("cart.checkout")}
                  </>
                )}
              </Button>
            </Show>
            <Show when="signed-out">
              <Button asChild size="lg">
                <Link to="/sign-in?redirect_url=/cart">{t("cart.signInToCheckout")}</Link>
              </Button>
            </Show>

            <Button asChild variant="ghost">
              <Link to="/">{t("cart.continueShopping")}</Link>
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-[13px] text-muted-foreground">
              <Lock className="size-3.5" aria-hidden />
              {t("cart.secureNote")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
