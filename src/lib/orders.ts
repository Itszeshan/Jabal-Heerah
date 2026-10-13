"use client";

import type { OrderDraft } from "./whatsapp";

export type SavedOrder = OrderDraft & {
  createdAt: string;
  message: string;
  url: string;
};

const KEY = "jah-orders-v1";

export function saveOrder(order: SavedOrder) {
  const existing = listOrders().filter((item) => item.ref !== order.ref);
  existing.unshift(order);
  localStorage.setItem(KEY, JSON.stringify(existing.slice(0, 30)));
}

export function listOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown;
    return Array.isArray(value) ? (value as SavedOrder[]) : [];
  } catch {
    return [];
  }
}

export function getOrder(ref: string): SavedOrder | undefined {
  return listOrders().find((order) => order.ref === ref);
}
