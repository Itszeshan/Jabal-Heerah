import type { Metadata } from "next";
import Image from "next/image";
import { PendingImage } from "@/components/pending-image";
import { Clock, MapPin, Phone, Storefront, Wrench } from "@phosphor-icons/react/ssr";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { site } from "../../../config/site";
import { HomeCarousel, type HomeSlide } from "@/components/home-carousel";
import { ServiceMark } from "@/components/service-icon";
import { ShelfExplorer } from "@/components/shelf-explorer";
import { JsonLd } from "@/components/json-ld";
import { MapEmbed, mapLink } from "@/components/map-embed";
import { ProductCard } from "@/components/product-card";
import { buttonClass, Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import {
  brandImage,
  brandName,
  getBrands,
  getCategories,
  getProducts,
  getService,
  getServices,
  hasExampleProducts,
  minPrice,
  saleProducts,
  text,
} from "@/lib/catalog";
import { formatAed } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { localBusinessJsonLd } from "@/lib/schema";
import { waUrl } from "@/lib/whatsapp";
import type { Locale } from "@/types/content";

const activityIds = ["colour-matching", "denting", "polishing"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale: loc, namespace: "meta" });
  return {
    ...pageMetadata(loc, "", t("homeTitle"), t("homeDescription")),
    title: { absolute: site.name[loc] },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  const t = await getTranslations("home");
  const common = await getTranslations("common");
  const servicesT = await getTranslations("services");
  const contact = await getTranslations("contact");
  const categories = getCategories().filter((category) => category.featured && (category.count ?? 1) > 0);
  const shelves = categories
    .map((category) => ({
      id: category.id,
      name: text(category.name, loc),
      href: `/shop/${category.slug}`,
      products: getProducts()
        .filter((product) => product.category === category.slug && product.images.some((image) => image.startsWith("/")))
        .slice(0, 6)
        .map((product) => ({
          href: `/product/${product.slug}`,
          name: text(product.name, loc),
          image: product.images.find((image) => image.startsWith("/")) ?? "",
        })),
    }))
    .filter((shelf) => shelf.products.length > 0);
  const colour = getService("colour-matching");
  const products = getProducts().filter((product) => product.featured).slice(0, 4);
  const services = getServices().filter((service) => service.featured);
  const brands = [...getBrands()].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)).slice(0, 8);
  const sales = saleProducts().slice(0, 2);
  const newest = [...getProducts()]
    .filter((product) => product.images.some((image) => image.startsWith("/")) && product.brand !== "other" && product.brand !== "generic")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || Number(b.id.replace(/\D/g, "")) - Number(a.id.replace(/\D/g, "")))[0];
  const slides: HomeSlide[] = [
    ...sales.map((product) => {
      const variant = product.variants.find((item) => item.compareAtPrice != null && item.compareAtPrice > item.price) ?? product.variants[0];
      return {
        id: product.id,
        kind: "sale" as const,
        href: `/product/${product.slug}`,
        title: text(product.name, loc),
        body: brandName(product.brand),
        image: product.images.find((image) => image.startsWith("/")) ?? "",
        meta: formatAed(variant?.price ?? minPrice(product), loc),
        compare: variant?.compareAtPrice ? formatAed(variant.compareAtPrice, loc) : undefined,
        cta: t("viewProduct"),
      };
    }),
    {
      id: "offers",
      kind: "offers" as const,
      href: waUrl("Hello - offers on the Jabal Al Heerah website"),
      title: t("offersTitle"),
      body: t("offersBody"),
      image: "/shop/offers.webp",
      meta: "",
      cta: common("whatsapp"),
      external: true,
    },
    ...(newest
      ? [
          {
            id: "new-stock",
            kind: "new" as const,
            href: "/shop?sort=newest",
            title: t("newTitle"),
            body: t("newBody"),
            image: newest.images.find((image) => image.startsWith("/")) ?? "",
            meta: brandName(newest.brand),
            cta: t("viewNew"),
          },
        ]
      : []),
    ...activityIds.flatMap((id) => {
      const service = services.find((item) => item.id === id);
      if (!service) return [];
      return [
        {
          id: service.id,
          kind: "activity" as const,
          href: `/services/${service.slug}`,
          title: text(service.name, loc),
          body: text(service.short, loc),
          image: service.image,
          meta: "",
          cta: servicesT("book"),
        },
      ];
    }),
  ];

  return (
    <>
      <JsonLd data={localBusinessJsonLd(loc)} />
      <section className="relative isolate min-h-[calc(100dvh-6rem)] overflow-hidden bg-charcoal text-white">
        <Image
          src="/services/full-body-painting.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/20 rtl:bg-gradient-to-l" />
        <Container className="relative flex min-h-[calc(100dvh-6rem)] flex-col justify-center py-10 md:py-14">
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
            {site.name[loc]}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/85">{t("sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className={buttonClass("primary")}>
              <Storefront size={18} weight="regular" aria-hidden />
              {t("shopCta")}
            </Link>
            <Link href="/services" className={buttonClass("inverse")}>
              <Wrench size={18} weight="regular" aria-hidden />
              {t("serviceCta")}
            </Link>
          </div>
        </Container>
      </section>

      {hasExampleProducts() ? (
        <p className="border-b border-line bg-white py-3 text-sm">
          <Container>{common("sampleBanner")}</Container>
        </p>
      ) : null}

      <section className="py-12 md:py-16">
        <Container>
          <h2 className="sr-only">{t("carouselTitle")}</h2>
          <HomeCarousel
            slides={slides}
            dir={loc === "ar" ? "rtl" : "ltr"}
            labels={{
              sale: t("saleLabel"),
              highlight: t("highlightLabel"),
              offers: t("offersLabel"),
              activity: t("activityLabel"),
              fresh: t("newLabel"),
              previous: t("previous"),
              next: t("next"),
              position: t("slidePosition"),
            }}
          />
        </Container>
      </section>

      <section className="pb-12 md:pb-16">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight">{t("categoriesTitle")}</h2>
          <div className="mt-6">
            <ShelfExplorer shelves={shelves} openLabel={t("openShelf")} />
          </div>
        </Container>
      </section>

      {products.length ? (
        <section className="pb-12 md:pb-16">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl font-semibold tracking-tight">{t("productsTitle")}</h2>
              <Link href="/shop" className="text-sm font-semibold text-orange-ink">
                {t("productsLink")}
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={loc} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {colour?.image ? (
        <section className="bg-white">
          <Link href={`/services/${colour.slug}`} className="grid lg:grid-cols-2">
            <span className="relative block min-h-72 bg-well">
              <PendingImage src={colour.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </span>
            <span className="flex flex-col justify-center px-4 py-12 md:px-12">
              <h2 className="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">{text(colour.name, loc)}</h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-muted">{text(colour.short, loc)}</p>
            </span>
          </Link>
        </section>
      ) : null}

      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight">{t("servicesTitle")}</h2>
            <Link href="/services" className="text-sm font-semibold text-orange-ink">
              {t("servicesLink")}
            </Link>
          </div>
          <ol className="mt-6 border-b border-line">
            {services.map((service) => (
              <li key={service.id} className="grid gap-3 border-t border-line py-5 sm:grid-cols-[2.5rem_1fr_auto] sm:items-center">
                <ServiceMark id={service.id} />
                <div>
                  <h3 className="text-lg font-semibold">{text(service.name, loc)}</h3>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-muted">{text(service.short, loc)}</p>
                </div>
                <Link href={`/services/${service.slug}`} className={buttonClass("secondary")}>
                  {servicesT("book")}
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight">{t("brandsTitle")}</h2>
            <Link href="/brands" className="text-sm font-semibold text-orange-ink">
              {t("brandsLink")}
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {brands.map((brand) => {
              const image = brandImage(brand.slug);
              return (
              <li key={brand.id}>
                <Link href={`/shop?brand=${brand.slug}`} className="shelf-card block">
                  <span className="photo-well relative block aspect-[4/3] border-b border-line">
                    {image ? (
                      <PendingImage src={image} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-contain p-3" />
                    ) : null}
                  </span>
                  <span className="flex flex-col items-center px-3 py-3 text-center">
                    <span className="text-sm font-semibold">{brand.name}</span>
                    {brand.count != null ? <span className="mt-1 text-xs tabular-nums text-muted">{common("results", { count: brand.count })}</span> : null}
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="bg-white">
        <div className="grid lg:grid-cols-2">
          <div className="px-4 py-12 md:px-8 md:py-16 lg:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">{t("locationTitle")}</h2>
            <dl className="mt-6 max-w-md">
              <div className="flex gap-4 border-b border-line py-4">
                <span className="flex size-10 shrink-0 items-center justify-center border border-line bg-well" aria-hidden>
                  <MapPin size={20} weight="regular" />
                </span>
                <div>
                  <dt className="text-xs font-semibold text-muted">{contact("address")}</dt>
                  <dd className="mt-1 text-sm leading-6">{site.address[loc]}</dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-line py-4">
                <span className="flex size-10 shrink-0 items-center justify-center border border-line bg-well" aria-hidden>
                  <Clock size={20} weight="regular" />
                </span>
                <div>
                  <dt className="text-xs font-semibold text-muted">{contact("hours")}</dt>
                  <dd className="mt-1 whitespace-pre-line text-sm leading-6">{site.hours[loc]}</dd>
                </div>
              </div>
              <div className="flex gap-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center border border-line bg-well" aria-hidden>
                  <Phone size={20} weight="regular" />
                </span>
                <div>
                  <dt className="text-xs font-semibold text-muted">{contact("phone")}</dt>
                  <dd className="mt-1">
                    <a href={`tel:${site.phoneTel}`} dir="ltr" className="inline-block text-base font-semibold tabular-nums tracking-tight">
                      {site.phoneDisplay}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
            <div className="mt-2 flex flex-wrap gap-3">
              <a href={`tel:${site.phoneTel}`} className={buttonClass("dark")}>
                <Phone size={18} weight="regular" aria-hidden />
                {common("call")}
              </a>
              <a href={mapLink()} className={buttonClass("secondary")} target="_blank" rel="noopener noreferrer">
                {contact("openMap")}
              </a>
            </div>
          </div>
          <MapEmbed title={t("mapTitle")} />
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <Container className="py-10">
          <p className="max-w-3xl text-2xl font-semibold leading-snug md:text-3xl">{common("walkIn")}</p>
        </Container>
      </section>
    </>
  );
}
