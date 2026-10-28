import { Clock, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { getLocale, getTranslations } from "next-intl/server";
import { site } from "../../config/site";
import { buildQuoteRequest, waUrl } from "@/lib/whatsapp";
import type { Locale } from "@/types/content";

export async function TopBar() {
  const t = await getTranslations("topBar");
  const locale = (await getLocale()) as Locale;

  return (
    <div className="bg-ink text-xs text-white/80">
      <div className="mx-auto flex min-h-9 max-w-7xl items-center gap-4 px-4">
        <a href={`tel:${site.phoneTel}`} className="inline-flex items-center gap-1.5 hover:text-white">
          <Phone size={14} aria-hidden />
          <span dir="ltr">{site.phoneDisplay}</span>
        </a>
        <a
          href={waUrl(buildQuoteRequest())}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 hover:text-white sm:inline-flex"
        >
          <WhatsappLogo size={14} aria-hidden />
          {t("whatsapp")}
        </a>
        {site.hours.placeholder ? null : (
          <p className="hidden items-center gap-1.5 md:inline-flex">
            <Clock size={14} aria-hidden />
            {site.hours.short[locale]}
          </p>
        )}
        <a
          href={waUrl(buildQuoteRequest())}
          target="_blank"
          rel="noopener noreferrer"
          className="ms-auto inline-flex min-h-7 items-center bg-orange px-3 font-semibold text-white hover:bg-orange-ink"
        >
          {t("quote")}
        </a>
      </div>
    </div>
  );
}
