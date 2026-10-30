import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { JsonLd } from "@/components/json-ld";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductMedia } from "@/components/product-media";
import { Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { brandName, categoryName, getProduct, getProducts, relatedProducts, text } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { productJsonLd } from "@/lib/schema";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/content";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getProducts().map((product) => ({ locale, slug: product.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const product = getProduct(slug);
  if (!product) return {};
  return pageMetadata(loc, `/product/${slug}`, text(product.name, loc), text(product.description, loc));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  const product = getProduct(slug);
  if (!product) notFound();
  const t = await getTranslations("product");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");
  const related = relatedProducts(product);
  const photos = product.images.filter((image) => image.startsWith("/"));

  return (
    <Container className="py-8 pb-28 md:py-10 lg:pb-10">
      <ScrollToTop />
      <JsonLd data={productJsonLd(product, loc)} />
      <nav aria-label={common("breadcrumb")} className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-ink">{common("home")}</Link>
        <span aria-hidden> / </span>
        <Link href="/shop" className="hover:text-ink">{nav("shop")}</Link>
      </nav>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:col-start-2">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{text(product.name, loc)}</h1>
          <div className="mt-4">
            <BuyBox product={product} brand={brandName(product.brand)} />
          </div>
        </div>
        <div className="order-first border border-line bg-white lg:order-none lg:col-start-1 lg:row-start-1">
          {photos.length > 1 ? (
            <ProductGallery images={photos} alt={text(product.name, loc)} />
          ) : (
            <ProductMedia src={product.images[0]} alt={text(product.name, loc)} priority />
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">{t("description")}</h2>
          <p className="mt-3 max-w-prose text-sm leading-7">{text(product.description, loc)}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">{t("specs")}</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div className="border border-line bg-white p-3">
              <dt className="text-muted">{t("brand")}</dt>
              <dd className="mt-1 font-semibold">{brandName(product.brand)}</dd>
            </div>
            <div className="border border-line bg-white p-3">
              <dt className="text-muted">{t("category")}</dt>
              <dd className="mt-1 font-semibold">{categoryName(product.category, loc)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{t("related")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} locale={loc} />
            ))}
          </div>
        </section>
      ) : null}
      </Container>
  );
}
