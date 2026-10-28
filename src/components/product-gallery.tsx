"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PendingImage } from "./pending-image";
import { cx } from "./ui";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations("product");
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="photo-well relative aspect-square">
        <PendingImage
          key={current}
          src={current}
          alt={alt}
          fill
          priority={active === 0}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-contain p-4"
        />
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            aria-pressed={index === active}
            aria-label={t("photo", { index: index + 1, total: images.length })}
            className={cx(
              "relative size-16 shrink-0 border bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
              index === active ? "border-ink" : "border-line hover:border-muted",
            )}
          >
            <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
