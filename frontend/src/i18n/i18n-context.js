import { createContext, useContext } from "react";

export const I18nContext = createContext(null);

export const LANGS = ["en", "bn"];

/** { lang, setLang, t, price, num, ago } — see LanguageProvider */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}
