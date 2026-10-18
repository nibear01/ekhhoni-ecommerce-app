import { useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { SectionHead } from "@/components/SectionHead";
import { useI18n } from "@/i18n/i18n-context";

/** "New this week" on a kantha band; falls back to the latest arrivals when nothing is that recent */
export function NewArrivalsRail({ products, isFresh }) {
  const { t } = useI18n();
  const rail = useRef(null);

  function scroll(direction) {
    const el = rail.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="band" aria-labelledby="new-title">
      <div className="shell section">
        <SectionHead
          id="new-title"
          dot
          eyebrow={t("home.newEyebrow")}
          title={isFresh ? t("home.newTitle") : t("home.latestTitle")}
        >
          <div className="flex items-center gap-2">
            <Link className="link-arrow mr-2" to="/new">
              {t("home.seeAllNew")}
              <ArrowRight aria-hidden />
            </Link>
            {products.length > 4 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden lg:inline-flex"
                  onClick={() => scroll(-1)}
                  aria-label={t("home.railPrev")}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden lg:inline-flex"
                  onClick={() => scroll(1)}
                  aria-label={t("home.railNext")}
                >
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
        </SectionHead>

        <div className="relative">
          <div ref={rail} className="rail">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} showWhen />
            ))}
          </div>
          {products.length > 4 && (
            <div
              className="pointer-events-none absolute top-0 -right-8 bottom-0 hidden w-30 bg-linear-to-r from-transparent to-kantha to-85% lg:block"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </section>
  );
}
