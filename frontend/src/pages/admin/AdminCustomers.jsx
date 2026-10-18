import { toast } from "sonner";
import { AdminEmpty, AdminPageHeader, Panel, RowsSkeleton } from "@/components/admin/AdminBits";
import { QueryError } from "@/components/QueryError";
import { useAdminUsers, useUpdateRole } from "@/hooks/use-admin";
import { useMe } from "@/hooks/use-me";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";

const ROLES = [
  { value: "customer", key: "admin.roleCustomer" },
  { value: "support", key: "admin.roleSupport" },
  { value: "admin", key: "admin.roleAdmin" },
];

export function AdminCustomers() {
  const { t, price, num, date } = useI18n();
  const users = useAdminUsers();
  const me = useMe();
  const updateRole = useUpdateRole();

  function changeRole(user, role) {
    updateRole.mutate(
      { id: user.id, role },
      {
        onSuccess: () => toast.success(t("admin.roleChanged")),
        onError: () => toast.error(t("admin.roleFailed")),
      },
    );
  }

  return (
    <>
      <AdminPageHeader title={t("admin.customersTitle")} description={t("admin.customersSub")} />
      <Panel>
        {users.isPending ? (
          <RowsSkeleton />
        ) : users.isError ? (
          <div className="p-5">
            <QueryError message={t("admin.loadError")} onRetry={() => users.refetch()} />
          </div>
        ) : users.data.length === 0 ? (
          <AdminEmpty title={t("admin.noCustomers")} />
        ) : (
          <ul className="divide-y divide-border">
            {users.data.map((u) => {
              const isMe = u.id === me.data?.id;
              const name = u.displayName || u.email.split("@")[0];
              return (
                <li
                  key={u.id}
                  className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5 md:grid-cols-[2.5rem_1fr_8rem_7rem_8rem_10rem]"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-accent-foreground uppercase">
                    {name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-semibold" lang={scriptLang(name)}>
                      {name}
                      {isMe && (
                        <span className="rounded-full bg-zari/20 px-2 text-xs font-semibold text-zari-ink">
                          {t("admin.you")}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[13px] text-muted-foreground">{u.email || "—"}</p>
                  </div>
                  <p className="hidden text-sm text-muted-foreground md:block">
                    {date(u.createdAt, { time: false })}
                  </p>
                  <p className="hidden text-sm md:block">
                    {t("admin.colOrders")}: {num(u.orders)}
                  </p>
                  <p className="price hidden md:block">{price(u.spentCents)}</p>
                  <label className="field col-span-3 md:col-span-1">
                    <span className="sr-only">{t("admin.colRole")}</span>
                    <select
                      value={u.role}
                      disabled={isMe || updateRole.isPending}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="!h-10 !px-4"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {t(r.key)}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
