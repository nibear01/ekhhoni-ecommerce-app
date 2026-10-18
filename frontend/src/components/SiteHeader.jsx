import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Show, UserButton } from "@clerk/react";
import { LayoutDashboard, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { MobileMenu } from "@/components/MobileMenu";
import { NAV_LINKS } from "@/lib/nav";
import { Wordmark } from "@/components/Wordmark";
import { useCart } from "@/cart/cart-context";
import { useIsAdmin } from "@/hooks/use-me";
import { useProducts } from "@/hooks/use-products";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t, num } = useI18n();
  const { count } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const isAdmin = useIsAdmin();

  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <>
      <a href="#main" className="skip-link">
        {t("common.skip")}
      </a>
      <AnnouncementBar />

      <header className="site-header">
        <div className="shell flex h-15.5 items-center gap-1.5 lg:h-18.5 lg:gap-3">
          <Wordmark className="mr-auto text-primary lg:mr-2 dark:text-foreground" />

          <nav aria-label={t("common.navMain")} className="mr-auto hidden gap-1 lg:flex">
            {NAV_LINKS.slice(1).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3.5 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground bn:text-[15.5px]",
                    isActive && "bg-accent text-accent-foreground",
                  )
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <form role="search" onSubmit={onSearch} className="field hidden w-56 lg:flex xl:w-72">
            <Search aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("common.searchPlaceholder")}
              aria-label={t("common.searchLabel")}
            />
          </form>

          <LanguageSwitch className="mx-1 lg:mx-0" />

          <Show when="signed-out">
            <Button asChild variant="ghost" className="hidden lg:inline-flex">
              <Link to="/sign-in">{t("common.signIn")}</Link>
            </Button>
            <Button asChild size="sm" className="hidden min-h-10 lg:inline-flex">
              <Link to="/sign-up">{t("common.signUp")}</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            {isAdmin && (
              <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
                <Link to="/admin">
                  <LayoutDashboard />
                  {t("admin.admin")}
                </Link>
              </Button>
            )}
            <div className="hidden size-11 place-items-center lg:grid">
              <UserButton />
            </div>
          </Show>

          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/cart" aria-label={t("common.cartLabel", { n: count })}>
              <ShoppingBag className="size-5.5" />
              {count > 0 && (
                <span className="count-pip" aria-hidden="true">
                  {count > 99 ? `${num(99)}+` : num(count)}
                </span>
              )}
            </Link>
          </Button>

          <MobileMenu />
        </div>
      </header>
    </>
  );
}

/** thin forest strip: the newest product (derived from data, never a claim) + true store facts */
function AnnouncementBar() {
  const { t, ago } = useI18n();
  const products = useProducts();
  const newest = products.data?.[0];

  return (
    <div className="announce on-forest">
      <div className="shell flex min-h-9.5 items-center justify-center gap-6 lg:justify-between">
        <p className="flex min-w-0 items-center gap-2.5">
          {newest ? (
            <>
              <span className="bindu bindu-pulse" aria-hidden="true" />
              <span className="truncate">
                {t("common.announceNewest")}{" "}
                <Link to={`/products/${newest.slug}`} lang={scriptLang(newest.name)}>
                  {newest.name}
                </Link>{" "}
                · {t("common.announceAdded", { when: ago(newest.createdAt) })}
              </span>
            </>
          ) : (
            <span className="lg:hidden">{t("common.announceSecure")}</span>
          )}
        </p>
        <p className="hidden items-center gap-2.5 text-forest-muted lg:flex">
          <span>{t("common.announceCurrency")}</span>
          <span aria-hidden="true">·</span>
          <span>{t("common.announceSecure")}</span>
        </p>
      </div>
    </div>
  );
}
