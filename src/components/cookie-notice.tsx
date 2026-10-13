"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

const KEY = "jah-cookie-v1";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("jah-cookie", onStoreChange);
  return () => window.removeEventListener("jah-cookie", onStoreChange);
}

function getSnapshot() {
  return localStorage.getItem(KEY) ?? "";
}

export function CookieNotice() {
  const t = useTranslations("cookie");
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => "unknown");
  if (stored) return null;

  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">{t("text")}</p>
        <button
          type="button"
          className="min-h-11 shrink-0 bg-charcoal px-4 text-sm font-semibold text-white"
          onClick={() => {
            localStorage.setItem(KEY, "ok");
            window.dispatchEvent(new Event("jah-cookie"));
          }}
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
