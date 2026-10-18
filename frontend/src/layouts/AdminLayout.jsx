import { Link, NavLink, Outlet } from "react-router";
import { Show, UserButton, useAuth } from "@clerk/react";
import { ExternalLink, LayoutDashboard, Loader2, Package, ReceiptText, ShieldAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Lotus } from "@/components/Lotus";
import { Wordmark } from "@/components/Wordmark";
import { useMe } from "@/hooks/use-me";
import { useI18n } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", key: "admin.navDashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", key: "admin.navProducts", icon: Package },
  { to: "/admin/orders", key: "admin.navOrders", icon: ReceiptText },
  { to: "/admin/customers", key: "admin.navCustomers", icon: Users },
];

export function AdminLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const me = useMe();
  const { t } = useI18n();

  if (!isLoaded || (isSignedIn && me.isPending)) {
    return (
      <Gate>
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-muted-foreground">{t("admin.checking")}</p>
      </Gate>
    );
  }

  if (!isSignedIn) {
    return (
      <Gate>
        <Lotus className="w-20 text-stitch" />
        <h1 className="display text-3xl">{t("admin.signInTitle")}</h1>
        <p className="max-w-sm text-muted-foreground">{t("admin.signInBody")}</p>
        <Button asChild size="lg">
          <Link to="/sign-in?redirect_url=/admin">{t("common.signIn")}</Link>
        </Button>
      </Gate>
    );
  }

  if (me.isError || me.data?.role !== "admin") {
    return (
      <Gate>
        <ShieldAlert className="size-12 text-sindoor" aria-hidden />
        <h1 className="display text-3xl">{t("admin.deniedTitle")}</h1>
        {me.data && <p className="text-muted-foreground">{t("admin.deniedBody", { email: me.data.email })}</p>}
        <p className="max-w-md rounded-xl border border-dashed border-stitch bg-kantha p-4 text-left text-sm text-muted-foreground">
          {t("admin.deniedHow")}
        </p>
        <Button asChild variant="outline">
          <Link to="/">{t("admin.backToStore")}</Link>
        </Button>
      </Gate>
    );
  }

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="on-forest buti-bg flex flex-col bg-forest text-forest-foreground lg:sticky lg:top-0 lg:h-svh">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 pt-4 lg:px-6 lg:pt-7">
          <Wordmark className="text-forest-foreground" />
          <span className="rounded-full bg-zari/20 px-2.5 py-0.5 text-xs font-semibold text-zari bn:text-[13px]">
            {t("admin.admin")}
          </span>
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <LanguageSwitch />
            <UserButton />
          </div>
        </div>

        <nav aria-label={t("admin.adminPortal")} className="mt-4 lg:mt-10">
          <ul className="scroll-row px-4 pb-3 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-3 lg:pb-0">
            {NAV.map(({ to, key, icon: Icon, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-full px-4 py-2 text-[15px] font-medium text-forest-muted transition-colors hover:bg-forest-foreground/10 hover:text-forest-foreground lg:rounded-xl lg:py-2.5 bn:text-[15.5px]",
                      isActive && "bg-forest-foreground/15 text-forest-foreground",
                    )
                  }
                >
                  <Icon className="size-[18px]" aria-hidden />
                  {t(key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto hidden flex-col gap-4 p-6 lg:flex">
          <div className="paar -mx-6 opacity-40" aria-hidden="true" />
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-forest-muted hover:text-forest-foreground">
            <ExternalLink className="size-4" aria-hidden />
            {t("admin.viewStore")}
          </Link>
          <LanguageSwitch long showIcon className="self-start" />
          <Show when="signed-in">
            <div className="flex min-w-0 items-center gap-3">
              <UserButton />
              <span className="truncate text-sm text-forest-muted">{me.data.email}</span>
            </div>
          </Show>
        </div>
      </aside>

      <main id="main" className="min-w-0">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Gate({ children }) {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">{children}</div>
    </main>
  );
}
