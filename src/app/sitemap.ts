import type { MetadataRoute } from "next";
import { site } from "../../config/site";
import { getCategories, getProducts, getServices } from "@/lib/catalog";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/shop",
    "/services",
    "/brands",
    "/about",
    "/contact",
    "/faq",
    "/cart",
    "/checkout",
    ...getCategories().map((category) => `/shop/${category.slug}`),
    ...getProducts().map((product) => `/product/${product.slug}`),
    ...getServices().map((service) => `/services/${service.slug}`),
  ];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${site.url}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: `${site.url}/en${path}`,
          ar: `${site.url}/ar${path}`,
        },
      },
    })),
  );
}
