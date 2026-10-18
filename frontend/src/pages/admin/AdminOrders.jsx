import { AdminEmpty, AdminPageHeader, Panel, RowsSkeleton } from "@/components/admin/AdminBits";
import { OrderRow } from "@/components/admin/OrderRow";
import { QueryError } from "@/components/QueryError";
import { useAdminOrders } from "@/hooks/use-admin";
import { useI18n } from "@/i18n/i18n-context";

export function AdminOrders() {
  const { t } = useI18n();
  const orders = useAdminOrders();

  return (
    <>
      <AdminPageHeader title={t("admin.ordersTitle")} description={t("admin.ordersSub")} />
      <Panel>
        {orders.isPending ? (
          <RowsSkeleton />
        ) : orders.isError ? (
          <div className="p-5">
            <QueryError message={t("admin.loadError")} onRetry={() => orders.refetch()} />
          </div>
        ) : orders.data.length === 0 ? (
          <AdminEmpty title={t("admin.noOrders")} hint={t("admin.noOrdersHint")} />
        ) : (
          <ul className="divide-y divide-border">
            {orders.data.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
