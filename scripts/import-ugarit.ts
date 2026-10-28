import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pricing } from "../config/pricing";
import type { Brand, Category, Product, Variant } from "../src/types/content";

type SourceProduct = {
  offer_id: number;
  name: string;
  brand: string;
  product_code: string;
  price_aed: string;
  old_price_aed: string;
  categories: string;
  image_url: string;
};

type Row = {
  offerId: number;
  rawName: string;
  title: string;
  baseTitle: string;
  brandKey: string;
  brandName: string;
  brandSlug: string;
  category: string;
  sourceCategory: string;
  sizeLabel: string | null;
  price: number;
  compareAt: number | null;
  sku: string;
  code: string;
  imageUrl: string;
};

const ROOT = process.cwd();
const today = new Date().toISOString().slice(0, 10);

const KEEP = new Set([
  "ML", "L", "LTR", "LT", "KG", "G", "GAL", "PCS", "MM", "CM", "UV", "HS", "2K", "1K",
  "3M", "4CR", "OEM", "PVC", "LED", "AC", "HD", "XL", "II", "III", "IV", "CR", "RUPES",
]);

const SITE_CATEGORIES: Array<Omit<Category, "count">> = [
  { id: "clear-coats", slug: "clear-coats", name: { en: "Clear coats & hardeners", ar: "الكلير والمصلّبات" }, description: { en: "Clear coats and the hardeners mixed with them.", ar: "كلير كوت والمصلّبات التي تُخلط معه." }, featured: true },
  { id: "primers", slug: "primers", name: { en: "Primers", ar: "البرايمر" }, description: { en: "Primers for bare metal, plastic, and repaired panels.", ar: "برايمر للمعدن العاري والبلاستيك والقطع بعد الإصلاح." }, featured: true },
  { id: "body-fillers", slug: "body-fillers", name: { en: "Body fillers & putty", ar: "المعجون والحشو" }, description: { en: "Body filler and putty for dents and panel repair.", ar: "معجون وحشو للخدوش وإصلاح القطع." }, featured: true },
  { id: "thinners", slug: "thinners", name: { en: "Thinners", ar: "الثنر" }, description: { en: "Thinners for mixing and gun cleaning.", ar: "ثنر للخلط وتنظيف مسدس الرش." }, featured: false },
  { id: "spray-paints", slug: "spray-paints", name: { en: "Spray paints & aerosols", ar: "بخاخات الدهان" }, description: { en: "Aerosols and basecoat for colour work.", ar: "بخاخات وبيس كوت لأعمال اللون." }, featured: true },
  { id: "abrasives", slug: "abrasives", name: { en: "Abrasives & sanding", ar: "السنفرة والورق" }, description: { en: "Sanding discs, sheets, and rolls.", ar: "أقراص ورق السنفرة والرولات." }, featured: true },
  { id: "masking", slug: "masking", name: { en: "Masking tapes & paper", ar: "أشرطة وورق التقنيع" }, description: { en: "Masking tape and paper for spray work.", ar: "شريط وورق تقنيع لأعمال الرش." }, featured: false },
  { id: "polishing", slug: "polishing", name: { en: "Polishing compounds & pads", ar: "معاجين التلميع والبادات" }, description: { en: "Compounds, polishes, and machine pads.", ar: "معاجين تلميع وبادات الماكينات." }, featured: true },
  { id: "spray-guns", slug: "spray-guns", name: { en: "Spray guns & tools", ar: "مسدسات الرش والأدوات" }, description: { en: "Spray guns and refinish tools.", ar: "مسدسات الرش وأدوات السمكرة." }, featured: false },
  { id: "ppe", slug: "ppe", name: { en: "PPE & safety", ar: "السلامة والحماية" }, description: { en: "Masks, gloves, and booth safety gear.", ar: "كمامات وقفازات ومستلزمات الحماية." }, featured: false },
  { id: "car-care", slug: "car-care", name: { en: "Car care & detailing", ar: "العناية والتلميع" }, description: { en: "Compounds and products for washing and detailing.", ar: "منتجات الغسيل والتلميع والعناية." }, featured: false },
  { id: "bed-liners", slug: "bed-liners", name: { en: "Bed liners", ar: "بطانات الحماية" }, description: { en: "Bed liner and textured coatings.", ar: "بطانة الحماية والطلاء المحبب." }, featured: true },
  { id: "other", slug: "other", name: { en: "Other", ar: "أخرى" }, description: { en: "Items that do not sit in the other shelves yet.", ar: "منتجات لم تُوضع في رف آخر بعد." }, featured: false },
];

const BRAND_DISPLAY: Record<string, string> = {
  MEGUIARS: "Meguiar's",
  "3M": "3M",
  "4CR": "4CR",
  RUPES: "RUPES",
  SONAX: "Sonax",
  "TURTLE WAX": "Turtle Wax",
  MIRKA: "Mirka",
  SCANGRIP: "Scangrip",
  "POKA PREMIUM": "Poka Premium",
  DEVILBISS: "DeVilbiss",
  WURTH: "Wurth",
  "LIQUI MOLY": "Liqui Moly",
  FORMULA1: "Formula 1",
  IWATA: "Iwata",
  FARECLA: "Farecla",
  "U-POL": "U-POL",
  UPOL: "U-POL",
  RAPTOR: "U-POL Raptor",
  NUMIX: "Numix",
  GENERIC: "Generic",
  OTHER: "Other",
};

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function parseCsv(text: string): Record<string, string>[] {
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((line) => line.some((value) => value.trim()));
  if (!header) return [];
  return body.map((values) => {
    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      record[key.trim()] = (values[index] ?? "").trim();
    });
    return record;
  });
}

function readCsv(file: string): Record<string, string>[] {
  if (!existsSync(file)) return [];
  return parseCsv(readFileSync(file, "utf8"));
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return slug || "item";
}

function styleCore(token: string): string {
  const upper = token.toUpperCase();
  if (KEEP.has(upper) || /^P\d+$/i.test(token)) return upper;
  if (/^\d+(?:[.,]\d+)?[A-Za-z]+$/.test(token)) {
    return token.replace(/[A-Za-z]+$/, (letters) => {
      const lettersUpper = letters.toUpperCase();
      return KEEP.has(lettersUpper) || lettersUpper.length <= 3 ? lettersUpper : letters[0].toUpperCase() + letters.slice(1).toLowerCase();
    }).replace(",", ".");
  }
  if (/\d/.test(token) && token === upper) return token;
  return token
    .split("-")
    .map((part) => {
      if (!part) return part;
      if (KEEP.has(part.toUpperCase()) || /^P\d+$/i.test(part)) return part.toUpperCase();
      if (/^\d/.test(part) && part === part.toUpperCase()) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("-");
}

function titleToken(token: string): string {
  const match = token.match(/^([^A-Za-z0-9]*)([A-Za-z0-9][A-Za-z0-9./+-]*)([^A-Za-z0-9]*)$/);
  if (!match) return token;
  return match[1] + styleCore(match[2]) + match[3];
}

function toTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim().split(" ").map(titleToken).join(" ");
}

function brandDisplay(key: string): string {
  const upper = key.toUpperCase();
  return BRAND_DISPLAY[upper] ?? toTitle(key);
}

function brandSlugFor(name: string): string {
  const slug = slugify(name);
  if (slug === "u-pol" || slug === "u-pol-raptor" || slug === "raptor") return "upol-raptor";
  return slug;
}

function roundPrice(value: number): number {
  const step = pricing.roundTo > 0 ? pricing.roundTo : 0.01;
  const rounded = Math.round(value / step) * step;
  return Math.round(rounded * 100) / 100;
}

function applyMarkup(base: number, brandSlug: string, category: string): number {
  const brandRate = pricing.brandMarkup[brandSlug];
  const categoryRate = pricing.categoryMarkup[category];
  const rate = brandRate ?? categoryRate ?? pricing.markupPercent;
  return roundPrice(base * (1 + rate / 100));
}

const SIZE_RE = /\b(\d+(?:[.,]\d+)?)\s*(ML|LITRES|LITRE|LITERS|LITER|LTR|LT|L|KG|GALLONS|GALLON|GAL|PCS|MM|CM|INCHES|INCH|IN|G)\b/gi;

const VOLUME_UNITS = new Set(["ML", "L", "KG", "G", "GAL", "PCS"]);

function pullSize(name: string): { label: string | null; base: string } {
  SIZE_RE.lastIndex = 0;
  const matches = [...name.matchAll(SIZE_RE)].filter((match) => {
    const index = match.index ?? 0;
    return index === 0 || !/[\d.]/.test(name[index - 1] ?? "");
  });
  const volumes = matches.filter((match) => VOLUME_UNITS.has(normalizeUnit(match[2])));
  const lengths = matches.filter((match) => !VOLUME_UNITS.has(normalizeUnit(match[2])));
  const chosen = volumes.at(-1) ?? (lengths.length === 1 ? lengths[0] : undefined);
  if (!chosen) return { label: null, base: name.replace(/\s+/g, " ").trim() };
  const last = chosen;
  const unitRaw = last[2].toUpperCase();
  const unit = normalizeUnit(unitRaw);
  const amount = last[1].replace(",", ".");
  const label = `${amount} ${unit}`;
  const base = `${name.slice(0, last.index ?? 0)} ${name.slice((last.index ?? 0) + last[0].length)}`.replace(/\s+/g, " ").trim();
  return { label, base };
}

function normalizeUnit(unitRaw: string): string {
  const unit = unitRaw.toUpperCase();
  return /^(LTR|LT|LITRE|LITRES|LITER|LITERS)$/.test(unit)
    ? "L"
    : /^(IN|INCHES)$/.test(unitRaw)
      ? "INCH"
      : unitRaw === "GALLON" || unitRaw === "GALLONS"
        ? "GAL"
        : unitRaw;
}

function imageReportLines(list: Product[]): string[] {
  const statusFile = resolve(ROOT, "data/image-status.json");
  if (existsSync(statusFile)) {
    const status = readJson<{ saved: number; missing: string[] }>(statusFile);
    return [
      `- Saved locally: ${status.saved}`,
      `- Missing or blocked: ${status.missing.length}`,
      "",
      status.missing.length ? status.missing.map((line) => `- ${line}`).join("\n") : "None.",
    ];
  }
  const saved = list.filter((product) => !product.hidden && product.images.length > 0).length;
  const missing = list.filter((product) => !product.hidden && product.images.length === 0);
  if (!saved) {
    return ["Run `npm run fetch:images` to save photos on this computer. Until then, cards show a placeholder."];
  }
  return [
    `- Saved locally: ${saved}`,
    `- Missing or blocked: ${missing.length}`,
    "",
    missing.length ? missing.map((product) => `- ${product.slug}`).join("\n") : "None.",
  ];
}

function loadSource(): SourceProduct[] {
  const jsonFile = resolve(ROOT, "data/source/ugarit-catalog.json");
  if (existsSync(jsonFile)) {
    return readJson<{ products: SourceProduct[] }>(jsonFile).products;
  }
  return readCsv(resolve(ROOT, "data/source/ugarit-catalog.csv")).map((row) => ({
    offer_id: Number(row.offer_id),
    name: row.name,
    brand: row.brand,
    product_code: row.product_code,
    price_aed: row.price_aed,
    old_price_aed: row.old_price_aed,
    categories: row.categories,
    image_url: row.image_url,
  }));
}

function idSet(file: string): Set<string> {
  return new Set(readCsv(resolve(ROOT, file)).map((row) => row.offer_id || row.id).filter(Boolean));
}

function main() {
  mkdirSync(resolve(ROOT, "data"), { recursive: true });
  const source = loadSource();
  const categoryMap = readJson<Record<string, string>>(resolve(ROOT, "data/category-map.json"));
  const overrides = new Map(
    readCsv(resolve(ROOT, "data/prices.override.csv"))
      .filter((row) => row.offer_id && row.price_aed)
      .map((row) => [row.offer_id, Number(row.price_aed)]),
  );
  const hiddenIds = idSet("data/hidden.csv");
  const featuredIds = idSet("data/featured.csv");
  const stockIds = idSet("data/in-stock.csv");
  const requestIds = existsSync(resolve(ROOT, "data/price-on-request.csv")) ? idSet("data/price-on-request.csv") : new Set<string>();
  const translations = new Map(
    readCsv(resolve(ROOT, "data/translations-ar.csv")).map((row) => [row.id, row.name_ar ?? ""]),
  );

  const previous = existsSync(resolve(ROOT, "content/products.json"))
    ? readJson<Product[]>(resolve(ROOT, "content/products.json"))
    : [];
  const previousByOffer = new Map<string, { slug: string; createdAt: string; price: number; hidden: boolean }>();
  for (const product of previous) {
    for (const variant of product.variants) {
      const offer = variant.sku.replace(/^JAH-/, "");
      if (/^\d+$/.test(offer)) {
        previousByOffer.set(offer, {
          slug: product.slug,
          createdAt: product.createdAt,
          price: variant.price,
          hidden: Boolean(product.hidden),
        });
      }
    }
  }

  const knownBrands = [...new Set(source.map((item) => (item.brand || "").trim()).filter(Boolean))]
    .sort((a, b) => b.length - a.length);

  const unmapped = new Map<string, number>();
  const missingBrand = new Set<number>();
  const skipped: string[] = [];
  const rows: Row[] = [];

  for (const item of source) {
    const basePrice = Number(item.price_aed);
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      skipped.push(`${item.offer_id} ${item.name} (${item.price_aed})`);
      continue;
    }
    const sourceCategory = (item.categories || "").trim();
    let category = categoryMap[sourceCategory];
    if (!category) {
      category = "other";
      unmapped.set(sourceCategory || "(blank)", (unmapped.get(sourceCategory || "(blank)") ?? 0) + 1);
    }
    let brandKey = (item.brand || "").trim();
    if (!brandKey || brandKey.toUpperCase() === "GENERIC") {
      const found = knownBrands.find((brand) => new RegExp(`(^|\\s)${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`, "i").test(item.name));
      brandKey = found || (brandKey ? brandKey : "Other");
      if (!found && !(item.brand || "").trim()) missingBrand.add(item.offer_id);
    }
    const brandName = brandDisplay(brandKey);
    const brandSlug = brandSlugFor(brandName);
    const sized = pullSize(item.name);
    const override = overrides.get(String(item.offer_id));
    const price = override != null && Number.isFinite(override) ? roundPrice(override) : applyMarkup(basePrice, brandSlug, category);
    const oldPrice = Number(item.old_price_aed);
    const compareAt = pricing.showCompareAt && Number.isFinite(oldPrice) && oldPrice > basePrice ? roundPrice(oldPrice) : null;
    rows.push({
      offerId: item.offer_id,
      rawName: item.name,
      title: toTitle(item.name),
      baseTitle: toTitle(sized.base || item.name),
      brandKey,
      brandName,
      brandSlug,
      category,
      sourceCategory,
      sizeLabel: sized.label,
      price,
      compareAt,
      sku: `JAH-${item.offer_id}`,
      code: (item.product_code || "").trim(),
      imageUrl: item.image_url || "",
    });
  }

  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = row.sizeLabel && row.baseTitle.length >= 10
      ? `${row.brandSlug}::${slugify(row.baseTitle)}`
      : `single::${row.offerId}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  const usedSlugs = new Set<string>();
  const products: Product[] = [];
  const imageJobs: { slug: string; offerId: number; url: string }[] = [];
  let groupedCount = 0;
  const seenOffers = new Set<string>();

  for (const list of groups.values()) {
    const sizes = new Set(list.map((row) => row.sizeLabel).filter(Boolean));
    const together = list.length > 1 && sizes.size > 1;
    const chunks = together ? [list] : list.map((row) => [row]);
    if (together) groupedCount += 1;

    for (const chunk of chunks) {
      chunk.sort((a, b) => a.offerId - b.offerId);
      const lead = chunk[0];
      const previousLead = previousByOffer.get(String(lead.offerId));
      const named = together ? lead.baseTitle : lead.title;
      const fold = (value: string) => value.toLowerCase().replace(/['’]/g, "");
      const brandInName = lead.brandSlug !== "other" && fold(named).includes(fold(lead.brandName));
      const slugSource = brandInName || lead.brandSlug === "other" ? named : `${lead.brandName} ${named}`;
      let slug = previousLead?.slug || slugify(slugSource);
      if (usedSlugs.has(slug) && previousLead?.slug !== slug) slug = `${slug}-${lead.offerId}`;
      usedSlugs.add(slug);
      const displayName = together ? lead.baseTitle : lead.title;
      const productId = `jah-${lead.offerId}`;
      const arabic = translations.get(productId) || "";
      const featured = chunk.some((row) => featuredIds.has(String(row.offerId)));
      const previousProduct = previous.find((product) =>
        product.variants.some((variant) => variant.sku === `JAH-${lead.offerId}`),
      );
      const variants: Variant[] = chunk.map((row) => {
        seenOffers.add(String(row.offerId));
        const label = row.sizeLabel || "One";
        if (requestIds.has(String(row.offerId))) {
          return { id: String(row.offerId), label: { en: label, ar: label }, price: 0, priceOnRequest: true, sku: row.sku, inStock: stockIds.has(String(row.offerId)) };
        }
        return {
          id: String(row.offerId),
          label: { en: label, ar: label },
          price: row.price,
          ...(row.compareAt != null ? { compareAtPrice: row.compareAt } : {}),
          sku: row.sku,
          inStock: stockIds.has(String(row.offerId)),
        };
      });
      const hidden = chunk.every((row) => hiddenIds.has(String(row.offerId)));
      products.push({
        id: productId,
        slug,
        name: { en: displayName, ar: arabic },
        brand: lead.brandSlug,
        category: lead.category,
        subcategory: "",
        description: {
          en: displayName,
          ar: arabic,
        },
        images: (previousProduct?.images ?? []).filter((src) => src.startsWith("/")),
        variants,
        featured,
        tags: [lead.brandSlug, lead.category, ...chunk.map((row) => row.sizeLabel || "")].filter(Boolean),
        example: false,
        hidden,
        createdAt: previousLead?.createdAt || today,
      });
      const imageRow = chunk.find((row) => row.imageUrl) ?? lead;
      imageJobs.push({ slug, offerId: imageRow.offerId, url: imageRow.imageUrl });
    }
  }

  const retired: Product[] = [];
  for (const [offer, prev] of previousByOffer) {
    if (seenOffers.has(offer)) continue;
    const old = previous.find((product) => product.variants.some((variant) => variant.sku === `JAH-${offer}`));
    if (!old || retired.some((product) => product.id === old.id)) continue;
    retired.push({ ...old, hidden: true });
    if (!hiddenIds.has(offer)) hiddenIds.add(offer);
  }
  products.push(...retired.filter((product) => !products.some((item) => item.id === product.id)));

  const extraFile = resolve(ROOT, "data/products-extra.json");
  const extras = existsSync(extraFile) ? readJson<Product[]>(extraFile) : [];
  for (const extra of extras) {
    if (products.some((product) => product.id === extra.id || product.slug === extra.slug)) {
      skipped.push(`${extra.id} ${extra.name.en} (id or slug already used)`);
      continue;
    }
    const variants = extra.variants.map((variant) => ({
      ...variant,
      inStock: variant.inStock || stockIds.has(variant.id),
      ...(variant.priceOnRequest || requestIds.has(variant.id) ? { price: 0, priceOnRequest: true } : {}),
    }));
    products.push({
      ...extra,
      variants,
      featured: extra.featured || variants.some((variant) => featuredIds.has(variant.id)),
      hidden: variants.every((variant) => hiddenIds.has(variant.id)),
    });
  }

  const extraBrandNames = new Map(
    readCsv(resolve(ROOT, "data/brands-extra.csv"))
      .filter((row) => (row.name || "").trim())
      .map((row) => {
        const name = row.name.trim();
        return [(row.slug || "").trim() || brandSlugFor(name), name] as const;
      }),
  );

  products.sort((a, b) => a.name.en.localeCompare(b.name.en));

  const brandCounts = new Map<string, { name: string; count: number }>();
  const categoryCounts = new Map<string, number>();
  for (const product of products) {
    if (product.hidden) continue;
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
    const current = brandCounts.get(product.brand) ?? { name: brandDisplay(product.brand), count: 0 };
    const named = products.find((item) => item.brand === product.brand);
    current.count += 1;
    if (named) {
      const fromRow = rows.find((row) => row.brandSlug === product.brand);
      current.name = fromRow?.brandName ?? extraBrandNames.get(product.brand) ?? current.name;
    }
    brandCounts.set(product.brand, current);
  }

  const categories: Category[] = SITE_CATEGORIES.map((category) => ({
    ...category,
    count: categoryCounts.get(category.slug) ?? 0,
  }));
  const brands: Brand[] = [...brandCounts.entries()]
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([slug, info]) => ({
      id: slug,
      slug,
      name: info.name,
      description: { en: "", ar: "" },
      count: info.count,
    }));
  for (const [slug, name] of extraBrandNames) {
    if (brands.some((brand) => brand.slug === slug)) continue;
    brands.push({ id: slug, slug, name, description: { en: "", ar: "" }, count: 0 });
  }
  brands.sort((a, b) => a.name.localeCompare(b.name));

  const index = products.filter((product) => !product.hidden).map((product) => {
    const shownPrices = product.variants.filter((variant) => !variant.priceOnRequest).map((variant) => variant.price);
    return {
      slug: product.slug,
      nameEn: product.name.en,
      nameAr: product.name.ar,
      brand: product.brand,
      brandName: brands.find((brand) => brand.slug === product.brand)?.name ?? product.brand,
      category: product.category,
      price: shownPrices.length ? Math.min(...shownPrices) : null,
      sizes: product.variants.map((variant) => variant.label.en),
      inStock: product.variants.some((variant) => variant.inStock),
      image: product.images[0] ?? "",
      createdAt: product.createdAt,
      search: [
        product.name.en,
        product.name.ar,
        product.brand,
        product.category,
        ...product.tags,
        ...product.variants.map((variant) => `${variant.label.en} ${variant.sku}`),
      ].join(" ").toLowerCase(),
    };
  });

  const newOffers = [...seenOffers].filter((offer) => !previousByOffer.has(offer));
  const removedOffers = [...previousByOffer.keys()].filter((offer) => !seenOffers.has(offer));
  const priceChanges = rows.filter((row) => {
    const prev = previousByOffer.get(String(row.offerId));
    return prev && !requestIds.has(String(row.offerId)) && Math.abs(prev.price - row.price) >= 0.01;
  });

  writeFileSync(resolve(ROOT, "content/products.json"), `${JSON.stringify(products, null, 2)}\n`);
  writeFileSync(resolve(ROOT, "content/categories.json"), `${JSON.stringify(categories, null, 2)}\n`);
  writeFileSync(resolve(ROOT, "content/brands.json"), `${JSON.stringify(brands, null, 2)}\n`);
  writeFileSync(resolve(ROOT, "content/catalog-index.json"), `${JSON.stringify(index)}\n`);
  writeFileSync(resolve(ROOT, "data/image-sources.json"), `${JSON.stringify(imageJobs, null, 2)}\n`);

  const translationRows = ["id,name_en,name_ar"];
  for (const product of products.filter((item) => !item.hidden)) {
    translationRows.push([product.id, product.name.en, translations.get(product.id) || product.name.ar || ""].map(csvEscape).join(","));
  }
  writeFileSync(resolve(ROOT, "data/translations-ar.csv"), `${translationRows.join("\n")}\n`);

  if (removedOffers.length) {
    const hiddenLines = ["offer_id", ...hiddenIds];
    writeFileSync(resolve(ROOT, "data/hidden.csv"), `${hiddenLines.join("\n")}\n`);
  }

  let mapChanged = false;
  for (const name of unmapped.keys()) {
    if (name === "(blank)") continue;
    if (categoryMap[name] == null) {
      categoryMap[name] = "other";
      mapChanged = true;
    }
  }
  if (mapChanged) {
    writeFileSync(resolve(ROOT, "data/category-map.json"), `${JSON.stringify(categoryMap, null, 2)}\n`);
  }

  const visible = products.filter((product) => !product.hidden).length;
  const report = [
    "# Catalog import",
    "",
    `Date: ${today}`,
    "",
    `- Source rows: ${source.length}`,
    `- Products written: ${products.length}`,
    `- Visible in the shop: ${visible}`,
    `- Hidden: ${products.length - visible}`,
    `- Variant groups: ${groupedCount}`,
    `- Skipped (price was zero or below): ${skipped.length}`,
    `- New items: ${newOffers.length}`,
    `- Removed from the latest list and hidden: ${removedOffers.length}`,
    `- Prices changed since the last import: ${priceChanges.length}`,
    `- Rows with no brand on the source list: ${missingBrand.size}`,
    "",
    "## Unmapped categories",
    "",
    unmapped.size ? [...unmapped.entries()].map(([name, count]) => `- ${name}: ${count}`).join("\n") : "None. Every source category is in data/category-map.json.",
    "",
    "## Category counts",
    "",
    ...categories.map((category) => `- ${category.name.en}: ${category.count ?? 0}`),
    "",
    "## Prices changed",
    "",
    priceChanges.length
      ? priceChanges.slice(0, 40).map((row) => `- ${row.sku} ${row.title}: ${previousByOffer.get(String(row.offerId))?.price} -> ${row.price}`).join("\n")
      : "None.",
    "",
    "## Skipped",
    "",
    skipped.length ? skipped.map((line) => `- ${line}`).join("\n") : "None.",
    "",
    "## Images",
    "",
    ...imageReportLines(products),
    "",
  ];
  writeFileSync(resolve(ROOT, "data/import-report.md"), report.join("\n"));

  console.log(`Imported ${visible} visible products (${products.length} including hidden).`);
  console.log(`Grouped ${groupedCount} size families. Skipped ${skipped.length}. Unmapped categories: ${unmapped.size}.`);
}

main();
