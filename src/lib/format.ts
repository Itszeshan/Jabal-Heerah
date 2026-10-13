import type { Locale } from "@/types/content";

const numberFormat = new Intl.NumberFormat("en-AE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAed(value: number, locale: Locale): string {
  const amount = numberFormat.format(value);
  return locale === "ar" ? `${amount} د.إ` : `AED ${amount}`;
}

export function formatAedPlain(value: number): string {
  return numberFormat.format(value);
}
