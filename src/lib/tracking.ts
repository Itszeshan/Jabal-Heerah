"use client";

type TrackParams = Record<string, string | number | string[] | undefined>;

const metaNames: Record<string, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  generate_lead: "Lead",
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;
  const payload = { currency: "AED", ...params };
  window.fbq?.("track", metaNames[name] ?? name, payload);
  window.gtag?.("event", name, payload);
}
