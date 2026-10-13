import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShopScreen } from "@/components/shop-screen";
import { getCategories, getCategory, text } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/content";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getCategories().map((category) => ({ locale, category: category.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const loc = locale as Locale;
  const category = getCategory(slug);
  const t = await getTranslations({ locale: loc, namespace: "meta" });
  const title = category ? text(category.name, loc) : t("shopTitle");
  const description = category ? text(category.description, loc) : t("shopDescription");
  return pageMetadata(loc, `/shop/${slug}`, title, description);
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, category } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  return <ShopScreen locale={loc} categorySlug={category} searchParams={await searchParams} />;
}
