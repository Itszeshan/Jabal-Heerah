import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Product } from "../src/types/content";

type Row = Record<string, string>;

function parseCsv(text: string): Row[] {
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((line) => line.some((value) => value.trim()));
  if (!header) return [];
  const keys = header.map((key) => key.trim());
  return body.map((values) => {
    const record: Row = {};
    keys.forEach((key, index) => {
      record[key] = (values[index] ?? "").trim();
    });
    return record;
  });
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `item-${Date.now()}`;
}

function truthy(value: string): boolean {
  return ["1", "true", "yes", "y", "in stock"].includes(value.toLowerCase());
}

const file = process.argv[2];
const replaceExamples = process.argv.includes("--replace-examples");

if (!file) {
  console.error("Usage: npm run import:csv -- ./products.csv [--replace-examples]");
  process.exit(1);
}

const required = ["name_en", "name_ar", "brand", "category", "price", "size", "sku", "image_url", "in_stock"];
const rows = parseCsv(readFileSync(resolve(file), "utf8"));
if (!rows.length) {
  console.error("No rows found.");
  process.exit(1);
}

const missing = required.filter((key) => !(key in rows[0]));
if (missing.length) {
  console.error(`Missing columns: ${missing.join(", ")}`);
  process.exit(1);
}

const productsPath = resolve("content/products.json");
let products = JSON.parse(readFileSync(productsPath, "utf8")) as Product[];
if (replaceExamples) products = products.filter((product) => !product.example);

let created = 0;
let updated = 0;

for (const row of rows) {
  const price = Number(row.price);
  if (!row.name_en || !row.sku || !Number.isFinite(price)) {
    console.warn(`Skipped row with sku "${row.sku || "(blank)"}": name and a numeric price are required.`);
    continue;
  }

  const variant = {
    id: slugify(row.size || row.sku),
    label: { en: row.size || row.sku, ar: row.size || row.sku },
    price,
    sku: row.sku,
    inStock: truthy(row.in_stock || "true"),
  };

  const existing = products.find((product) => product.variants.some((item) => item.sku === row.sku));
  if (existing) {
    existing.variants = existing.variants.map((item) => (item.sku === row.sku ? { ...item, ...variant } : item));
    existing.name = { en: row.name_en, ar: row.name_ar || row.name_en };
    existing.brand = row.brand;
    existing.category = row.category;
    existing.example = false;
    if (row.image_url && !existing.images.includes(row.image_url)) existing.images.push(row.image_url);
    updated += 1;
    continue;
  }

  const baseSlug = slugify(row.name_en);
  const slug = products.some((product) => product.slug === baseSlug) ? `${baseSlug}-${slugify(row.sku)}` : baseSlug;
  products.push({
    id: slug,
    slug,
    name: { en: row.name_en, ar: row.name_ar || row.name_en },
    brand: row.brand,
    category: row.category,
    subcategory: "",
    description: {
      en: row.name_en,
      ar: row.name_ar || row.name_en,
    },
    images: row.image_url ? [row.image_url] : [],
    variants: [variant],
    featured: false,
    tags: [],
    example: false,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  created += 1;
}

writeFileSync(productsPath, `${JSON.stringify(products, null, 2)}\n`);
console.log(`Imported ${created} new products and updated ${updated} existing SKUs.`);
if (replaceExamples) console.log("Removed previous example products.");
