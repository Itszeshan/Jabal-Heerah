"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { site } from "../../config/site";
import { Link } from "@/i18n/navigation";
import { text } from "@/lib/text";
import { useCart } from "@/lib/cart";
import { formatAed } from "@/lib/format";
import type { Locale } from "@/types/content";
import { buttonClass } from "./ui";

export function CartView() {
  const t = useTranslations("cart");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const { lines, subtotal, setQty, remove } = useCart();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!hydrated) return <div className="min-h-40 border border-line bg-white" />;

  if (!lines.length) {
    return (
      <div className="border border-line bg-white p-6">
        <p>{t("empty")}</p>
        <Link href="/shop" className={buttonClass("primary", "mt-4")}>
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <ul className="divide-y divide-line border border-line bg-white">
        {lines.map((line) => (
          <li key={`${line.productId}-${line.variantId}`} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
            <div>
              <Link href={`/product/${line.slug}`} className="font-semibold hover:text-orange-ink">
                {text(line.name, locale)}
              </Link>
              <p className="text-sm text-muted">{text(line.variantLabel, locale)}</p>
              {line.example ? <p className="mt-1 text-xs font-semibold">{common("example")}</p> : null}
              <p className="mt-2 text-sm">{formatAed(line.price * line.qty, locale)}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm" htmlFor={`qty-${line.productId}-${line.variantId}`}>
                {t("lineQty", { name: text(line.name, locale) })}
              </label>
              <input
                id={`qty-${line.productId}-${line.variantId}`}
                type="number"
                min={1}
                max={99}
                value={line.qty}
                onChange={(event) => setQty(line.productId, line.variantId, Number(event.target.value))}
                className="h-11 w-16 border border-line px-2"
              />
              <button
                type="button"
                className="text-sm font-semibold text-orange-ink"
                onClick={() => remove(line.productId, line.variantId)}
              >
                {t("remove")}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit border border-line bg-white p-4">
        <p className="flex items-center justify-between gap-4 text-sm">
          <span>{t("subtotal")}</span>
          <span className="font-semibold">{formatAed(subtotal, locale)}</span>
        </p>
        <p className="mt-2 text-sm text-muted">{site.pricesIncludeVat ? common("vatIncluded") : common("vatExcluded")}</p>
        {lines.some((line) => line.example) ? <p className="mt-3 text-sm">{common("sampleBanner")}</p> : null}
        <Link href="/checkout" className={buttonClass("primary", "mt-4 w-full")}>
          {t("checkout")}
        </Link>
        <Link href="/shop" className="mt-3 block text-sm font-semibold text-orange-ink">
          {t("continue")}
        </Link>
      </aside>
    </div>
  );
}
