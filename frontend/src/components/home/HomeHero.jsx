import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lotus } from "@/components/Lotus";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";

/**
 * Forest-green hero. The right side is a "facade" of three arches showing the newest
 * products that have photos (one per category, newest in the middle).
 */
export function HomeHero({ picks, freshCount, hasCategories }) {
  const { t } = useI18n();

  return (
    <section className="hero on-forest" aria-labelledby="hero-title">
      <div className="shell grid gap-10 pt-10 pb-[76px] lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:pt-16 lg:pb-[104px]">
        <div>
          <Link className="hero-chip rise" to={freshCount > 0 ? "/new" : "/products"}>
            <span className="bindu bindu-pulse" aria-hidden="true" />
            {freshCount > 0 ? t("home.heroNewCount", { n: freshCount }) : t("home.heroBrowse")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>

          <h1 id="hero-title" className="display hero-title rise rise-2 mt-[22px] bn:mt-[18px]">
            {t("home.heroTitle1")}
            <br />
            <em>{t("home.heroTitle2")}</em>
          </h1>

          <p className="rise rise-3 mt-[22px] max-w-[33em] text-lg leading-relaxed text-forest-muted bn:mt-4 bn:max-w-[31em] bn:text-[18.5px] bn:leading-[1.8]">
            {t("home.heroSub")}
          </p>

          <div className="rise rise-4 mt-[30px] flex flex-wrap gap-3 *:max-sm:flex-auto">
            <Button asChild variant="cream" size="lg">
              <Link to={freshCount > 0 ? "/new" : "/products"}>
                {freshCount > 0 ? t("home.heroCtaNew") : t("home.heroCtaAll")}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            {hasCategories && (
              <Button asChild variant="line-cream" size="lg">
                <Link to="/categories">{t("home.heroCtaCategories")}</Link>
              </Button>
            )}
          </div>

          <p className="hero-meaning mt-[30px] bn:text-[15.5px]">
            <span>
              {t("home.heroMeaningBefore")}
              <b lang="bn">এখনই</b>
              {t("home.heroMeaningAfter")}
            </span>
          </p>
        </div>

        {picks.length === 3 ? (
          <div className="facade">
            <Lotus className="facade-lotus" />
            {[picks[1], picks[0], picks[2]].map((p, i) => (
              <FacadeArch key={p.id} product={p} main={i === 1} />
            ))}
          </div>
        ) : (
          // not enough photos yet: the lotus medallion carries the composition on its own
          <div className="hidden justify-self-center lg:block" aria-hidden="true">
            <Lotus className="w-[420px] text-zari opacity-50" />
          </div>
        )}
      </div>
      <div className="paar absolute right-0 bottom-5 left-0 opacity-45" aria-hidden="true" />
    </section>
  );
}

function FacadeArch({ product, main }) {
  const { price, ago } = useI18n();

  return (
    <figure className="m-0 flex min-w-0 flex-col gap-4">
      <div className="relative">
        <Link
          to={`/products/${product.slug}`}
          aria-label={product.name}
          className={main ? "arch arch-main stitched" : "arch stitched"}
        >
          <img src={product.imageUrl} alt="" fetchPriority={main ? "high" : "auto"} />
        </Link>
        {main && <span className="ftag-when">{ago(product.createdAt)}</span>}
      </div>
      <figcaption className="ftag">
        <span
          lang={scriptLang(product.name)}
          className={
            main
              ? "truncate text-[13px] leading-snug sm:text-sm"
              : "hidden truncate text-sm leading-snug sm:block"
          }
        >
          {product.name}
        </span>
        <span className="price text-[15px] text-zari sm:text-[17px]">{price(product.priceCents)}</span>
      </figcaption>
    </figure>
  );
}
