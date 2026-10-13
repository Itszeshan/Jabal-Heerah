import type { Locale, Localized } from "@/types/content";

export function text(value: Localized, locale: Locale): string {
  return locale === "ar" ? value.ar || value.en : value.en || value.ar;
}
