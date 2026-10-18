import { Link } from "react-router";
import { ArrowRight, Banknote, ExternalLink, Package, Plus, ReceiptText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmpty, AdminPageHeader, Panel, RowsSkeleton } from "@/components/admin/AdminBits";
import { OrderRow } from "@/components/admin/OrderRow";
import { QueryError } from "@/components/QueryError";
import { useAdminOrders, useAdminStats } from "@/hooks/use-admin";
import { useI18n } from "@/i18n/i18n-context";

export function AdminDashboard() {
  const { t, price, num } = useI18n();
  const stats = useAdminStats();
  const orders = useAdminOrders();

  const s = stats.data;
  const cards = [
    { icon: Banknote, label: t("admin.statRevenue"), value: s && price(s.orders.revenueCents) },
    { icon: ReceiptText, label: t("admin.statOrders"), value: s && num(s.orders.paid) },
    {
      icon: Package,
      label: t("admin.statProducts"),
      value: s && t("admin.statProductsOf", { active: s.products.active, total: s.products.total }),
    },
    { icon: Users, label: t("admin.statCustomers"), value: s && num(s.customers.total) },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.dashTitle")} description={t("admin.dashSub")}>
        <Button asChild variant="outline">
          <Link to="/" target="_blank">
            <ExternalLink />
            {t("admin.viewStore")}
          </Link>
        </Button>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus />
            {t("admin.addProduct")}
          </Link>
        </Button>
      </AdminPageHeader>

      {stats.isError ? (
        <QueryError message={t("admin.loadError")} onRetry={() => stats.refetch()} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {cards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-[20px] border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                {label}
              </div>
              {value ? (
                <p className="price mt-4 text-[26px] lg:text-[30px]">{value}</p>
              ) : (
                <Skeleton className="mt-4 h-8 w-24 bg-kantha" />
              )}
            </div>
          ))}
        </div>
      )}

      <Panel
        className="mt-8"
        title={t("admin.recentOrders")}
        action={
          <Link to="/admin/orders" className="link-arrow text-sm">
            {t("admin.seeAllOrders")}
            <ArrowRight aria-hidden />
          </Link>
        }
      >
        {orders.isPending ? (
          <RowsSkeleton rows={3} />
        ) : orders.isError ? (
          <div className="p-5">
            <QueryError message={t("admin.loadError")} onRetry={() => orders.refetch()} />
          </div>
        ) : orders.data.length === 0 ? (
          <AdminEmpty title={t("admin.noOrders")} hint={t("admin.noOrdersYet")} />
        ) : (
          <ul className="divide-y divide-border">
            {orders.data.slice(0, 5).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
