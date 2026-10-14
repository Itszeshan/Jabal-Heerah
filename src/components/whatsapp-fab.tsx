"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { track } from "@/lib/tracking";
import { utmSourceLine } from "@/lib/utm";
import { waUrl } from "@/lib/whatsapp";

export function WhatsAppFab() {
  const t = useTranslations("common");
  const [href, setHref] = useState(waUrl("Hello - Jabal Al Heerah website"));

  useEffect(() => {
    const source = utmSourceLine();
    const message = ["Hello - Jabal Al Heerah website", source ? `Source: ${source}` : ""]
      .filter(Boolean)
      .join("\n");
    setHref(waUrl(message));
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 end-4 z-40 inline-flex min-h-12 items-center gap-2 bg-orange px-4 text-sm font-semibold text-white motion-safe:transition-transform motion-safe:active:scale-[0.98] lg:bottom-6"
      onClick={() => track("generate_lead", { content_name: "floating_whatsapp" })}
    >
      <WhatsappLogo size={20} weight="regular" aria-hidden />
      {t("whatsapp")}
    </a>
  );
}
