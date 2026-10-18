import { Outlet, ScrollRestoration } from "react-router";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocalizedClerkProvider } from "@/i18n/LocalizedClerkProvider";

const toastClasses = {
  toast:
    "!rounded-2xl !border-border !bg-popover !font-sans !text-popover-foreground !shadow-[0_18px_40px_-16px_var(--shadow-ink)]",
  title: "!text-[15px] !font-semibold",
  description: "!text-muted-foreground",
  actionButton:
    "!h-9 !rounded-full !bg-primary !px-4 !text-sm !font-semibold !text-primary-foreground",
  icon: "!text-primary",
};

export function RootLayout() {
  return (
    <LocalizedClerkProvider>
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        <Toaster position="bottom-right" theme="system" toastOptions={{ classNames: toastClasses }} />
        <ScrollRestoration />
      </div>
    </LocalizedClerkProvider>
  );
}
