import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminEmpty, AdminPageHeader, Panel, RowsSkeleton, StatusPill } from "@/components/admin/AdminBits";
import { ProductImage } from "@/components/ProductImage";
import { QueryError } from "@/components/QueryError";
import { useAdminProducts, useDeleteProduct, useSaveProduct } from "@/hooks/use-admin";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", key: "admin.filterAll" },
  { value: "live", key: "admin.filterLive" },
  { value: "hidden", key: "admin.filterHidden" },
];

export function AdminProducts() {
  const { t, price, num } = useI18n();
  const products = useAdminProducts();
  const save = useSaveProduct();
  const remove = useDeleteProduct();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const rows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return (products.data ?? []).filter(
      (p) =>
        (filter === "all" || (filter === "live") === p.active) &&
        (!needle || [p.name, p.slug, p.category].some((s) => s.toLocaleLowerCase().includes(needle))),
    );
  }, [products.data, query, filter]);

  function toggleActive(p) {
    save.mutate(
      { id: p.id, data: { active: !p.active } },
      {
        onSuccess: () => toast.success(t(p.active ? "admin.madeHidden" : "admin.madeLive")),
        onError: () => toast.error(t("admin.errSave")),
      },
    );
  }

  function deleteProduct(p) {
    if (!window.confirm(t("admin.deleteConfirm", { name: p.name }))) return;
    remove.mutate(p.id, {
      onSuccess: () => toast.success(t("admin.deleted")),
      onError: (e) => toast.error(e.message),
    });
  }

  const total = products.data?.length ?? 0;

  return (
    <>
      <AdminPageHeader
        title={t("admin.productsTitle")}
        description={products.isSuccess ? t("admin.productsSub", { n: total }) : undefined}
      >
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus />
            {t("admin.addProduct")}
          </Link>
        </Button>
      </AdminPageHeader>

      <Panel>
        {total > 0 && (
          <div className="flex flex-col gap-3 border-b border-dashed border-stitch p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="field sm:w-80">
              <Search aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("admin.searchProducts")}
                aria-label={t("admin.searchProducts")}
              />
            </label>
            <div className="flex gap-2" role="group">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className="chip h-9"
                  aria-pressed={filter === f.value}
                  onClick={() => setFilter(f.value)}
                >
                  {t(f.key)}
                </button>
              ))}
            </div>
          </div>
        )}

        {products.isPending ? (
          <RowsSkeleton />
        ) : products.isError ? (
          <div className="p-5">
            <QueryError message={t("admin.loadError")} onRetry={() => products.refetch()} />
          </div>
        ) : total === 0 ? (
          <AdminEmpty title={t("admin.noProducts")} hint={t("admin.noProductsHint")}>
            <Button asChild className="mt-2">
              <Link to="/admin/products/new">
                <Plus />
                {t("admin.addProduct")}
              </Link>
            </Button>
          </AdminEmpty>
        ) : rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-muted-foreground">{t("admin.noMatches")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((p) => (
              <li
                key={p.id}
                className={cn(
                  "grid grid-cols-[3.5rem_1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5 md:grid-cols-[3.5rem_1fr_9rem_7rem_7rem_auto]",
                  !p.active && "bg-muted/40",
                )}
              >
                <Link
                  to={`/admin/products/${p.id}`}
                  className="relative size-14 overflow-hidden rounded-xl bg-kantha"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <ProductImage src={p.imageUrl} />
                </Link>

                <div className="min-w-0">
                  <Link
                    to={`/admin/products/${p.id}`}
                    lang={scriptLang(p.name)}
                    className={cn("block truncate font-semibold hover:underline", !p.active && "text-muted-foreground")}
                  >
                    {p.name}
                  </Link>
                  <p className="truncate text-[13px] text-muted-foreground">
                    <span lang={scriptLang(p.category)}>{p.category}</span> · /{p.slug}
                  </p>
                </div>

                <p className="price hidden text-lg md:block">{price(p.priceCents)}</p>

                <div className="hidden md:block">
                  <StatusPill tone={p.active ? "green" : "muted"}>
                    {t(p.active ? "admin.live" : "admin.hidden")}
                  </StatusPill>
                </div>

                <p className="hidden text-sm text-muted-foreground md:block">
                  {t("admin.colOrders")}: {num(p.orderCount)}
                </p>

                <div className="col-span-3 flex items-center justify-between gap-2 md:col-span-1 md:justify-end">
                  <span className="price text-lg md:hidden">{price(p.priceCents)}</span>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={p.active}
                      onCheckedChange={() => toggleActive(p)}
                      aria-label={t("admin.toggleLive", { name: p.name })}
                      className="mr-2"
                    />
                    <Button asChild variant="ghost" size="icon-sm" aria-label={t("admin.edit")}>
                      <Link to={`/admin/products/${p.id}`}>
                        <Pencil />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteProduct(p)}
                      disabled={p.orderCount > 0 || remove.isPending}
                      title={p.orderCount > 0 ? t("admin.deleteBlocked") : t("admin.delete")}
                      aria-label={t("admin.delete")}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
