import { PageHeader } from "@/components/PageHeader";
import { CategoryTile } from "@/components/home/CategoryArches";
import { EmptyPanel } from "@/components/home/ProductBrowser";
import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/i18n-context";

/** /categories — every category as an arch tile */
export function CategoriesPage() {
  const { t } = useI18n();
  const { query, categories } = useCatalog();

  return (
    <>
      <PageHeader
        eyebrow={t("home.catEyebrow")}
        title={t("home.catPageTitle")}
        description={t("home.catPageSub")}
        crumbs={[{ label: t("common.navCategories") }]}
      />
      <section className="shell py-12 lg:py-16">
        {query.isPending ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-4/5 rounded-t-full bg-kantha" />
            ))}
          </div>
        ) : query.isError ? (
          <QueryError message={t("home.loadError")} onRetry={() => query.refetch()} />
        ) : categories.length === 0 ? (
          <EmptyPanel title={t("home.emptyStore")} hint={t("home.emptyStoreHint")} />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {categories.map((c) => (
              <CategoryTile key={c.name} category={c} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
