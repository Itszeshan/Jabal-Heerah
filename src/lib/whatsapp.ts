import { site } from "../../config/site";
import { formatAedPlain } from "./format";

export type OrderItem = {
  name: string;
  variant: string;
  qty: number;
  lineTotal: number;
};

export type OrderDraft = {
  ref: string;
  name: string;
  phone: string;
  fulfilment: "pickup" | "delivery";
  address?: string;
  time?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  source?: string;
  samplePrices?: boolean;
};

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function makeOrderRef(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let id = "";
  for (const byte of bytes) id += alphabet[byte % alphabet.length];
  return `JAH-${y}${m}${d}-${id}`;
}

export function buildOrderMessage(order: OrderDraft): string {
  const lines = [
    "New order - Jabal Al Heerah website",
    `Ref: ${order.ref}`,
    `Name: ${clean(order.name)}`,
    `Phone: ${clean(order.phone)}`,
    order.fulfilment === "delivery"
      ? `Fulfilment: Delivery (${clean(order.address ?? "")})`
      : "Fulfilment: Pickup",
  ];

  if (order.time) lines.push(`Time: ${clean(order.time)}`);
  lines.push("Items:");
  order.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${clean(item.name)} - ${clean(item.variant)} x ${item.qty} = AED ${formatAedPlain(item.lineTotal)}`,
    );
  });
  lines.push(`Subtotal: AED ${formatAedPlain(order.subtotal)}`);
  if (order.notes) lines.push(`Notes: ${clean(order.notes)}`);
  if (order.samplePrices) {
    lines.push("Sample prices: example catalogue, confirm with the shop");
  }
  if (order.source) lines.push(`Source: ${order.source}`);
  return lines.join("\n");
}

export type ServiceQuote = {
  ref: string;
  service: string;
  name: string;
  phone: string;
  car: string;
  date?: string;
  notes?: string;
  source?: string;
};

export function buildServiceMessage(quote: ServiceQuote): string {
  const lines = [
    "Service quote - Jabal Al Heerah website",
    `Ref: ${quote.ref}`,
    `Service: ${clean(quote.service)}`,
    `Name: ${clean(quote.name)}`,
    `Phone: ${clean(quote.phone)}`,
    `Car: ${clean(quote.car)}`,
  ];
  if (quote.date) lines.push(`Preferred date: ${clean(quote.date)}`);
  if (quote.notes) lines.push(`Notes: ${clean(quote.notes)}`);
  lines.push("Please send photos of the damage on WhatsApp.");
  if (quote.source) lines.push(`Source: ${quote.source}`);
  return lines.join("\n");
}

export function buildProductQuestion(productName: string, variant: string, pageUrl: string): string {
  return [
    "Question - Jabal Al Heerah website",
    `Product: ${clean(productName)} - ${clean(variant)}`,
    pageUrl,
  ].join("\n");
}

export function waUrl(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
