/** products created within this many days get the "New" badge and appear in "New this week" */
export const NEW_DAYS = 7;

const DAY = 86_400_000;
const BANGLA = /[ঀ-৿]/;

/** admin-entered text (names, categories) is shown as typed; tag it with its script so fonts and screen readers match */
export function scriptLang(text) {
  return BANGLA.test(text ?? "") ? "bn" : "en";
}

export function localeFor(lang) {
  return lang === "bn" ? "bn-BD" : "en-US";
}

/** 12 → "12" / "১২" */
export function formatNumber(n, lang) {
  return new Intl.NumberFormat(localeFor(lang)).format(n);
}

/**
 * USD price from integer cents. "$" stays a prefix in both languages (Polar charges USD).
 * Whole amounts drop the decimals on browse surfaces ("$129" / "$১২৯");
 * pass { fixed: true } for cart maths ("$403.00" / "$৪০৩.০০").
 */
export function formatPrice(cents, lang, { fixed = false } = {}) {
  const whole = !fixed && cents % 100 === 0;
  const amount = new Intl.NumberFormat(localeFor(lang), {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
  return `$${amount}`;
}

export function daysAgo(iso) {
  return Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / DAY));
}

export function isNew(iso) {
  return daysAgo(iso) <= NEW_DAYS;
}

/** "Today" · "Yesterday" · "3 days ago" / "আজ" · "গতকাল" · "৩ দিন আগে" */
export function relativeDay(iso, lang) {
  const text = new Intl.RelativeTimeFormat(localeFor(lang), { numeric: "auto" }).format(
    -daysAgo(iso),
    "day",
  );
  return lang === "en" ? text[0].toUpperCase() + text.slice(1) : text;
}
