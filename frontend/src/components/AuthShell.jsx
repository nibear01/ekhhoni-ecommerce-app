import { Lotus } from "@/components/Lotus";
import { useI18n } from "@/i18n/i18n-context";

/** two-panel frame for /sign-in and /sign-up: brand panel on the left, Clerk's form on the right */
export function AuthShell({ title, description, children }) {
  const { t } = useI18n();

  return (
    <div className="shell py-10 lg:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_60px_-40px_var(--shadow-ink)] lg:grid-cols-[1fr_1.1fr]">
        <aside className="hero on-forest relative hidden flex-col justify-between p-10 lg:flex" aria-hidden="true">
          <Lotus className="facade-lotus !top-auto -bottom-24 !left-auto -right-24 !w-[420px] !translate-x-0" />
          <p className="wm-bangla text-[34px] text-zari">এখনই</p>
          <p className="display text-[44px] leading-[1.05] bn:leading-[1.35]">{t("common.authAside")}</p>
          <div className="paar -mx-10 opacity-45" />
        </aside>

        <div className="flex flex-col items-center px-4 py-10 sm:px-10">
          <h1 className="display text-center text-[32px] lg:text-4xl">{title}</h1>
          <p className="mt-2 max-w-sm text-center text-muted-foreground bn:leading-[1.8]">{description}</p>
          <div className="mt-8 flex w-full justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
