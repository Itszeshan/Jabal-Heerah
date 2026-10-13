import type { Metadata } from "next";
import { site } from "../../config/site";
import type { Locale } from "@/types/content";

export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const url = `${site.url}/${locale}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${site.url}/en${path}`,
        ar: `${site.url}/ar${path}`,
        "x-default": `${site.url}/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name.en,
      locale: locale === "ar" ? "ar_AE" : "en_AE",
      type: "website",
    },
  };
}
