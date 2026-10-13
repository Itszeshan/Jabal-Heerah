import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Brand, Category, Locale } from "@/types/content";
import { text } from "@/lib/catalog";
import type { ShopQuery, SortKey } from "@/lib/shop";
import { withShopQuery } from "@/lib/shop";
import { cx } from "./ui";

const sorts: SortKey[] = ["name", "price-asc", "price-desc", "newest"];

export async function ShopFilters({
  locale,
  categories,
  brands,
  query,
  idPrefix,
}: {
  locale: Locale;
  categories: Category[];
  brands: Brand[];
  query: ShopQuery;
  idPrefix: string;
}) {
  const t = await getTranslations("shop");
  const common = await getTranslations("common");
  const action = withShopQuery(query.category, query, { page: 1 }).split("?")[0];

  return (
    <div className="grid gap-6">
      <form action={`/${locale}${action}`} method="get" className="grid gap-2" role="search">
        <label htmlFor={`${idPrefix}-q`} className="text-sm font-semibold">
          {t("searchLabel")}
        </label>
        <input
          id={`${idPrefix}-q`}
          name="q"
          defaultValue={query.q}
          className="min-h-11 border border-line bg-white px-3"
        />
        {query.brand ? <input type="hidden" name="brand" value={query.brand} /> : null}
        {query.min != null ? <input type="hidden" name="min" value={query.min} /> : null}
        {query.max != null ? <input type="hidden" name="max" value={query.max} /> : null}
        {query.sort !== "name" ? <input type="hidden" name="sort" value={query.sort} /> : null}
        <button type="submit" className="min-h-11 bg-charcoal px-4 text-sm font-semibold text-white">
          {common("apply")}
        </button>
      </form>

      <div>
        <h2 className="text-sm font-semibold">{t("category")}</h2>
        <ul className="mt-2 grid gap-1 text-sm">
          <li>
            <Link
              href={withShopQuery(query.category, query, { category: undefined })}
              className={cx("block py-1", !query.category && "font-semibold text-orange-ink")}
            >
              {common("all")}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={withShopQuery(query.category, query, { category: category.slug })}
                className={cx("block py-1", query.category === category.slug && "font-semibold text-orange-ink")}
                aria-current={query.category === category.slug ? "page" : undefined}
              >
                {text(category.name, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold">{t("brand")}</h2>
        <ul className="mt-2 grid gap-1 text-sm">
          <li>
            <Link
              href={withShopQuery(query.category, query, { brand: "" })}
              className={cx("block py-1", !query.brand && "font-semibold text-orange-ink")}
            >
              {common("all")}
            </Link>
          </li>
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={withShopQuery(query.category, query, { brand: brand.slug })}
                className={cx("block py-1", query.brand === brand.slug && "font-semibold text-orange-ink")}
              >
                {brand.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <form action={`/${locale}${action}`} method="get" className="grid gap-2">
        <p className="text-sm font-semibold">{t("price")}</p>
        {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
        {query.brand ? <input type="hidden" name="brand" value={query.brand} /> : null}
        {query.sort !== "name" ? <input type="hidden" name="sort" value={query.sort} /> : null}
        <label htmlFor={`${idPrefix}-min`} className="text-sm">
          {t("min")}
        </label>
        <input
          id={`${idPrefix}-min`}
          name="min"
          inputMode="decimal"
          defaultValue={query.min ?? ""}
          className="min-h-11 border border-line bg-white px-3"
        />
        <label htmlFor={`${idPrefix}-max`} className="text-sm">
          {t("max")}
        </label>
        <input
          id={`${idPrefix}-max`}
          name="max"
          inputMode="decimal"
          defaultValue={query.max ?? ""}
          className="min-h-11 border border-line bg-white px-3"
        />
        <button type="submit" className="min-h-11 bg-charcoal px-4 text-sm font-semibold text-white">
          {common("apply")}
        </button>
      </form>

      <div>
        <h2 className="text-sm font-semibold">{t("sort")}</h2>
        <ul className="mt-2 grid gap-1 text-sm">
          {sorts.map((sort) => (
            <li key={sort}>
              <Link
                href={withShopQuery(query.category, query, { sort })}
                className={cx("block py-1", query.sort === sort && "font-semibold text-orange-ink")}
              >
                {t(sort === "name" ? "sortName" : sort === "price-asc" ? "sortPriceAsc" : sort === "price-desc" ? "sortPriceDesc" : "sortNewest")}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link href={query.category ? `/shop/${query.category}` : "/shop"} className="text-sm font-semibold text-orange-ink">
        {common("clear")}
      </Link>
    </div>
  );
}
