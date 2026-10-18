import { Languages } from "lucide-react";
import { LANGS, useI18n } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";

const LABELS = {
  en: { short: "EN", long: "English" },
  bn: { short: "বাংলা", long: "বাংলা" },
};

/** EN | বাংলা toggle. Each option is labelled in its own language so it's findable either way. */
export function LanguageSwitch({ long = false, showIcon = false, className }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div role="group" aria-label={t("common.langLabel")} className={cn("lang-switch", className)}>
      {showIcon && <Languages className="mx-1.5 size-4 text-muted-foreground" aria-hidden />}
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          title={LABELS[code].long}
          onClick={() => setLang(code)}
        >
          {long ? LABELS[code].long : LABELS[code].short}
        </button>
      ))}
    </div>
  );
}
