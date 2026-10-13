"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Localized } from "@/types/content";

export type CartLine = {
  productId: string;
  slug: string;
  variantId: string;
  name: Localized;
  variantLabel: Localized;
  price: number;
  qty: number;
  image: string;
  example: boolean;
  sku: string;
};

const KEY = "jah-cart-v1";
const EVENT = "jah-cart";

let snapshot = "[]";

function read(): string {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(KEY) ?? "[]";
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  snapshot = localStorage.getItem(KEY) ?? "[]";
  window.dispatchEvent(new Event(EVENT));
}

function parse(raw: string): CartLine[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter((line) => line && typeof line === "object") as CartLine[];
  } catch {
    return [];
  }
}

function subscribe(onStoreChange: () => void) {
  const handler = () => {
    snapshot = read();
    onStoreChange();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot() {
  snapshot = read();
  return snapshot;
}

function getServerSnapshot() {
  return "[]";
}

export function useCart() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const lines = parse(raw);

  const add = useCallback((line: Omit<CartLine, "qty"> & { qty?: number }) => {
    const current = parse(read());
    const qty = line.qty ?? 1;
    const index = current.findIndex(
      (item) => item.productId === line.productId && item.variantId === line.variantId,
    );
    if (index >= 0) {
      current[index] = { ...current[index], qty: Math.min(99, current[index].qty + qty) };
    } else {
      current.push({ ...line, qty: Math.min(99, qty) });
    }
    write(current);
  }, []);

  const setQty = useCallback((productId: string, variantId: string, qty: number) => {
    const current = parse(read()).flatMap((line) => {
      if (line.productId !== productId || line.variantId !== variantId) return [line];
      if (qty < 1) return [];
      return [{ ...line, qty: Math.min(99, qty) }];
    });
    write(current);
  }, []);

  const remove = useCallback((productId: string, variantId: string) => {
    write(parse(read()).filter((line) => line.productId !== productId || line.variantId !== variantId));
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  return { lines, count, subtotal, add, setQty, remove, clear };
}
