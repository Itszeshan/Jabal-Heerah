import { site } from "../../config/site";
import { brandName, text } from "./catalog";
import type { Locale, Product, Service } from "@/types/content";

export function localBusinessJsonLd(locale: Locale): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["AutoPartsStore", "LocalBusiness"],
    name: site.name[locale],
    url: `${site.url}/${locale}`,
    telephone: `+${site.whatsapp}`,
    currenciesAccepted: "AED",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.streetAddress,
      addressLocality: site.address.addressLocality,
      addressRegion: site.address.addressRegion,
      addressCountry: site.address.addressCountry,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "08:00",
        closes: "13:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "16:00",
        closes: "21:00",
      },
    ],
  };

  if (site.geo) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    };
  }

  return data;
}

export function productJsonLd(product: Product, locale: Locale): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: text(product.name, locale),
    description: text(product.description, locale),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: brandName(product.brand) },
    url: `${site.url}/${locale}/product/${product.slug}`,
  };

  if (!product.example && product.images[0]?.startsWith("/")) {
    data.image = `${site.url}${product.images[0]}`;
  }

  if (!product.example) {
    const variant = product.variants[0];
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      priceCurrency: "AED",
      price: variant?.price ?? 0,
      url: `${site.url}/${locale}/product/${product.slug}`,
    };
    if (variant?.inStock) offer.availability = "https://schema.org/InStock";
    data.offers = offer;
  }

  return data;
}

export function serviceJsonLd(service: Service, locale: Locale): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: text(service.name, locale),
    description: text(service.short, locale),
    url: `${site.url}/${locale}/services/${service.slug}`,
    provider: {
      "@type": "AutoPartsStore",
      name: site.name[locale],
      telephone: `+${site.whatsapp}`,
    },
    areaServed: "Sharjah",
  };

  if (service.startingPrice != null) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "AED",
      price: service.startingPrice,
    };
  }

  return data;
}
