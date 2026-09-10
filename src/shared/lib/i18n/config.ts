export const LOCALES = ["th", "en", "cn"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "th";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  th: "TH",
  en: "EN",
  cn: "CN",
};

export const LOCALE_NAMES: Record<Locale, { th: string; en: string; cn: string }> = {
  th: { th: "ไทย", en: "Thai", cn: "泰语" },
  en: { th: "อังกฤษ", en: "English", cn: "英语" },
  cn: { th: "จีน", en: "Chinese", cn: "中文" },
};

export function asLocale(value: string | undefined | null): Locale {
  if (value === "en") return "en";
  if (value === "cn" || value === "zh" || value === "zh-CN") return "cn";
  return "th";
}
