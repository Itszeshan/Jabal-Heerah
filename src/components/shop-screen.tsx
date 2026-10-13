import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ShopBrowser, type ShopQuery } from "@/components/shop-browser";
import { Container } from "@/components/ui";
import { getCategories, getCategory, hasExampleProducts, text } from "@/lib/catalog";
import type { Locale } from "@/types/content";

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function ShopScreen({
  locale,
  categorySlug,
  searchParams,
}: {
  locale: Locale;
  categorySlug?: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  if (categorySlug && !category) notFound();

  const t = await getTranslations("shop");
  const common = await getTranslations("common");
  const page = Number(one(searchParams.page));
  const serverQuery: ShopQuery = {
    q: one(searchParams.q),
    brand: one(searchParams.brand),
    cat: category?.slug || one(searchParams.cat),
    size: one(searchParams.size),
    min: one(searchParams.min),
    max: one(searchParams.max),
    sort: one(searchParams.sort) || "name",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };

  return (
    <Container className="py-8 md:py-10">
      <ShopBrowser
        locale={locale}
        serverQuery={serverQuery}
        lockedCategory={category?.slug}
        categories={getCategories().map((item) => ({ slug: item.slug, name: text(item.name, locale) }))}
        title={category ? text(category.name, locale) : t("title")}
        intro={category ? text(category.description, locale) : t("intro")}
        sampleBanner={hasExampleProducts() ? common("sampleBanner") : undefined}
      />
    </Container>
  );
}
