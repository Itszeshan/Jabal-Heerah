"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { getOrder, type SavedOrder } from "@/lib/orders";
import { buttonClass } from "./ui";

export function OrderConfirmation() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const t = useTranslations("confirmation");
  const { clear } = useCart();
  const [order, setOrder] = useState<SavedOrder | null | undefined>(undefined);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setOrder(ref ? getOrder(ref) ?? null : null);
  }, [ref]);

  if (order === undefined) return <div className="min-h-40 border border-line bg-white" />;

  if (!order) {
    return (
      <div className="border border-line bg-white p-6">
        <p>{t("missing")}</p>
        <Link href="/cart" className={buttonClass("secondary", "mt-4")}>
          {t("backCart")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 border border-line bg-white p-4 md:p-6">
      <p className="text-sm text-muted">
        {t("ref")}: <span className="font-semibold text-ink">{order.ref}</span>
      </p>
      <p>{cleared ? t("cleared") : t("body")}</p>
      <pre className="overflow-auto whitespace-pre-wrap border border-line bg-paper p-3 text-sm">{order.message}</pre>
      <div className="flex flex-wrap gap-3">
        <a href={order.url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
          {t("resend")}
        </a>
        <button
          type="button"
          className={buttonClass("secondary")}
          onClick={() => {
            clear();
            setCleared(true);
          }}
        >
          {t("sent")}
        </button>
        <Link href="/shop" className={buttonClass("secondary")}>
          {t("backShop")}
        </Link>
      </div>
    </div>
  );
}
