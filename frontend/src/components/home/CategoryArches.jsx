import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Lotus } from "@/components/Lotus";
import { SectionHead } from "@/components/SectionHead";
import { categoryPath } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";

/** home-page row: one arch per category, using that category's newest photo */
export function CategoryArches({ categories }) {
  const { t } = useI18n();

  return (
    <section className="section" aria-labelledby="cat-title">
      <div className="shell">
        <SectionHead id="cat-title" eyebrow={t("home.catEyebrow")} title={t("home.catTitle")}>
          <Link className="link-arrow" to="/categories">
            {t("home.allCategories")}
            <ArrowRight aria-hidden />
          </Link>
        </SectionHead>

        <div className="cat-row">
          {categories.map((c) => (
            <CategoryTile key={c.name} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryTile({ category }) {
  const { t } = useI18n();

  return (
    <Link to={categoryPath(category.name)} className="cat-tile">
      <span className="cat-arch">
        {category.imageUrl ? (
          <img src={category.imageUrl} alt="" loading="lazy" />
        ) : (
          <span className="photo-placeholder">
            <Lotus />
          </span>
        )}
      </span>
      <span className="flex flex-col items-center">
        <span className="cat-name" lang={scriptLang(category.name)}>
          {category.name}
        </span>
        <span className="text-[13.5px] text-muted-foreground bn:text-sm">
          {t("common.items", { n: category.count })}
        </span>
      </span>
    </Link>
  );
}
