"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSyncExternalStore } from "react";
import { site } from "../../config/site";
import { useRouter } from "@/i18n/navigation";
import { text } from "@/lib/text";
import { useCart } from "@/lib/cart";
import { formatAed } from "@/lib/format";
import { saveOrder } from "@/lib/orders";
import { normalizeUaeMobile } from "@/lib/phone";
import { track } from "@/lib/tracking";
import { utmSourceLine } from "@/lib/utm";
import { buildOrderMessage, makeOrderRef, waUrl, type OrderDraft } from "@/lib/whatsapp";
import type { Locale } from "@/types/content";
import { buttonClass, fieldClass } from "./ui";

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const cart = useTranslations("cart");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { lines, subtotal } = useCart();
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const tracked = useRef(false);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!hydrated || !lines.length || tracked.current) return;
    tracked.current = true;
    track("begin_checkout", {
      value: subtotal,
      num_items: lines.reduce((sum, line) => sum + line.qty, 0),
      content_ids: lines.map((line) => line.sku || line.productId),
      content_type: "product",
    });
  }, [hydrated, lines, subtotal]);

  if (!hydrated) return <div className="min-h-40 border border-line bg-white" />;

  if (!lines.length) {
    return <p className="border border-line bg-white p-6">{t("empty")}</p>;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const phone = normalizeUaeMobile(String(data.get("phone") ?? ""));
    const address = String(data.get("address") ?? "");
    const time = String(data.get("time") ?? "");
    const notes = String(data.get("notes") ?? "");
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = t("nameRequired");
    if (!phone) nextErrors.phone = t("phoneInvalid");
    if (fulfilment === "delivery" && !address.trim()) nextErrors.address = t("addressRequired");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !phone) return;

    const draft: OrderDraft = {
      ref: makeOrderRef(),
      name: name.trim(),
      phone,
      fulfilment,
      address: fulfilment === "delivery" ? address.trim() : undefined,
      time: time.trim() || undefined,
      notes: notes.trim() || undefined,
      items: lines.map((line) => {
        const itemName =
          locale === "ar" && line.name.ar !== line.name.en ? `${line.name.ar} / ${line.name.en}` : line.name.en;
        const variant =
          locale === "ar" && line.variantLabel.ar !== line.variantLabel.en
            ? `${line.variantLabel.ar} / ${line.variantLabel.en}`
            : line.variantLabel.en;
        return { name: itemName, variant, qty: line.qty, lineTotal: line.price * line.qty };
      }),
      subtotal,
      source: utmSourceLine(),
      samplePrices: lines.some((line) => line.example),
    };
    const message = buildOrderMessage(draft);
    const url = waUrl(message);
    saveOrder({ ...draft, createdAt: new Date().toISOString(), message, url });
    track("generate_lead", {
      content_name: draft.ref,
      value: subtotal,
      content_ids: lines.map((line) => line.sku || line.productId),
      content_type: "product",
    });
    setPending(true);
    window.open(url, "_blank", "noopener,noreferrer");
    router.push(`/checkout/confirmation?ref=${encodeURIComponent(draft.ref)}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_300px]" noValidate>
      <div className="grid gap-4 border border-line bg-white p-4">
        <p className="text-sm">{t("intro")}</p>
        <div className="grid gap-1">
          <label htmlFor="name" className="text-sm font-semibold">
            {t("name")}
          </label>
          <input id="name" name="name" autoComplete="name" required className={fieldClass()} aria-invalid={Boolean(errors.name)} />
          {errors.name ? <p className="text-sm text-orange-ink">{errors.name}</p> : null}
        </div>
        <div className="grid gap-1">
          <label htmlFor="phone" className="text-sm font-semibold">
            {t("phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            required
            placeholder="050 123 4567"
            aria-describedby="phone-hint"
            aria-invalid={Boolean(errors.phone)}
            className={fieldClass()}
          />
          <p id="phone-hint" className="text-sm text-muted">
            {t("phoneHint")}
          </p>
          {errors.phone ? <p className="text-sm text-orange-ink">{errors.phone}</p> : null}
        </div>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">{t("fulfilment")}</legend>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="radio" name="fulfilment" checked={fulfilment === "pickup"} onChange={() => setFulfilment("pickup")} />
            {t("pickup")}
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="radio" name="fulfilment" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")} />
            {t("delivery")}
          </label>
        </fieldset>
        {fulfilment === "delivery" ? (
          <div className="grid gap-1">
            <label htmlFor="address" className="text-sm font-semibold">
              {t("address")}
            </label>
            <textarea
              id="address"
              name="address"
              autoComplete="street-address"
              required
              rows={3}
              aria-invalid={Boolean(errors.address)}
              className={fieldClass()}
            />
            {errors.address ? <p className="text-sm text-orange-ink">{errors.address}</p> : null}
          </div>
        ) : null}
        <div className="grid gap-1">
          <label htmlFor="time" className="text-sm font-semibold">
            {t("time")} <span className="font-normal text-muted">({common("optional")})</span>
          </label>
          <input id="time" name="time" aria-describedby="time-hint" className={fieldClass()} />
          <p id="time-hint" className="text-sm text-muted">
            {t("timeHint")}
          </p>
        </div>
        <div className="grid gap-1">
          <label htmlFor="notes" className="text-sm font-semibold">
            {t("notes")} <span className="font-normal text-muted">({common("optional")})</span>
          </label>
          <textarea id="notes" name="notes" rows={3} aria-describedby="notes-hint" className={fieldClass()} />
          <p id="notes-hint" className="text-sm text-muted">
            {t("notesHint")}
          </p>
        </div>
        <button type="submit" className={buttonClass("primary")} disabled={pending}>
          {t("submit")}
        </button>
      </div>
      <aside className="h-fit border border-line bg-white p-4">
        <h2 className="font-semibold">{t("summary")}</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {lines.map((line) => (
            <li key={`${line.productId}-${line.variantId}`} className="flex justify-between gap-3">
              <span>
                {text(line.name, locale)} × {line.qty}
              </span>
              <span>{formatAed(line.price * line.qty, locale)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-line pt-3 text-sm font-semibold">
          <span>{cart("subtotal")}</span>
          <span>{formatAed(subtotal, locale)}</span>
        </p>
        <p className="mt-2 text-sm text-muted">{site.pricesIncludeVat ? common("vatIncluded") : common("vatExcluded")}</p>
        {lines.some((line) => line.example) ? <p className="mt-3 text-sm">{t("sampleWarning")}</p> : null}
      </aside>
    </form>
  );
}
