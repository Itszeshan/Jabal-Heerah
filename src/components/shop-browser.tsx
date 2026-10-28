"use client";

import { PendingImage } from "./pending-image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { site } from "../../config/site";
import catalog from "../../content/catalog-index.json";
import { FilterSheet } from "@/components/filter-sheet";
import { Link, useRouter } from "@/i18n/navigation";
import { formatAed } from "@/lib/format";
import type { Locale } from "@/types/content";

export type CatalogItem = {
  slug: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  brandName: string;
  category: string;
  /** Null when every size is price on request. */
  price: number | null;
  sizes: string[];
  inStock: boolean;
  image: string;
  createdAt: string;
  search: string;
};

export type ShopQuery = {
  q: string;
  brand: string;
  cat: string;
  size: string;
  min: string;
  max: string;
  sort: string;
  page: number;
};

type CategoryOption = { slug: string; name: string };

const items = catalog as CatalogItem[];
const chips = ["#1b1e22", "#c44912", "#f7f7f8", "#5c6b73"];

const UNIT_RANK: Record<string, number> = { ML: 1, L: 2, G: 3, KG: 4, GAL: 5, MM: 6, CM: 7, INCH: 8, PCS: 9 };

function sizeRank(label: string): [number, number, string] {
  const match = label.match(/^(\d+(?:\.\d+)?)([A-Z]+)$/);
  if (!match) return [99, 0, label];
  return [UNIT_RANK[match[2]] ?? 50, Number(match[1]), label];
}

function matches(item: CatalogItem, query: ShopQuery, ignore = ""): boolean {
  const text = query.q.trim().toLowerCase();
  if (ignore !== "q" && text && !item.search.includes(text)) return false;
  if (ignore !== "brand" && query.brand && item.brand !== query.brand) return false;
  if (ignore !== "cat" && query.cat && item.category !== query.cat) return false;
  if (ignore !== "size" && query.size && !item.sizes.includes(query.size)) return false;
  const min = Number(query.min);
  const max = Number(query.max);
  if (ignore !== "price" && query.min && Number.isFinite(min) && (item.price == null || item.price < min)) return false;
  if (ignore !== "price" && query.max && Number.isFinite(max) && (item.price == null || item.price > max)) return false;
  return true;
}

function hrefFor(query: ShopQuery, path: string): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.brand) params.set("brand", query.brand);
  if (!path.startsWith("/shop/") && query.cat) params.set("cat", query.cat);
  if (query.size) params.set("size", query.size);
  if (query.min) params.set("min", query.min);
  if (query.max) params.set("max", query.max);
  if (query.sort && query.sort !== "name") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

function queryKey(query: ShopQuery): string {
  return JSON.stringify(query);
}

export function ShopBrowser({
  locale,
  serverQuery,
  categories,
  lockedCategory,
  title,
  intro,
  sampleBanner,
}: {
  locale: Locale;
  serverQuery: ShopQuery;
  categories: CategoryOption[];
  lockedCategory?: string;
  title: string;
  intro: string;
  sampleBanner?: string;
}) {
  const router = useRouter();
  const t = useTranslations("shop");
  const common = useTranslations("common");
  const [query, setQuery] = useState(serverQuery);
  const [seen, setSeen] = useState(serverQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (queryKey(seen) !== queryKey(serverQuery)) {
    setSeen(serverQuery);
    setQuery(serverQuery);
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const path = lockedCategory ? `/shop/${lockedCategory}` : "/shop";

  function commit(next: ShopQuery, delay = 0) {
    setQuery(next);
    if (timer.current) clearTimeout(timer.current);
    const write = () => router.replace(hrefFor(next, path), { scroll: next.page !== query.page });
    if (delay) timer.current = setTimeout(write, delay);
    else write();
  }

  function patch(partial: Partial<ShopQuery>, delay = 0) {
    const resetPage = partial.page == null;
    commit({ ...query, ...partial, page: resetPage ? 1 : partial.page ?? query.page }, delay);
  }

  const filtered = useMemo(() => items.filter((item) => matches(item, query)), [query]);
  const brandFacets = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const item of items) {
      if (!matches(item, query, "brand")) continue;
      const current = counts.get(item.brand) ?? { name: item.brandName, count: 0 };
      current.count += 1;
      counts.set(item.brand, current);
    }
    return [...counts.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [query]);
  const categoryFacets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (!matches(item, query, "cat")) continue;
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return categories
      .map((category) => ({ ...category, count: counts.get(category.slug) ?? 0 }))
      .filter((category) => category.count > 0 || category.slug === query.cat);
  }, [categories, query]);
  const sizeFacets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (!matches(item, query, "size")) continue;
      for (const size of new Set(item.sizes)) counts.set(size, (counts.get(size) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => {
      const left = sizeRank(a[0]);
      const right = sizeRank(b[0]);
      return left[0] - right[0] || left[1] - right[1] || left[2].localeCompare(right[2]);
    });
  }, [query]);

  const sorted = useMemo(() => {
    const list = filtered.slice();
    list.sort((a, b) => {
      if (query.sort === "price-asc") return (a.price ?? Infinity) - (b.price ?? Infinity) || a.nameEn.localeCompare(b.nameEn);
      if (query.sort === "price-desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity) || a.nameEn.localeCompare(b.nameEn);
      if (query.sort === "newest") return b.createdAt.localeCompare(a.createdAt) || a.nameEn.localeCompare(b.nameEn);
      const nameA = locale === "ar" && a.nameAr ? a.nameAr : a.nameEn;
      const nameB = locale === "ar" && b.nameAr ? b.nameAr : b.nameEn;
      return nameA.localeCompare(nameB, locale);
    });
    return list;
  }, [filtered, locale, query.sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / site.pageSize));
  const page = Math.min(Math.max(1, query.page), pages);
  const visible = sorted.slice((page - 1) * site.pageSize, page * site.pageSize);
  const filtersActive = Boolean(query.q || query.brand || (!lockedCategory && query.cat) || query.size || query.min || query.max);

  const filters = (
    <div className="grid gap-6">
      <Facet
        title={t("category")}
        allLabel={t("allCategories")}
        selected={query.cat}
        onClear={() => {
          if (lockedCategory) router.replace(hrefFor({ ...query, cat: "", page: 1 }, "/shop"), { scroll: false });
          else patch({ cat: "" });
        }}
        options={categoryFacets.map((category) => ({
          id: category.slug,
          label: category.name,
          count: category.count,
        }))}
        onPick={(slug) => {
          const next = { ...query, cat: slug, page: 1 };
          setQuery(next);
          router.replace(hrefFor(next, `/shop/${slug}`), { scroll: false });
        }}
      />
      <Facet
        title={t("brand")}
        allLabel={t("allBrands")}
        selected={query.brand}
        onClear={() => patch({ brand: "" })}
        options={brandFacets.map(([slug, info]) => ({ id: slug, label: info.name, count: info.count }))}
        onPick={(slug) => patch({ brand: slug })}
      />
      <Facet
        title={t("size")}
        allLabel={t("allSizes")}
        selected={query.size}
        onClear={() => patch({ size: "" })}
        options={sizeFacets.map(([label, count]) => ({ id: label, label, count }))}
        onPick={(size) => patch({ size })}
      />
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">{t("price")}</legend>
        <label className="grid gap-1 text-xs text-muted">
          {t("min")}
          <input
            inputMode="decimal"
            value={query.min}
            onChange={(event) => patch({ min: event.target.value }, 350)}
            className="min-h-11 border border-line bg-white px-3 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-xs text-muted">
          {t("max")}
          <input
            inputMode="decimal"
            value={query.max}
            onChange={(event) => patch({ max: event.target.value }, 350)}
            className="min-h-11 border border-line bg-white px-3 text-sm text-ink"
          />
        </label>
      </fieldset>
      {filtersActive ? (
        <button
          type="button"
          className="min-h-11 text-start text-sm font-semibold text-orange-ink"
          onClick={() => {
            const cleared = { q: "", brand: "", cat: lockedCategory ?? "", size: "", min: "", max: "", sort: "name", page: 1 };
            commit(cleared);
          }}
        >
          {common("clear")}
        </button>
      ) : null}
    </div>
  );

  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{intro}</p>
      {sampleBanner ? <p className="mt-4 border border-line bg-white px-3 py-2 text-sm">{sampleBanner}</p> : null}

      <label className="mt-6 grid gap-2 text-sm font-semibold">
        {t("searchLabel")}
        <input
          value={query.q}
          onChange={(event) => patch({ q: event.target.value }, 250)}
          className="min-h-11 border border-line bg-white px-3 font-normal"
        />
      </label>

      <div className="mt-6 lg:hidden">
        <FilterSheet label={t("filters")} closeLabel={common("close")}>
          {filters}
        </FilterSheet>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">{common("results", { count: sorted.length })}</p>
            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{t("sort")}</span>
              <select
                value={query.sort}
                onChange={(event) => patch({ sort: event.target.value })}
                className="min-h-11 border border-line bg-white px-3"
              >
                <option value="name">{t("sortName")}</option>
                <option value="price-asc">{t("sortPriceAsc")}</option>
                <option value="price-desc">{t("sortPriceDesc")}</option>
                <option value="newest">{t("sortNewest")}</option>
              </select>
            </label>
          </div>

          {visible.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
              {visible.map((item) => {
                const name = locale === "ar" && item.nameAr ? item.nameAr : item.nameEn;
                const price = item.price == null ? "" : formatAed(item.price, locale);
                const priced = item.price == null ? common("priceOnRequest") : item.sizes.length > 1 ? common("fromPrice", { price }) : price;
                return (
                  <article key={item.slug} className="shelf-card flex h-full flex-col">
                    <Link href={`/product/${item.slug}`} className="block border-b border-line">
                      {item.image.startsWith("/") ? (
                        <div className="photo-well relative aspect-square">
                          <PendingImage src={item.image} alt={name} fill sizes="(min-width: 1280px) 22vw, 50vw" className="object-contain p-3" />
                        </div>
                      ) : (
                        <div className="flex aspect-square flex-col justify-between bg-[#e6e9ed] p-3">
                          <p className="text-xs font-medium text-muted">{common("photoPlaceholder")}</p>
                          <div className="grid grid-cols-4 gap-1" aria-hidden>
                            {chips.map((color) => (
                              <span key={color} className="h-8" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col gap-1.5 p-3">
                      <p className="text-xs text-muted">{item.brandName}</p>
                      <h2 className="text-[15px] font-semibold leading-snug">
                        <Link href={`/product/${item.slug}`} className="hover:text-orange-ink">
                          {name}
                        </Link>
                      </h2>
                      <p className="mt-auto pt-2 text-sm font-semibold tabular-nums">{priced}</p>
                      <p className="text-xs text-muted">{item.inStock ? common("inStock") : common("askAvailability")}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 border border-line bg-white p-6">{common("noResults")}</p>
          )}

          {pages > 1 ? (
            <nav className="mt-6 flex flex-wrap items-center gap-3" aria-label={common("page", { page, pages })}>
              {page > 1 ? (
                <button type="button" className="min-h-11 border border-line bg-white px-4 py-2 text-sm font-semibold" onClick={() => patch({ page: page - 1 })}>
                  {common("previous")}
                </button>
              ) : null}
              <span className="text-sm">{common("page", { page, pages })}</span>
              {page < pages ? (
                <button type="button" className="min-h-11 border border-line bg-white px-4 py-2 text-sm font-semibold" onClick={() => patch({ page: page + 1 })}>
                  {common("next")}
                </button>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Facet({
  title,
  allLabel,
  selected,
  options,
  onPick,
  onClear,
}: {
  title: string;
  allLabel: string;
  selected: string;
  options: { id: string; label: string; count: number }[];
  onPick: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-2 max-h-64 overflow-auto">
        <button type="button" onClick={onClear} aria-pressed={!selected} className={`flex min-h-11 w-full items-center justify-between gap-3 px-1 text-start text-sm ${selected ? "" : "font-semibold text-orange-ink"}`}>
          <span>{allLabel}</span>
        </button>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onPick(option.id)}
            aria-pressed={selected === option.id}
            className={`flex min-h-11 w-full items-center justify-between gap-3 border-s-2 px-2 text-start text-sm ${selected === option.id ? "border-orange font-semibold text-orange-ink" : "border-transparent"}`}
          >
            <span>{option.label}</span>
            <span className="text-muted">{option.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
