import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, ChevronRight, Banknote, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { QueryError } from "@/components/QueryError";
import { SectionHead } from "@/components/SectionHead";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { categoryPath } from "@/hooks/use-catalog";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useI18n } from "@/i18n/i18n-context";
import { isNew, scriptLang } from "@/i18n/format";
import { ApiError } from "@/lib/api";
import { NotFoundPage } from "@/pages/NotFoundPage";

const RELATED_COUNT = 8;

export function ProductPage() {
  const { slug } = useParams();
  const product = useProduct(slug);
  const { t } = useI18n();

  if (product.isPending) return <ProductPageSkeleton />;

  if (product.isError) {
    if (product.error instanceof ApiError && product.error.status === 404) {
      return <NotFoundPage title={t("product.notFound")} />;
    }
    return (
      <div className="shell py-16">
        <QueryError message={t("product.loadError")} onRetry={() => product.refetch()} />
      </div>
    );
  }

  // keyed so quantity resets when moving between products
  return <ProductDetails key={product.data.id} product={product.data} />;
}

function ProductDetails({ product: p }) {
  const { t, price, ago } = useI18n();
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const nameLang = scriptLang(p.name);
  const categoryLang = scriptLang(p.category);

  return (
    <>
      <section className="shell pt-6 pb-14 lg:pt-8 lg:pb-20">
        <nav aria-label={t("product.breadcrumb")} className="mb-6 lg:mb-8">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground bn:text-[14.5px]">
            <li>
              <Link to="/" className="hover:text-foreground hover:underline">
                {t("product.home")}
              </Link>
            </li>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <li>
              <Link
                to={categoryPath(p.category)}
                lang={categoryLang}
                className="hover:text-foreground hover:underline"
              >
                {p.category}
              </Link>
            </li>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <li className="truncate text-foreground" lang={nameLang} aria-current="page">
              {p.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
          <div className="stitched relative aspect-4/5 overflow-hidden rounded-[28px] bg-kantha shadow-[0_24px_50px_-28px_var(--shadow-ink)] md:sticky md:top-24 md:self-start">
            <ProductImage src={p.imageUrl} alt={p.name} eager />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow" lang={categoryLang}>
                {p.category}
              </p>
              {isNew(p.createdAt) && <span className="badge-new">{t("common.new")}</span>}
            </div>

            <h1
              lang={nameLang}
              className="display mt-3 text-[34px] leading-[1.08] bn:leading-[1.35] lg:text-5xl"
            >
              {p.name}
            </h1>

            <p className="price mt-4 text-[32px] text-primary lg:text-4xl">{price(p.priceCents)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("product.addedWhen", { when: ago(p.createdAt) })}
            </p>

            <hr className="stitch-rule my-7" />

            {p.description ? (
              <p
                lang={scriptLang(p.description)}
                className="text-[17px] leading-relaxed whitespace-pre-line text-muted-foreground bn:leading-[1.8]"
              >
                {p.description}
              </p>
            ) : (
              <p className="text-muted-foreground">{t("product.noDescription")}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} size="lg" />
              <Button
                size="lg"
                className="min-w-[220px] flex-1 sm:flex-none"
                onClick={() => {
                  addToCart(p, quantity);
                  setQuantity(1);
                }}
              >
                <ShoppingBag />
                {t("common.addToCart")}
              </Button>
            </div>

            <ul className="mt-8 grid gap-3 rounded-2xl border border-dashed border-stitch bg-kantha/60 p-5 text-[15px] sm:grid-cols-2">
              <li className="flex items-center gap-2.5">
                <Lock className="size-[18px] shrink-0 text-primary" aria-hidden />
                {t("product.trustSecure")}
              </li>
              <li className="flex items-center gap-2.5">
                <Banknote className="size-[18px] shrink-0 text-primary" aria-hidden />
                {t("product.trustCurrency")}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <RelatedProducts product={p} />
    </>
  );
}

/** "More in {category}", topped up with other products when the category is small */
function RelatedProducts({ product }) {
  const { t } = useI18n();
  const all = useProducts();
  if (!all.data) return null;

  const others = all.data.filter((x) => x.id !== product.id);
  const sameCategory = others.filter((x) => x.category === product.category);
  const related = [...sameCategory, ...others.filter((x) => x.category !== product.category)].slice(
    0,
    RELATED_COUNT,
  );
  if (related.length === 0) return null;

  const onlyCategory = sameCategory.length >= 4;

  return (
    <section className="band" aria-labelledby="related-title">
      <div className="shell section">
        <SectionHead
          id="related-title"
          eyebrow={t("product.moreEyebrow")}
          title={
            onlyCategory ? t("product.moreIn", { category: product.category }) : t("product.alsoLike")
          }
        >
          <Link
            className="link-arrow"
            to={onlyCategory ? categoryPath(product.category) : "/products"}
          >
            {t("product.seeAll")}
            <ArrowRight aria-hidden />
          </Link>
        </SectionHead>
        <div className="rail">
          {(onlyCategory ? sameCategory.slice(0, RELATED_COUNT) : related).map((x) => (
            <ProductCard key={x.id} product={x} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPageSkeleton() {
  return (
    <section className="shell pt-6 pb-14 lg:pt-8">
      <Skeleton className="mb-8 h-4 w-56 bg-kantha" />
      <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
        <Skeleton className="aspect-4/5 rounded-[28px] bg-kantha" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24 bg-kantha" />
          <Skeleton className="h-12 w-3/4 bg-kantha" />
          <Skeleton className="h-9 w-28 bg-kantha" />
          <Skeleton className="h-px w-full bg-kantha" />
          <Skeleton className="h-4 w-full bg-kantha" />
          <Skeleton className="h-4 w-5/6 bg-kantha" />
          <Skeleton className="h-13 w-72 rounded-full bg-kantha" />
        </div>
      </div>
    </section>
  );
}
