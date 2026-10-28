"use client";

import { PendingImage } from "./pending-image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

export type ShelfPreview = {
  id: string;
  name: string;
  href: string;
  products: { href: string; name: string; image: string }[];
};

export function ShelfExplorer({ shelves, openLabel }: { shelves: ShelfPreview[]; openLabel: string }) {
  const [active, setActive] = useState(0);
  const shelf = shelves[active] ?? shelves[0];
  if (!shelf) return null;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" role="tablist">
          {shelves.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(index)}
                className={
                  selected
                    ? "shrink-0 border-s-2 border-orange bg-white px-3 py-2 text-start text-sm font-semibold text-ink"
                    : "shrink-0 px-3 py-2 text-start text-sm text-muted hover:text-ink"
                }
              >
                {item.name}
              </button>
            );
          })}
        </div>
        <Link href={shelf.href} className="mt-4 inline-flex min-h-11 items-center bg-orange px-4 text-sm font-semibold whitespace-nowrap text-white active:scale-[0.98]">
          {openLabel}
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shelf.products.map((product) => (
          <li key={product.href}>
            <Link href={product.href} className="shelf-card block border border-line bg-white">
              <span className="photo-well relative block aspect-square border-b border-line">
                <PendingImage src={product.image} alt="" fill sizes="(min-width: 1024px) 18vw, 45vw" className="object-contain p-3" />
              </span>
              <span className="block px-3 py-3 text-sm font-semibold leading-snug">{product.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
