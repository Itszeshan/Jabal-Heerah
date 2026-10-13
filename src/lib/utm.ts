"use client";

const KEY = "jah-utm-v1";
const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type UtmBag = Partial<Record<(typeof FIELDS)[number], string>>;

export function captureUtm() {
  const params = new URLSearchParams(window.location.search);
  const found: UtmBag = {};
  let any = false;
  for (const field of FIELDS) {
    const value = params.get(field);
    if (value) {
      found[field] = value.slice(0, 120);
      any = true;
    }
  }
  if (!any) return;
  const previous = readUtm();
  localStorage.setItem(KEY, JSON.stringify({ ...previous, ...found }));
}

export function readUtm(): UtmBag {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "{}") as UtmBag;
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

/** "source/campaign" when either value was stored. */
export function utmSourceLine(): string | undefined {
  const utm = readUtm();
  if (!utm.utm_source && !utm.utm_campaign) return undefined;
  return `${utm.utm_source ?? "-"}/${utm.utm_campaign ?? "-"}`;
}
