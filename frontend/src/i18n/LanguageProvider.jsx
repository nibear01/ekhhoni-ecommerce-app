import { useCallback, useEffect, useMemo, useState } from "react";
import { I18nContext } from "./i18n-context";
import { translate } from "./translate";
import { formatNumber, formatPrice, relativeDay } from "./format";

const STORAGE_KEY = "ekhhoni:lang";

/** saved choice → browser language (bn* → Bangla) → English */
function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "bn") return saved;
  } catch {
    // storage unavailable (private mode); fall through to the browser language
  }
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return prefs.some((l) => l?.toLowerCase().startsWith("bn")) ? "bn" : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // only an explicit choice is saved, so first-time visitors keep following their browser
  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // the choice still applies for this visit
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
      price: (cents, opts) => formatPrice(cents, lang, opts),
      num: (n) => formatNumber(n, lang),
      ago: (iso) => relativeDay(iso, lang),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
