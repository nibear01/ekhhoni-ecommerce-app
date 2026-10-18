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
 * Taka price from integer poisha (৳1 = 100). Prices are whole Taka, so decimals only appear
 * if a legacy price has poisha: "৳1,290" / "৳১,২৯০" (Bangla uses lakh grouping: ৳১,২৯,০০০).
 */
export function formatPrice(cents, lang) {
  const amount = new Intl.NumberFormat(localeFor(lang), {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
  return `৳${amount}`;
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

/** "18 Oct 2026, 3:42 pm" / "১৮ অক্টো, ২০২৬, ৩:৪২ PM" */
export function formatDateTime(iso, lang, { time = true } = {}) {
  return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    ...(time && { timeStyle: "short" }),
  }).format(new Date(iso));
}
