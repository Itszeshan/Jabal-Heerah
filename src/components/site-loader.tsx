"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LoadingMark } from "./loading-mark";

export function SiteLoader() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const t = useTranslations("common");
  const trip = useRef(0);
  const [boot, setBoot] = useState(true);
  const [nav, setNav] = useState<"off" | "bar" | "screen">("off");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let stopped = false;
    const finish = () => {
      if (stopped) return;
      stopped = true;
      const wait = Math.max(0, (reduce ? 0 : 800) - (performance.now() - start));
      window.setTimeout(() => setBoot(false), wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const cap = window.setTimeout(finish, 2000);
    return () => {
      stopped = true;
      window.removeEventListener("load", finish);
      window.clearTimeout(cap);
    };
  }, []);

  useEffect(() => {
    trip.current += 1;
    setNav("off");
  }, [pathname, search]);

  useEffect(() => {
    let timer = 0;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto:|tel:|whatsapp:)/.test(href)) return;
      let url: URL;
      try {
        url = new URL(href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      const id = (trip.current += 1);
      setNav("bar");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (trip.current === id) setNav("screen");
      }, 180);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(timer);
    };
  }, []);

  if (boot || nav === "screen") {
    return (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-paper" role="status" aria-live="polite">
        <div className="nav-progress" />
        <div className="flex flex-col items-center gap-6">
          <Image src="/jabal-logo.png" alt="" width={989} height={525} className="h-32 w-auto" priority />
          <LoadingMark />
          <p className="text-sm text-muted">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (nav === "bar") return <div className="nav-progress" role="status" aria-label={t("loading")} />;
  return null;
}
