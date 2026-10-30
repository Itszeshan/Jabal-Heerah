"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { track } from "@/lib/tracking";
import { buttonClass } from "./ui";

export function AskPriceLink({
  href,
  label,
  slug,
  sku,
  className,
}: {
  href: string;
  label: string;
  slug: string;
  sku?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass("primary", className)}
      onClick={() => track("generate_lead", { content_name: slug, ...(sku ? { content_ids: [sku] } : {}) })}
    >
      <WhatsappLogo size={18} aria-hidden />
      {label}
    </a>
  );
}
