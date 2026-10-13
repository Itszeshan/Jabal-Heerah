import { getLocale, getTranslations } from "next-intl/server";
import { site } from "../../config/site";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/types/content";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const contact = await getTranslations("contact");
  const locale = (await getLocale()) as Locale;
  const year = new Date().getFullYear();
  const socials: { href: string; label: string }[] = [];
  if (site.socials.facebook) socials.push({ href: site.socials.facebook, label: "Facebook" });
  if (site.socials.tiktok) socials.push({ href: site.socials.tiktok, label: "TikTok" });
  if (site.socials.instagram) socials.push({ href: site.socials.instagram, label: "Instagram" });

  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">{site.name[locale]}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">{site.address[locale]}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("shop")}</p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li><Link href="/shop" className="hover:underline">{nav("shop")}</Link></li>
            <li><Link href="/services" className="hover:underline">{nav("services")}</Link></li>
            <li><Link href="/brands" className="hover:underline">{nav("brands")}</Link></li>
            <li><Link href="/faq" className="hover:underline">{nav("faq")}</Link></li>
            <li><Link href="/about" className="hover:underline">{nav("about")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("visit")}</p>
          <p className="mt-3 whitespace-pre-line text-sm text-white/80">{contact("hours")}: {site.hours[locale]}</p>
          <a className="mt-2 block text-sm font-semibold hover:underline" href={`tel:${site.phoneTel}`}>
            {site.phoneDisplay}
          </a>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} className="hover:underline" rel="noopener noreferrer">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 pb-20 text-xs text-white/70 lg:pb-4">
          © {year} {site.name[locale]}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
