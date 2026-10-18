import common from "./messages/common";
import home from "./messages/home";
import product from "./messages/product";
import cart from "./messages/cart";
import admin from "./messages/admin";
import { formatNumber, localeFor } from "./format";

// one file per area so pages can be worked on without touching each other's strings
const catalogs = { common, home, product, cart, admin };

/**
 * t("home.heroTitle"), t("cart.reference", { id }).
 * A message is either a string with {placeholders} or a function (params, { num, yearNum }) => string,
 * used for plurals and Bangla counters ("৩টি পণ্য"). Missing Bangla falls back to English.
 */
export function translate(lang, key, params = {}) {
  const dot = key.indexOf(".");
  const catalog = catalogs[key.slice(0, dot)];
  const name = key.slice(dot + 1);
  const message = catalog?.[lang]?.[name] ?? catalog?.en?.[name];

  if (message == null) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing message "${key}"`);
    return key;
  }
  if (typeof message === "function") {
    return message(params, {
      num: (n) => formatNumber(n, lang),
      yearNum: (n) => new Intl.NumberFormat(localeFor(lang), { useGrouping: false }).format(n),
    });
  }
  return message.replace(/\{(\w+)\}/g, (match, p) => (p in params ? String(params[p]) : match));
}
