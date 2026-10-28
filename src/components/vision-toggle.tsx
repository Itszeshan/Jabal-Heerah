"use client";

import { CaretDown, Eye } from "@phosphor-icons/react";
import Image from "next/image";
import { useId, useState } from "react";
import { cx } from "./ui";

export function VisionToggle({ label, title, text }: { label: string; title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-8 lg:mt-10">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 items-center gap-2 border border-white/40 bg-white/10 px-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        <Eye size={16} aria-hidden />
        {label}
        <CaretDown size={14} aria-hidden className={cx("transition-transform", open && "rotate-180")} />
      </button>
      <div id={panelId} hidden={!open} className="mt-3 max-w-xl border border-white/15 bg-charcoal/70 backdrop-blur-sm">
        <div className="relative aspect-[16/7]">
          <Image src="/home/vision.webp" alt="" fill sizes="(min-width: 640px) 576px, 100vw" className="object-cover" />
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange">{title}</p>
          <p className="mt-2 text-base leading-relaxed text-white/90">{text}</p>
        </div>
      </div>
    </div>
  );
}
