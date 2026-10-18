import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeHero } from "@/components/home/HomeHero";
import { CategoryArches } from "@/components/home/CategoryArches";
import { NewArrivalsRail } from "@/components/home/NewArrivalsRail";
import { EmptyPanel } from "@/components/home/ProductBrowser";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { QueryError } from "@/components/QueryError";
import { SectionHead } from "@/components/SectionHead";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/i18n-context";

const LATEST_COUNT = 8;

/** landing page: a taste of each section, each linking to its own page */
export function ShopPage() {
  const { t } = useI18n();
  const { query, list, categories, fresh, arrivals, heroPicks } = useCatalog();

  return (
    <>
      <HomeHero picks={heroPicks} freshCount={fresh.length} hasCategories={categories.length > 1} />
      {categories.length > 1 && <CategoryArches categories={categories} />}
      {arrivals.length > 0 && <NewArrivalsRail products={arrivals} isFresh={fresh.length > 0} />}

      <section className="section" aria-labelledby="latest-title">
        <div className="shell">
          <SectionHead id="latest-title" eyebrow={t("home.latestGridEyebrow")} title={t("home.latestGridTitle")}>
            {list.length > 0 && (
              <Link className="link-arrow" to="/products">
                {t("home.seeEverything")}
                <ArrowRight aria-hidden />
              </Link>
            )}
          </SectionHead>

          {query.isPending ? (
            <div className="product-grid">
              {Array.from({ length: LATEST_COUNT }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : query.isError ? (
            <QueryError message={t("home.loadError")} onRetry={() => query.refetch()} />
          ) : list.length === 0 ? (
            <EmptyPanel title={t("home.emptyStore")} hint={t("home.emptyStoreHint")} />
          ) : (
            <>
              <div className="product-grid">
                {list.slice(0, LATEST_COUNT).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="mt-12 flex justify-center">
                <Button asChild variant="outline" size="lg">
                  <Link to="/products">
                    {t("home.browseAll", { n: list.length })}
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
