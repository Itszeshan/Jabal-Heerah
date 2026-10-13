import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductMedia } from "@/components/product-media";
import { ServiceBooking } from "@/components/service-booking";
import { Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { getService, getServices, text } from "@/lib/catalog";
import { formatAed } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { serviceJsonLd } from "@/lib/schema";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/content";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getServices().map((service) => ({ locale, slug: service.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata(loc, `/services/${slug}`, text(service.name, loc), text(service.short, loc));
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  const service = getService(slug);
  if (!service) notFound();
  const t = await getTranslations("services");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");

  return (
    <Container className="py-8 md:py-10">
      <JsonLd data={serviceJsonLd(service, loc)} />
      <nav aria-label={common("breadcrumb")} className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-ink">{common("home")}</Link>
        <span aria-hidden> / </span>
        <Link href="/services" className="hover:text-ink">{nav("services")}</Link>
      </nav>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{text(service.name, loc)}</h1>
          <p className="mt-4 max-w-prose text-sm leading-7">{text(service.body, loc)}</p>
          {service.startingPrice != null ? (
            <p className="mt-4 text-sm font-semibold">{t("startingFrom", { price: formatAed(service.startingPrice, loc) })}</p>
          ) : null}
          {text(service.duration, loc) ? <p className="mt-2 text-sm">{text(service.duration, loc)}</p> : null}
        </div>
        <ProductMedia src={service.image} alt={text(service.name, loc)} />
      </div>
      <div className="mt-8 max-w-3xl">
        <ServiceBooking service={service} />
      </div>
    </Container>
  );
}
