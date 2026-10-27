import type { Metadata } from "next";
import { PendingImage } from "@/components/pending-image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { brandImage, getBrands, text } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import type { Locale } from "@/types/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale: loc, namespace: "meta" });
  return pageMetadata(loc, "/brands", t("brandsTitle"), t("brandsDescription"));
}

export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  const t = await getTranslations("brands");
  const common = await getTranslations("common");
  const brands = getBrands();

  return (
    <Container className="py-8 md:py-10">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t("intro")}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => {
          const image = brandImage(brand.slug);
          const comingSoon = brand.count === 0;
          const media = image ? (
            <PendingImage src={image} alt={brand.name} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-contain p-4" />
          ) : (
            <span className="flex h-full items-end p-4 text-2xl font-semibold">{brand.name}</span>
          );
          return (
            <li key={brand.id} className="shelf-card flex flex-col">
              {comingSoon ? (
                <div className="photo-well relative block aspect-[4/3] border-b border-line">{media}</div>
              ) : (
                <Link href={`/shop?brand=${brand.slug}`} className="photo-well relative block aspect-[4/3] border-b border-line">
                  {media}
                </Link>
              )}
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-2xl font-semibold">{brand.name}</h2>
                {text(brand.description, loc) ? <p className="mt-2 text-sm leading-6 text-muted">{text(brand.description, loc)}</p> : null}
                {comingSoon ? (
                  <p className="mt-2 text-sm text-muted">{t("comingSoon")}</p>
                ) : (
                  <>
                    {brand.count != null ? <p className="mt-2 text-sm tabular-nums text-muted">{common("results", { count: brand.count })}</p> : null}
                    <Link href={`/shop?brand=${brand.slug}`} className="mt-auto inline-flex min-h-11 items-center pt-3 text-sm font-semibold text-orange-ink">
                      {t("shopBrand", { brand: brand.name })}
                    </Link>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
