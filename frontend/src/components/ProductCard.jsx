import { Link } from "react-router";
import { Clock, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/ProductImage";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { useI18n } from "@/i18n/i18n-context";
import { isNew, scriptLang } from "@/i18n/format";

/**
 * Product tile used in the grid and in rails.
 * `showWhen` swaps the "New" badge for a relative date ("Today", "৩ দিন আগে") in the New-this-week rail.
 */
export function ProductCard({ product, showWhen = false }) {
  const { t, price, ago } = useI18n();
  const addToCart = useAddToCart();
  const href = `/products/${product.slug}`;

  return (
    <article className="pcard">
      <div className="pcard-media">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
          <ProductImage src={product.imageUrl} />
        </Link>

        {showWhen ? (
          <span className="badge-when pointer-events-none absolute top-2.5 left-2.5 z-2">
            <Clock aria-hidden />
            {ago(product.createdAt)}
          </span>
        ) : (
          isNew(product.createdAt) && (
            <span className="badge-new pointer-events-none absolute top-2.5 left-2.5 z-2">
              {t("common.new")}
            </span>
          )
        )}

        <button
          type="button"
          className="add-btn"
          onClick={() => addToCart(product)}
          aria-label={t("common.addAria", { name: product.name })}
        >
          <span className="add-label">{t("common.addToCart")}</span>
          <Plus aria-hidden />
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-0.5 px-0.5">
        <p className="pcard-cat" lang={scriptLang(product.category)}>
          {product.category}
        </p>
        <h3 className="pcard-name" lang={scriptLang(product.name)}>
          <Link to={href} title={product.name}>
            {product.name}
          </Link>
        </h3>
        <p className="price mt-1.5 text-[19px]">{price(product.priceCents)}</p>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-4/5 rounded-2xl bg-kantha" />
      <div className="space-y-2 px-0.5">
        <Skeleton className="h-3 w-16 bg-kantha" />
        <Skeleton className="h-4 w-3/4 bg-kantha" />
        <Skeleton className="h-5 w-14 bg-kantha" />
      </div>
    </div>
  );
}
