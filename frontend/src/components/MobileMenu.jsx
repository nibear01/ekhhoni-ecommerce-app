import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Show, UserButton } from "@clerk/react";
import { Dialog } from "radix-ui";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useCart } from "@/cart/cart-context";
import { useI18n } from "@/i18n/i18n-context";
import { NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** slide-over menu for phones and tablets: pages, search, account and language */
export function MobileMenu() {
  const { t, num } = useI18n();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("common.menu")}>
          <Menu className="size-6" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="on-forest buti-bg fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-forest text-forest-foreground shadow-2xl data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
        >
          <div className="flex items-center justify-between px-5 pt-4">
            <Dialog.Title className="text-xs font-semibold tracking-[0.16em] text-zari uppercase bn:text-[15px] bn:tracking-normal bn:normal-case">
              {t("common.menu")}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="line-cream" size="icon-sm" aria-label={t("common.closeMenu")}>
                <X />
              </Button>
            </Dialog.Close>
          </div>

          <form role="search" onSubmit={onSearch} className="field mx-5 mt-5">
            <Search aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("common.searchPlaceholder")}
              aria-label={t("common.searchLabel")}
              className="!border-forest-foreground/25 !bg-forest-foreground/10 text-forest-foreground placeholder:!text-forest-muted"
            />
          </form>

          <nav aria-label={t("common.navMain")} className="mt-4 px-3">
            <ul>
              {NAV_LINKS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={close}
                    className={({ isActive }) =>
                      cn(
                        "display flex items-center justify-between rounded-xl px-3 py-3 text-[26px] transition-colors hover:bg-forest-foreground/10 bn:text-[23px]",
                        isActive && "text-zari",
                      )
                    }
                  >
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to="/cart"
                  onClick={close}
                  className="display flex items-center justify-between rounded-xl px-3 py-3 text-[26px] transition-colors hover:bg-forest-foreground/10 bn:text-[23px]"
                >
                  {t("common.footerCart")}
                  {count > 0 && (
                    <span className="rounded-full bg-sindoor px-2.5 font-sans text-sm font-bold text-sindoor-foreground">
                      {num(count)}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="paar my-5 opacity-60" aria-hidden="true" />

          <div className="mt-auto flex flex-col gap-3 px-5 pb-6">
            <Show when="signed-out">
              <Button asChild variant="cream" size="lg">
                <Link to="/sign-up" onClick={close}>
                  {t("common.signUp")}
                </Link>
              </Button>
              <Button asChild variant="line-cream" size="lg">
                <Link to="/sign-in" onClick={close}>
                  {t("common.signIn")}
                </Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-3 rounded-2xl border border-forest-foreground/20 p-3">
                <UserButton />
                <span className="font-medium">{t("common.account")}</span>
              </div>
            </Show>
            <LanguageSwitch long showIcon className="mt-2 self-start" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
