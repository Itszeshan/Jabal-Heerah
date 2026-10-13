import "server-only";
import { text } from "./text";
import aboutJson from "../../content/about.json";
import brandsJson from "../../content/brands.json";
import categoriesJson from "../../content/categories.json";
import faqJson from "../../content/faq.json";
import productsJson from "../../content/products.json";
import servicesJson from "../../content/services.json";
import type {
  AboutContent,
  Brand,
  Category,
  FaqItem,
  Locale,
  Product,
  Service,
} from "@/types/content";

/**
 * Content access. Pages call these functions only.
 * A later CMS or Shopify source can replace the JSON imports here.
 */
const products = productsJson as Product[];
const categories = categoriesJson as Category[];
const brands = brandsJson as Brand[];
const services = servicesJson as Service[];
const faq = faqJson as FaqItem[];
const about = aboutJson as AboutContent;

export function getProducts(): Product[] {
  return products.filter((product) => !product.hidden);
}

export function getProduct(slug: string): Product | undefined {
  const product = products.find((item) => item.slug === slug);
  if (!product || product.hidden) return undefined;
  return product;
}

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getBrands(): Brand[] {
  return brands;
}

export function getBrand(slug: string): Brand | undefined {
  return brands.find((brand) => brand.slug === slug);
}

const imageByBrand = new Map<string, string>();
const imageByCategory = new Map<string, string>();
for (const product of products) {
  if (product.hidden) continue;
  const src = product.images.find((image) => image.startsWith("/"));
  if (!src) continue;
  if (!imageByBrand.has(product.brand)) imageByBrand.set(product.brand, src);
  if (!imageByCategory.has(product.category)) imageByCategory.set(product.category, src);
}

export function brandImage(slug: string): string {
  return imageByBrand.get(slug) ?? "";
}

export function categoryImage(slug: string): string {
  return imageByCategory.get(slug) ?? "";
}

export function saleProducts(): Product[] {
  return getProducts().filter(
    (product) =>
      product.images.some((image) => image.startsWith("/")) &&
      product.variants.some((variant) => variant.compareAtPrice != null && variant.compareAtPrice > variant.price),
  );
}

export function getServices(): Service[] {
  return services;
}

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getFaq(): FaqItem[] {
  return faq;
}

export function getAbout(): AboutContent {
  return about;
}

export function hasExampleProducts(): boolean {
  return products.some((product) => product.example);
}

export { text };

export function brandName(slug: string): string {
  return getBrand(slug)?.name ?? slug;
}

export function categoryName(slug: string, locale: Locale): string {
  const category = getCategory(slug);
  return category ? text(category.name, locale) : slug;
}

export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price));
}

export function productInStock(product: Product): boolean {
  return product.variants.some((variant) => variant.inStock);
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  return getProducts()
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit);
}
