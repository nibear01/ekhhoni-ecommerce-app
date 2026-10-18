import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/i18n-context";

/**
 * Title band for list pages (New, Categories, a category, All products):
 * breadcrumb, eyebrow, serif h1 and a one-line description on kantha cloth.
 */
export function PageHeader({ eyebrow, title, titleLang, description, crumbs = [], children }) {
  const { t } = useI18n();

  return (
    <header className="band">
      <div className="shell pt-10 pb-12 lg:pt-14 lg:pb-16">
        <nav aria-label={t("product.breadcrumb")} className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground bn:text-[14.5px]">
            <li>
              <Link to="/" className="hover:text-foreground hover:underline">
                {t("common.navHome")}
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5" aria-hidden />
                {c.to ? (
                  <Link to={c.to} lang={c.lang} className="hover:text-foreground hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span lang={c.lang} aria-current="page" className="text-foreground">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 lang={titleLang} className="display mt-3 text-[40px] bn:text-[34px] lg:text-6xl bn:lg:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-[17px] text-muted-foreground bn:leading-[1.8]">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
