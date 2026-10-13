import { minPrice } from "./catalog";
import type { Product } from "@/types/content";

export type SortKey = "name" | "price-asc" | "price-desc" | "newest";

export type ShopQuery = {
  q: string;
  brand: string;
  min?: number;
  max?: number;
  sort: SortKey;
  page: number;
  category?: string;
};

const sorts = new Set<SortKey>(["name", "price-asc", "price-desc", "newest"]);

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function numberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
}

export function parseShopQuery(
  searchParams: Record<string, string | string[] | undefined>,
  category?: string,
): ShopQuery {
  const sortValue = first(searchParams.sort);
  const sort = sorts.has(sortValue as SortKey) ? (sortValue as SortKey) : "name";
  const pageValue = Number(first(searchParams.page));
  const page = Number.isFinite(pageValue) && pageValue > 1 ? Math.floor(pageValue) : 1;

  return {
    q: first(searchParams.q).trim(),
    brand: first(searchParams.brand).trim(),
    min: numberOrUndefined(first(searchParams.min)),
    max: numberOrUndefined(first(searchParams.max)),
    sort,
    page,
    category,
  };
}

export function filterProducts(products: Product[], query: ShopQuery): Product[] {
  const q = query.q.toLowerCase();
  const filtered = products.filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (query.brand && product.brand !== query.brand) return false;
    const price = minPrice(product);
    if (query.min != null && price < query.min) return false;
    if (query.max != null && price > query.max) return false;
    if (!q) return true;
    const haystack = [
      product.name.en,
      product.name.ar,
      product.brand,
      product.category,
      product.subcategory,
      ...product.tags,
      ...product.variants.map((variant) => variant.sku),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (query.sort === "price-asc") return minPrice(a) - minPrice(b);
    if (query.sort === "price-desc") return minPrice(b) - minPrice(a);
    if (query.sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    return a.name.en.localeCompare(b.name.en);
  });
  return sorted;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), pages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pages,
    total: items.length,
  };
}

export function shopPath(category?: string): string {
  return category ? `/shop/${category}` : "/shop";
}

export function withShopQuery(
  category: string | undefined,
  current: ShopQuery,
  patch: Partial<ShopQuery> & { category?: string | undefined },
): string {
  const nextCategory = "category" in patch ? patch.category : category;
  const next: ShopQuery = {
    ...current,
    ...patch,
    category: nextCategory,
    page: patch.page ?? 1,
  };
  if (!("page" in patch)) next.page = 1;

  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.brand) params.set("brand", next.brand);
  if (next.min != null) params.set("min", String(next.min));
  if (next.max != null) params.set("max", String(next.max));
  if (next.sort !== "name") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return `${shopPath(nextCategory)}${qs ? `?${qs}` : ""}`;
}
