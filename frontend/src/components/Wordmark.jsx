import { Link } from "react-router";
import { useI18n } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";

/** "Ekhhoni • এখনই" — the Latin name, a red bindu, and the Bangla word it comes from */
export function Wordmark({ className }) {
  const { t } = useI18n();

  return (
    <Link
      to="/"
      aria-label={t("common.homeLabel")}
      className={cn("inline-flex items-center gap-[7px] whitespace-nowrap lg:gap-[9px]", className)}
    >
      <span className="wm-latin" lang="en">
        Ekhhoni
      </span>
      <span className="wm-dot" aria-hidden="true" />
      <span className="wm-bangla" lang="bn">
        এখনই
      </span>
    </Link>
  );
}
