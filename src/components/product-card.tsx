import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { brandName, minPrice, productInStock, text } from "@/lib/catalog";
import { formatAed } from "@/lib/format";
import type { Locale, Product } from "@/types/content";
import { ProductMedia } from "./product-media";

export async function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const t = await getTranslations("common");
  const price = formatAed(minPrice(product), locale);
  const priced = product.variants.length > 1 ? t("fromPrice", { price }) : price;

  return (
    <article className="shelf-card flex h-full flex-col">
      <Link href={`/product/${product.slug}`} className="block border-b border-line">
        <ProductMedia src={product.images[0]} alt={text(product.name, locale)} sizes="(min-width: 1024px) 25vw, 50vw" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-muted">{brandName(product.brand)}</p>
        <h3 className="text-base font-semibold leading-snug">
          <Link href={`/product/${product.slug}`} className="hover:text-orange-ink">
            {text(product.name, locale)}
          </Link>
        </h3>
        <p className="mt-auto pt-2 text-sm font-semibold tabular-nums">{priced}</p>
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{productInStock(product) ? t("inStock") : t("askAvailability")}</span>
          {product.example ? (
            <span className="bg-charcoal px-1.5 py-0.5 font-semibold text-white">{t("example")}</span>
          ) : null}
        </p>
      </div>
    </article>
  );
}
