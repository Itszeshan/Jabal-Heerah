import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServiceIcon } from "@/components/service-icon";
import { Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { getServices, text } from "@/lib/catalog";
import { formatAed } from "@/lib/format";
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
  return pageMetadata(loc, "/services", t("servicesTitle"), t("servicesDescription"));
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  const t = await getTranslations("services");
  const services = getServices();

  return (
    <Container className="py-10 md:py-12">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{t("intro")}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {services.map((service) => (
          <li key={service.id}>
            <a
              href={`#${service.slug}`}
              className="inline-flex min-h-10 items-center gap-2 border border-line bg-white px-3 text-sm font-semibold transition-colors hover:border-charcoal"
            >
              <ServiceIcon id={service.id} size={16} />
              {text(service.name, loc)}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.id}
            id={service.slug}
            href={`/services/${service.slug}`}
            className="service-card group scroll-mt-24 border border-line bg-white"
          >
            <span className="relative block aspect-[4/3] overflow-hidden bg-well">
              {service.image ? (
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-center"
                />
              ) : null}
            </span>
            <span className="flex items-start gap-3 p-4">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-line bg-well text-ink">
                <ServiceIcon id={service.id} size={16} />
              </span>
              <span className="min-w-0">
                <h2 className="text-base font-semibold leading-snug">{text(service.name, loc)}</h2>
                <p className="mt-1 text-sm leading-5 text-muted">{text(service.short, loc)}</p>
                {service.startingPrice != null ? (
                  <p className="mt-2 text-sm font-semibold">{t("startingFrom", { price: formatAed(service.startingPrice, loc) })}</p>
                ) : null}
                <span className="mt-2 inline-flex text-sm font-semibold text-orange-ink">{t("book")}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
