export type Locale = "en" | "ar";

export type Localized = {
  en: string;
  ar: string;
};

export type Variant = {
  id: string;
  label: Localized;
  price: number;
  compareAtPrice?: number;
  sku: string;
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  brand: string;
  category: string;
  subcategory: string;
  description: Localized;
  images: string[];
  variants: Variant[];
  featured: boolean;
  tags: string[];
  example: boolean;
  hidden?: boolean;
  createdAt: string;
};

export type Category = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  featured: boolean;
  count?: number;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  description: Localized;
  count?: number;
};

export type Service = {
  id: string;
  slug: string;
  name: Localized;
  short: Localized;
  body: Localized;
  startingPrice: number | null;
  duration: Localized;
  image: string;
  featured: boolean;
};

export type FaqItem = {
  id: string;
  question: Localized;
  answer: Localized;
  placeholder: boolean;
};

export type AboutContent = {
  title: Localized;
  body: Localized;
  photos: string[];
};
