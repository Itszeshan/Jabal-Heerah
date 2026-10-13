import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Clock, FacebookLogo, InstagramLogo, MapPin, MapTrifold, Phone, TiktokLogo, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { site } from "../../../../config/site";
import { JsonLd } from "@/components/json-ld";
import { MapEmbed, mapLink } from "@/components/map-embed";
import { buttonClass, Container } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { localBusinessJsonLd } from "@/lib/schema";
import { waUrl } from "@/lib/whatsapp";
import type { Locale } from "@/types/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale: loc, namespace: "meta" });
  return pageMetadata(loc, "/contact", t("contactTitle"), t("contactDescription"));
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-line py-5 first:pt-0">
      <span className="flex size-10 shrink-0 items-center justify-center border border-line bg-well text-ink" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-muted">{label}</dt>
        <dd className="mt-1 text-sm leading-6">{children}</dd>
      </div>
    </div>
  );
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as Locale;
  setRequestLocale(loc);
  const t = await getTranslations("contact");
  const common = await getTranslations("common");
  const socials: { href: string; label: string; icon: ReactNode }[] = [];
  if (site.socials.facebook) {
    socials.push({ href: site.socials.facebook, label: "Facebook", icon: <FacebookLogo size={18} weight="regular" /> });
  }
  if (site.socials.tiktok) {
    socials.push({ href: site.socials.tiktok, label: "TikTok", icon: <TiktokLogo size={18} weight="regular" /> });
  }
  if (site.socials.instagram) {
    socials.push({ href: site.socials.instagram, label: "Instagram", icon: <InstagramLogo size={18} weight="regular" /> });
  }

  return (
    <Container className="py-10 md:py-14">
      <JsonLd data={localBusinessJsonLd(loc)} />
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted">{t("intro")}</p>
      <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[minmax(0,28rem)_1fr]">
        <section className="flex h-full flex-col border border-line bg-white p-5 md:p-7">
          <dl>
            <Fact icon={<MapPin size={20} weight="regular" />} label={t("address")}>
              {site.address[loc]}
            </Fact>
            <Fact icon={<Clock size={20} weight="regular" />} label={t("hours")}>
              <span className="whitespace-pre-line">{site.hours[loc]}</span>
            </Fact>
            <Fact icon={<Phone size={20} weight="regular" />} label={t("phone")}>
              <a href={`tel:${site.phoneTel}`} dir="ltr" className="inline-block text-base font-semibold tabular-nums tracking-tight">
                {site.phoneDisplay}
              </a>
            </Fact>
          </dl>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={waUrl("Hello - Jabal Al Heerah website")} className={buttonClass("primary")} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo size={18} weight="regular" aria-hidden />
              {common("whatsapp")}
            </a>
            <a href={`tel:${site.phoneTel}`} className={buttonClass("dark")}>
              <Phone size={18} weight="regular" aria-hidden />
              {common("call")}
            </a>
            <a href={mapLink()} className={buttonClass("secondary")} target="_blank" rel="noopener noreferrer">
              <MapTrifold size={18} weight="regular" aria-hidden />
              {t("openMap")}
            </a>
          </div>
          {socials.length > 0 ? (
            <div className="mt-6 border-t border-line pt-5 lg:mt-auto">
              <h2 className="text-xs font-semibold text-muted">{t("socials")}</h2>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a href={social.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold transition-colors hover:text-orange-ink" rel="noopener noreferrer">
                      <span aria-hidden>{social.icon}</span>
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
        <div className="flex min-h-80 border border-line bg-white lg:min-h-[32rem]">
          <MapEmbed title={t("map")} className="min-h-80 w-full flex-1 border-0 lg:min-h-[32rem]" />
        </div>
      </div>
    </Container>
  );
}
