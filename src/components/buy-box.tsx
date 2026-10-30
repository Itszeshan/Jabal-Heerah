"use client";

import { Minus, Plus, WhatsappLogo } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { text } from "@/lib/text";
import { useCart } from "@/lib/cart";
import { formatAed } from "@/lib/format";
import { track } from "@/lib/tracking";
import { utmSourceLine } from "@/lib/utm";
import { buildPriceRequest, buildProductQuestion, waUrl } from "@/lib/whatsapp";
import type { Locale, Product } from "@/types/content";
import { buttonClass } from "./ui";

export function BuyBox({ product, brand }: { product: Product; brand: string }) {
  const t = useTranslations("product");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const { add } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [source, setSource] = useState<string | undefined>();
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];

  useEffect(() => {
    setPageUrl(window.location.href);
    setSource(utmSourceLine());
  }, []);

  useEffect(() => {
    if (!variant) return;
    track("view_item", {
      content_ids: [variant.sku || product.id],
      content_name: product.name.en,
      content_type: "product",
      value: variant.priceOnRequest ? undefined : variant.price,
    });
  }, [product.id, product.name.en, variant]);

  if (!variant) return null;

  const onRequest = Boolean(variant.priceOnRequest);
  const priceText = formatAed(variant.price, locale);

  const name = text(product.name, locale);
  const variantLabel = text(variant.label, locale);
  const bilingualName =
    locale === "ar" && product.name.ar !== product.name.en ? `${product.name.ar} / ${product.name.en}` : product.name.en;
  const bilingualVariant =
    locale === "ar" && variant.label.ar !== variant.label.en
      ? `${variant.label.ar} / ${variant.label.en}`
      : variant.label.en;

  function addLine() {
    add({
      productId: product.id,
      slug: product.slug,
      variantId: variant.id,
      name: product.name,
      variantLabel: variant.label,
      price: variant.price,
      qty,
      image: product.images[0] ?? "",
      example: product.example,
      sku: variant.sku,
    });
    track("add_to_cart", {
      content_ids: [variant.sku || product.id],
      content_name: product.name.en,
      content_type: "product",
      value: variant.price * qty,
      num_items: qty,
    });
    setAdded(true);
  }

  const askMessage = [
    onRequest
      ? buildPriceRequest(bilingualName, pageUrl, bilingualVariant)
      : buildProductQuestion(bilingualName, bilingualVariant, pageUrl),
    source ? `Source: ${source}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const trackLead = () => track("generate_lead", { content_name: product.slug, content_ids: [variant.sku] });

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">{brand}</p>
      {product.example ? (
        <p className="border border-line bg-white px-3 py-2 text-sm">{common("sampleBanner")}</p>
      ) : null}
      {onRequest ? (
        <a
          href={waUrl(askMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("primary", "min-h-12 text-base")}
          onClick={trackLead}
        >
          <WhatsappLogo size={22} aria-hidden />
          {common("priceOnRequest")}
        </a>
      ) : (
        <p className="text-2xl font-semibold">{priceText}</p>
      )}
      <p className="text-sm">{variant.inStock ? common("inStock") : common("askAvailability")}</p>

      {product.variants.length > 1 ? (
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">{t("variant")}</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((item) => (
              <label key={item.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="variant"
                  value={item.id}
                  checked={item.id === variant.id}
                  onChange={() => setVariantId(item.id)}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 items-center border border-line bg-white px-3 text-sm peer-checked:border-ink peer-checked:font-semibold peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange">
                  {text(item.label, locale)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-sm">
          <span className="font-semibold">{t("variant")}: </span>
          {variantLabel}
        </p>
      )}

      <div className={onRequest ? "hidden" : "flex items-center gap-3"}>
        <span className="text-sm font-semibold" id="qty-label">
          {t("qty")}
        </span>
        <div className="flex items-center border border-line bg-white">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            aria-label={t("decrease")}
          >
            <Minus size={16} aria-hidden />
          </button>
          <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite" aria-labelledby="qty-label">
            {qty}
          </span>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center"
            onClick={() => setQty((value) => Math.min(99, value + 1))}
            aria-label={t("increase")}
          >
            <Plus size={16} aria-hidden />
          </button>
        </div>
      </div>

      {onRequest ? null : (
        <div className="grid gap-2">
          <div className="hidden lg:block">
            <button type="button" className={buttonClass("primary", "w-full")} onClick={addLine}>
              {added ? t("added") : t("add")}
            </button>
          </div>
          <a
            href={waUrl(askMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary")}
            onClick={trackLead}
          >
            {t("ask")}
          </a>
        </div>
      )}

      <p className="text-sm text-muted">
        {t("sku")}: {variant.sku}
      </p>
      <p className="sr-only">{name}</p>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 pe-28">
          <div className="min-w-0">
            {onRequest ? null : <p className="truncate text-sm font-semibold">{priceText}</p>}
            <p className="text-xs text-muted">{variant.inStock ? common("inStock") : common("askAvailability")}</p>
          </div>
          {onRequest ? (
            <a
              href={waUrl(askMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("primary", "ms-auto")}
              onClick={trackLead}
            >
              <WhatsappLogo size={18} aria-hidden />
              {common("priceOnRequest")}
            </a>
          ) : (
            <button type="button" className={buttonClass("primary", "ms-auto")} onClick={addLine}>
              {added ? t("added") : t("add")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
