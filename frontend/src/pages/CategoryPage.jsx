import { useParams } from "react-router";
import { PageHeader } from "@/components/PageHeader";
import { ProductBrowser } from "@/components/home/ProductBrowser";
import { useCatalog } from "@/hooks/use-catalog";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";

/** /categories/:category — one category's products, with search and sort */
export function CategoryPage() {
  const { category } = useParams();
  const { t } = useI18n();
  const { query, list } = useCatalog();
  const [filters, updateFilters] = useUrlFilters();

  const products = list.filter((p) => p.category === category);
  const lang = scriptLang(category);

  return (
    <>
      <PageHeader
        eyebrow={t("home.categoryEyebrow")}
        title={category}
        titleLang={lang}
        description={
          query.isSuccess
            ? products.length > 0
              ? t("common.products", { n: products.length })
              : t("home.categoryMissing")
            : undefined
        }
        crumbs={[
          { label: t("common.navCategories"), to: "/categories" },
          { label: category, lang },
        ]}
      />
      <ProductBrowser
        query={query}
        products={products}
        filters={{ q: filters.q, sort: filters.sort }}
        onChange={updateFilters}
      />
    </>
  );
}
