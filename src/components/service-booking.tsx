"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { text } from "@/lib/text";
import { normalizeUaeMobile } from "@/lib/phone";
import { track } from "@/lib/tracking";
import { utmSourceLine } from "@/lib/utm";
import { buildServiceMessage, makeOrderRef, waUrl } from "@/lib/whatsapp";
import type { Locale, Service } from "@/types/content";
import { buttonClass, fieldClass } from "./ui";

export function ServiceBooking({ service }: { service: Service }) {
  const t = useTranslations("services");
  const checkout = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<{ url: string; message: string; ref: string } | null>(null);
  const serviceName = text(service.name, locale);
  const bilingual =
    locale === "ar" && service.name.ar !== service.name.en
      ? `${service.name.ar} / ${service.name.en}`
      : service.name.en;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = normalizeUaeMobile(String(data.get("phone") ?? ""));
    const make = String(data.get("make") ?? "").trim();
    const model = String(data.get("model") ?? "").trim();
    const year = String(data.get("year") ?? "").trim();
    const date = String(data.get("date") ?? "").trim();
    const notes = String(data.get("notes") ?? "").trim();
    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = t("nameRequired");
    if (!phone) nextErrors.phone = t("phoneInvalid");
    if (!make || !model) nextErrors.car = t("carRequired");
    if (!/^\d{4}$/.test(year)) nextErrors.year = t("yearInvalid");
    const yearNumber = Number(year);
    const maxYear = new Date().getFullYear() + 1;
    if (!nextErrors.year && (yearNumber < 1970 || yearNumber > maxYear)) nextErrors.year = t("yearInvalid");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !phone) return;

    const ref = makeOrderRef();
    const message = buildServiceMessage({
      ref,
      service: bilingual,
      name,
      phone,
      car: `${make} ${model} ${year}`,
      date: date || undefined,
      notes: notes || undefined,
      source: utmSourceLine(),
    });
    const url = waUrl(message);
    setSent({ url, message, ref });
    track("generate_lead", { content_name: service.slug, content_category: "service" });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 border border-line bg-white p-4" noValidate>
      <h2 className="text-xl font-semibold">{t("formTitle")}</h2>
      <p className="text-sm">
        <span className="font-semibold">{t("serviceLabel")}: </span>
        {serviceName}
      </p>
      <Field id="quote-name" name="name" label={checkout("name")} autoComplete="name" error={errors.name} />
      <div className="grid gap-1">
        <label htmlFor="quote-phone" className="text-sm font-semibold">
          {checkout("phone")}
        </label>
        <input id="quote-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required className={fieldClass()} aria-invalid={Boolean(errors.phone)} />
        {errors.phone ? <p className="text-sm text-orange-ink">{errors.phone}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="quote-make" name="make" label={t("carMake")} autoComplete="off" error={errors.car} />
        <Field id="quote-model" name="model" label={t("carModel")} error={errors.car ? " " : undefined} />
        <Field id="quote-year" name="year" label={t("carYear")} inputMode="numeric" error={errors.year} />
      </div>
      <Field id="quote-date" name="date" label={t("date")} type="date" />
      <div className="grid gap-1">
        <label htmlFor="quote-notes" className="text-sm font-semibold">
          {t("notes")}
        </label>
        <textarea id="quote-notes" name="notes" rows={3} className={fieldClass()} />
      </div>
      <p className="text-sm text-muted">{t("photoNote")}</p>
      <button type="submit" className={buttonClass("primary")}>
        {t("submit")}
      </button>
      {sent ? (
        <div className="border border-line bg-paper p-3">
          <p className="font-semibold">{t("sentTitle")}</p>
          <p className="mt-1 text-sm">{t("sentBody")}</p>
          <p className="mt-2 text-sm">Ref: {sent.ref}</p>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-sm">{sent.message}</pre>
          <a href={sent.url} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "mt-3")}>
            {t("resend")}
          </a>
        </div>
      ) : null}
    </form>
  );
}

function Field({
  id,
  name,
  label,
  error,
  type = "text",
  autoComplete,
  inputMode,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "text";
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={type !== "date"}
        aria-invalid={Boolean(error && error !== " ")}
        className={fieldClass()}
      />
      {error && error !== " " ? <p className="text-sm text-orange-ink">{error}</p> : null}
    </div>
  );
}
