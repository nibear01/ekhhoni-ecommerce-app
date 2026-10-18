import { PageHeader } from "@/components/PageHeader";
import { ProductBrowser } from "@/components/home/ProductBrowser";
import { useCatalog } from "@/hooks/use-catalog";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useI18n } from "@/i18n/i18n-context";

/** /products — everything in store, with category chips, search and sort */
export function ProductsPage() {
  const { t } = useI18n();
  const { query, list, categories } = useCatalog();
  const [filters, updateFilters] = useUrlFilters();

  return (
    <>
      <PageHeader
        eyebrow={t("home.allEyebrow")}
        title={t("home.allTitle")}
        description={t("home.productsPageSub")}
        crumbs={[{ label: t("common.navAll") }]}
      />
      <ProductBrowser
        query={query}
        products={list}
        categories={categories.length > 1 ? categories : undefined}
        filters={filters}
        onChange={updateFilters}
      />
    </>
  );
}
