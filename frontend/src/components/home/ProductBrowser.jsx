import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lotus } from "@/components/Lotus";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { QueryError } from "@/components/QueryError";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";

const PAGE_SIZE = 16;

const SORTS = {
  newest: { key: "home.sortNewest", fn: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  low: { key: "home.sortLow", fn: (a, b) => a.priceCents - b.priceCents },
  high: { key: "home.sortHigh", fn: (a, b) => b.priceCents - a.priceCents },
  name: { key: "home.sortName", fn: (a, b) => a.name.localeCompare(b.name) },
};

/**
 * Searchable, sortable product grid. Filtering is client-side; the page keeps the filters in the URL
 * (?category=&q=&sort=) so results can be shared and survive a refresh.
 * Pass `categories` to show category chips; omit it on a single-category page.
 */
export function ProductBrowser({ query, products, categories, filters, onChange }) {
  const { t, num } = useI18n();
  const { category = "", q = "", sort = "newest" } = filters;
  // remember how far the shopper has paged per filter combination; a new filter starts at one page
  const filterKey = `${category}|${q}|${sort}`;
  const [paging, setPaging] = useState({ key: filterKey, limit: PAGE_SIZE });
  const limit = paging.key === filterKey ? paging.limit : PAGE_SIZE;

  const results = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return products
      .filter((p) => !category || p.category === category)
      .filter(
        (p) =>
          !needle ||
          p.name.toLocaleLowerCase().includes(needle) ||
          p.category.toLocaleLowerCase().includes(needle),
      )
      .sort((SORTS[sort] ?? SORTS.newest).fn);
  }, [products, category, q, sort]);

  const shown = results.slice(0, limit);
  const total = products.length;

  return (
    <section className="shell py-10 lg:py-14">
      {total > 0 && (
        <div className="mb-8 flex flex-col gap-4 lg:mb-10">
          {categories && (
            <div className="scroll-row lg:mx-0 lg:flex-wrap lg:overflow-visible lg:p-0" role="toolbar" aria-label={t("home.filterLabel")}>
              <Chip active={!category} onClick={() => onChange({ category: "" })} label={t("home.chipAll")} count={num(total)} />
              {categories.map((c) => (
                <Chip
                  key={c.name}
                  active={category === c.name}
                  onClick={() => onChange({ category: c.name })}
                  label={c.name}
                  lang={scriptLang(c.name)}
                  count={num(c.count)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="order-2 text-[15px] text-muted-foreground sm:order-1 bn:text-[15.5px]" aria-live="polite">
              {t("common.products", { n: results.length })}
            </p>
            <div className="order-1 flex flex-wrap items-center gap-2.5 sm:order-2 sm:flex-nowrap">
              <label className="field w-full sm:w-64">
                <Search aria-hidden />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => onChange({ q: e.target.value })}
                  placeholder={t("home.searchPlaceholder")}
                  aria-label={t("home.searchLabel")}
                />
              </label>
              <label className="field flex-1 sm:flex-none">
                <ArrowUpDown aria-hidden />
                <select value={sort} onChange={(e) => onChange({ sort: e.target.value })} aria-label={t("home.sortLabel")}>
                  {Object.entries(SORTS).map(([value, s]) => (
                    <option key={value} value={value}>
                      {t(s.key)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="field-end" aria-hidden />
              </label>
            </div>
          </div>
        </div>
      )}

      {query.isPending ? (
        <div className="product-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <QueryError message={t("home.loadError")} onRetry={() => query.refetch()} />
      ) : total === 0 ? (
        <EmptyPanel title={t("home.emptyStore")} hint={t("home.emptyStoreHint")} />
      ) : results.length === 0 ? (
        q ? (
          <EmptyPanel
            title={t("home.noMatch", { q })}
            hint={t("home.noMatchHint")}
            action={t("home.clearSearch")}
            onAction={() => onChange({ q: "" })}
          />
        ) : (
          <EmptyPanel
            title={t("home.noneInCategory", { category })}
            hint={t("home.noneInCategoryHint")}
            action={t("home.showAll")}
            onAction={() => onChange({ category: "" })}
          />
        )
      ) : (
        <>
          <div className="product-grid">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {results.length > PAGE_SIZE && (
            <div className="mt-12 flex flex-col items-center gap-3.5">
              <p className="text-[14.5px] text-muted-foreground">
                {t("home.showing", { shown: shown.length, total: results.length })}
              </p>
              <div className="h-0.75 w-55 overflow-hidden rounded-full bg-border" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${(shown.length / results.length) * 100}%` }}
                />
              </div>
              {results.length > shown.length && (
                <Button variant="outline" size="lg" onClick={() => setPaging({ key: filterKey, limit: limit + PAGE_SIZE })}>
                  {t("home.showMore", { n: Math.min(PAGE_SIZE, results.length - shown.length) })}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Chip({ active, label, count, lang, onClick }) {
  return (
    <button type="button" className="chip" aria-pressed={active} onClick={onClick}>
      <span lang={lang}>{label}</span>
      <span className="n">{count}</span>
    </button>
  );
}

export function EmptyPanel({ title, hint, action, onAction }) {
  return (
    <div className="cloth-panel">
      <Lotus />
      <p className="text-lg font-semibold">{title}</p>
      {hint && <p className="text-muted-foreground">{hint}</p>}
      {action && (
        <Button variant="outline" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}
