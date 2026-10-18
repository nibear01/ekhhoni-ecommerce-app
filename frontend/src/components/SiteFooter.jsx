import { Link } from "react-router";
import { Show } from "@clerk/react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Wordmark } from "@/components/Wordmark";
import { categoryPath } from "@/hooks/use-catalog";
import { useCategories } from "@/hooks/use-products";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";

export function SiteFooter() {
  const { t } = useI18n();
  const categories = useCategories();

  return (
    <footer className="site-footer on-forest">
      <div className="paar mt-[18px] opacity-70" aria-hidden="true" />

      <div className="shell grid gap-10 py-12 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-8 md:pt-16 md:pb-14">
        <div>
          <Wordmark className="wordmark-lg text-forest-foreground" />
          <dl className="definition mt-[22px]">
            <dt className="flex flex-wrap items-baseline gap-2.5">
              <b lang="bn">এখনই</b>
              <span lang="en" className="text-sm text-forest-muted">
                [e·kho·ni]
              </span>
            </dt>
            <dd className="mt-1.5 text-[15px] leading-relaxed bn:text-[15.5px] bn:leading-[1.7]">
              <i className="text-forest-muted">{t("common.definitionPos")}</i> {t("common.definitionBefore")}
              <span lang="bn">“এখনই কিনুন”</span>
              {t("common.definitionAfter")}
            </dd>
          </dl>
          <LanguageSwitch long showIcon className="mt-[22px]" />
        </div>

        <FooterColumn title={t("common.footerShop")}>
          <FooterLink to="/products">{t("common.navAll")}</FooterLink>
          <FooterLink to="/new">{t("common.footerNew")}</FooterLink>
          <FooterLink to="/categories">{t("common.footerCategories")}</FooterLink>
          <FooterLink to="/cart">{t("common.footerCart")}</FooterLink>
        </FooterColumn>

        {categories.data?.length > 0 && (
          <FooterColumn title={t("common.footerCategories")}>
            {categories.data.map((c) => (
              <FooterLink key={c} to={categoryPath(c)} lang={scriptLang(c)}>
                {c}
              </FooterLink>
            ))}
          </FooterColumn>
        )}

        <FooterColumn title={t("common.footerHelp")}>
          <Show when="signed-out">
            <FooterLink to="/sign-in">{t("common.signIn")}</FooterLink>
            <FooterLink to="/sign-up">{t("common.createAccount")}</FooterLink>
          </Show>
          <li className="footer-link opacity-80 hover:no-underline">
            {t("common.footerChat")}
            <span className="ml-1.5 rounded-full bg-zari/20 px-[7px] py-px align-[1px] text-[11.5px] font-semibold text-zari bn:text-[12.5px]">
              {t("common.soon")}
            </span>
          </li>
        </FooterColumn>
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-x-[18px] gap-y-2 border-t border-forest-foreground/15 pt-5 pb-7 text-sm text-forest-muted bn:text-[14.5px]">
        <p>{t("common.copyright", { year: new Date().getFullYear() })}</p>
        <p>{t("common.footerFacts")}</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <nav aria-label={title}>
      <h2 className="footer-heading">{title}</h2>
      <ul className="grid gap-[9px]">{children}</ul>
    </nav>
  );
}

function FooterLink({ to, lang, children }) {
  return (
    <li>
      <Link to={to} lang={lang} className="footer-link">
        {children}
      </Link>
    </li>
  );
}
