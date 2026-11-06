import { brandImage } from "@/lib/catalog";
import type { Brand } from "@/types/content";
import { PendingImage } from "./pending-image";

/** Background for a brand card's picture area: the logo's own background, or the photo well for product photos. */
export function brandWellClass(brand: Brand): string {
  if (!brand.logo) return "photo-well";
  return brand.logoBackground === "dark" ? "bg-charcoal" : "bg-white";
}

/** Brand logo, or the brand's first product photo when there is no logo. Place inside a `relative` box. */
export function BrandMedia({ brand, alt, sizes, nameFallback = false }: { brand: Brand; alt: string; sizes: string; nameFallback?: boolean }) {
  if (brand.logo) {
    return (
      <span className="absolute inset-x-[20%] inset-y-[26%]">
        <PendingImage src={brand.logo} alt={alt} fill sizes={sizes} className="object-contain" />
      </span>
    );
  }
  const image = brandImage(brand.slug);
  if (image) return <PendingImage src={image} alt={alt} fill sizes={sizes} className="object-contain p-4" />;
  return nameFallback ? (
    <span className="flex h-full items-center justify-center p-4 text-center text-3xl font-semibold tracking-tight text-muted">{brand.name}</span>
  ) : null;
}
