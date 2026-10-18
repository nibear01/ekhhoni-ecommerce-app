import { PageHeader } from "@/components/PageHeader";
import { EmptyPanel } from "@/components/home/ProductBrowser";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { QueryError } from "@/components/QueryError";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/i18n-context";
import { NEW_DAYS } from "@/i18n/format";

/** /new — this week's arrivals (or the latest few when nothing is that recent) */
export function NewArrivalsPage() {
  const { t } = useI18n();
  const { query, fresh, arrivals } = useCatalog();
  const isFresh = fresh.length > 0;

  return (
    <>
      <PageHeader
        eyebrow={t("home.newEyebrow")}
        title={isFresh || query.isPending ? t("home.newTitle") : t("home.latestTitle")}
        description={
          query.isSuccess
            ? isFresh
              ? t("home.newPageSub", { days: NEW_DAYS })
              : t("home.latestPageSub")
            : undefined
        }
        crumbs={[{ label: t("common.navNew") }]}
      />
      <section className="shell py-12 lg:py-16">
        {query.isPending ? (
          <div className="product-grid">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : query.isError ? (
          <QueryError message={t("home.loadError")} onRetry={() => query.refetch()} />
        ) : arrivals.length === 0 ? (
          <EmptyPanel title={t("home.emptyStore")} hint={t("home.emptyStoreHint")} />
        ) : (
          <div className="product-grid">
            {arrivals.map((p) => (
              <ProductCard key={p.id} product={p} showWhen />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
