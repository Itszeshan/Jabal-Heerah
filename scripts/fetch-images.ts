import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, extname } from "node:path";
import sharp from "sharp";
import type { Product } from "../src/types/content";

type Job = { slug: string; offerId: number; url: string };
type IndexItem = { slug: string; image: string };

const ROOT = process.cwd();
const OUT = resolve(ROOT, "public/products");
const CUSTOM = resolve(OUT, "custom");

function readCsvIds(file: string): Set<string> {
  if (!existsSync(file)) return new Set();
  return new Set(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.split(",")[0]?.trim())
      .filter(Boolean),
  );
}

function customFile(slug: string): string | null {
  if (!existsSync(CUSTOM)) return null;
  const found = readdirSync(CUSTOM).find((file) => file.startsWith(`${slug}.`));
  return found ? `/products/custom/${found}` : null;
}

async function download(url: string, dest: string): Promise<void> {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(String(response.status));
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 32 || bytes.length > 8_000_000) throw new Error("size");
  await sharp(bytes).rotate().resize(800, 800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toFile(dest);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(CUSTOM, { recursive: true });
  const jobs = JSON.parse(readFileSync(resolve(ROOT, "data/image-sources.json"), "utf8")) as Job[];
  const products = JSON.parse(readFileSync(resolve(ROOT, "content/products.json"), "utf8")) as Product[];
  const index = JSON.parse(readFileSync(resolve(ROOT, "content/catalog-index.json"), "utf8")) as IndexItem[];
  const blocked = readCsvIds(resolve(ROOT, "data/image-blocklist.csv"));
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const missing: string[] = [];
  let saved = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor];
      cursor += 1;
      const product = bySlug.get(job.slug);
      if (!product) continue;
      const custom = customFile(job.slug);
      if (custom) {
        product.images = [custom];
        saved += 1;
        continue;
      }
      if (blocked.has(String(job.offerId))) {
        product.images = [];
        missing.push(`${job.slug} (blocked)`);
        continue;
      }
      const local = resolve(OUT, `${job.slug}.webp`);
      if (!existsSync(local)) {
        if (!job.url) {
          product.images = [];
          missing.push(`${job.slug} (no photo)`);
          continue;
        }
        try {
          await download(job.url, local);
        } catch {
          product.images = [];
          missing.push(`${job.slug} (download failed)`);
          continue;
        }
      }
      if (existsSync(local) && extname(local) === ".webp") {
        product.images = [`/products/${job.slug}.webp`];
        saved += 1;
      }
      if ((saved + missing.length) % 50 === 0) {
        console.log(`${saved} saved, ${missing.length} missing`);
      }
    }
  }

  await Promise.all(Array.from({ length: 8 }, () => worker()));

  for (const item of index) {
    const product = bySlug.get(item.slug);
    item.image = product?.images.find((src) => src.startsWith("/")) ?? "";
  }

  writeFileSync(resolve(ROOT, "content/products.json"), `${JSON.stringify(products, null, 2)}\n`);
  writeFileSync(resolve(ROOT, "content/catalog-index.json"), `${JSON.stringify(index)}\n`);
  writeFileSync(resolve(ROOT, "data/image-status.json"), `${JSON.stringify({ saved, missing }, null, 2)}\n`);

  const reportPath = resolve(ROOT, "data/import-report.md");
  const report = existsSync(reportPath) ? readFileSync(reportPath, "utf8") : "";
  const marker = "## Images";
  const head = report.includes(marker) ? report.slice(0, report.indexOf(marker)) : report;
  const lines = [
    "## Images",
    "",
    `- Saved locally: ${saved}`,
    `- Missing or blocked: ${missing.length}`,
    "",
    missing.length ? missing.map((line) => `- ${line}`).join("\n") : "None.",
    "",
  ];
  writeFileSync(reportPath, `${head}${lines.join("\n")}`);
  console.log(`Images saved: ${saved}. Missing: ${missing.length}.`);
}

main();
