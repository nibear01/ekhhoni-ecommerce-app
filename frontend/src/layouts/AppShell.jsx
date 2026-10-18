import { Outlet, ScrollRestoration } from "react-router";
import { Toaster } from "sonner";
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

/** shared by the storefront and the admin portal: auth, toasts, scroll restoration */
export function AppShell() {
  return (
    <LocalizedClerkProvider>
      <Outlet />
      <Toaster position="bottom-right" theme="system" toastOptions={{ classNames: toastClasses }} />
      <ScrollRestoration />
    </LocalizedClerkProvider>
  );
}
