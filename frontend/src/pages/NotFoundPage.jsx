import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Lotus } from "@/components/Lotus";
import { useI18n } from "@/i18n/i18n-context";

export function NotFoundPage({ title }) {
  const { t } = useI18n();

  return (
    <div className="shell py-16 lg:py-24">
      <div className="cloth-panel mx-auto max-w-xl">
        <Lotus />
        <p className="price text-sm tracking-[0.2em] text-sindoor bn:tracking-normal">
          {t("cart.notFoundCode")}
        </p>
        <h1 className="display text-3xl">{title ?? t("cart.notFoundTitle")}</h1>
        <p className="text-muted-foreground">{t("cart.notFoundBody")}</p>
        <Button asChild className="mt-2">
          <Link to="/">{t("cart.backToShop")}</Link>
        </Button>
      </div>
    </div>
  );
}
