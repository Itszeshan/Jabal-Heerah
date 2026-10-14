"use client";

import { List, MagnifyingGlass, ShoppingCart, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { site } from "../../config/site";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import type { Locale } from "@/types/content";
import { cx } from "./ui";

const links = [
  { href: "/shop", key: "shop" },
  { href: "/services", key: "services" },
  { href: "/brands", key: "brands" },
  { href: "/contact", key: "contact" },
] as const;

function LanguageSwitch({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale() as Locale;
  const t = useTranslations("nav");
  const query = searchParams.toString();
  const href = query ? `${pathname}?${query}` : pathname;
  const next = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={href}
      locale={next}
      hrefLang={next}
      className={cx("text-sm font-semibold", className)}
      aria-label={t("language")}
    >
      {locale === "ar" ? "EN" : "عربي"}
    </Link>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const name = site.name[locale];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-charcoal text-white">
      <div className="mx-auto flex h-24 max-w-7xl items-center gap-4 px-4">
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} aria-hidden /> : <List size={22} aria-hidden />}
          <span className="sr-only">{open ? common("closeMenu") : common("openMenu")}</span>
        </button>
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
          <Image src="/jabal-badge-512.png" alt="" width={512} height={512} className="size-20 shrink-0" priority />
          <span className="truncate text-sm font-semibold leading-tight">{name}</span>
        </Link>

        <nav className="ms-4 hidden items-center gap-5 lg:flex" aria-label="Main">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "text-sm underline-offset-[10px]",
                  active ? "font-semibold text-white underline decoration-orange decoration-2" : "text-white/75 hover:text-white",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <form action={`/${locale}/shop`} method="get" className="ms-auto hidden md:block" role="search">
          <label className="sr-only" htmlFor="header-search">
            {t("search")}
          </label>
          <div className="flex items-center border border-white/20 bg-white/5">
            <MagnifyingGlass size={18} className="ms-2 text-white/70" aria-hidden />
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder={t("searchPlaceholder")}
              className="h-10 w-40 bg-transparent px-2 text-sm text-white placeholder:text-white/60 lg:w-52"
            />
          </div>
        </form>

        <div className="ms-auto flex items-center gap-3 md:ms-0">
          <Suspense fallback={<span className="text-sm font-semibold">{locale === "ar" ? "EN" : "عربي"}</span>}>
            <LanguageSwitch className="hidden lg:inline" />
          </Suspense>
          <Link href="/cart" className="relative inline-flex size-11 items-center justify-center" aria-label={`${t("cart")} (${count})`}>
            <ShoppingCart size={22} aria-hidden />
            <span className="absolute end-1 top-1 min-w-5 bg-orange px-1 text-center text-[11px] font-semibold leading-5 text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>

      {open ? (
        <div id="site-menu" className="border-t border-white/10 bg-charcoal px-4 py-4 lg:hidden">
          <form action={`/${locale}/shop`} method="get" role="search" className="mb-4">
            <label className="mb-1 block text-sm" htmlFor="mobile-search">
              {t("search")}
            </label>
            <input
              id="mobile-search"
              name="q"
              type="search"
              placeholder={t("searchPlaceholder")}
              className="h-11 w-full border border-white/25 bg-transparent px-3 text-white placeholder:text-white/60"
            />
          </form>
          <nav className="grid gap-1" aria-label="Main">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center text-base font-semibold"
                onClick={() => setOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-3">
            <Suspense>
              <LanguageSwitch />
            </Suspense>
          </div>
        </div>
      ) : null}
    </header>
  );
}
