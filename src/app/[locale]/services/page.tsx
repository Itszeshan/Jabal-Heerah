import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PhotoSlot } from "@/components/photo-slot";
import { ProductMedia } from "@/components/product-media";
import { buttonClass, Container } from "@/components/ui";
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
    <Container className="py-8 md:py-10">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t("intro")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="grid border border-line bg-white sm:grid-cols-[140px_1fr]">
            {service.image ? <ProductMedia src={service.image} alt={text(service.name, loc)} sizes="140px" /> : <PhotoSlot />}
            <div className="flex flex-col gap-3 p-4">
              <h2 className="text-xl font-semibold">{text(service.name, loc)}</h2>
              <p className="text-sm leading-6 text-muted">{text(service.short, loc)}</p>
              {service.startingPrice != null ? (
                <p className="text-sm font-semibold">{t("startingFrom", { price: formatAed(service.startingPrice, loc) })}</p>
              ) : null}
              {text(service.duration, loc) ? <p className="text-sm">{text(service.duration, loc)}</p> : null}
              <Link href={`/services/${service.slug}`} className={buttonClass("primary", "mt-auto w-fit")}>
                {t("book")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
