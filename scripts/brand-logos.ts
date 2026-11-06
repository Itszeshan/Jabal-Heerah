import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import sharp from "sharp";

/**
 * Turns the downloaded brand logos (svg, png, jpg, webp named `<brand slug>.<ext>`) into
 * `public/brands/<slug>.webp`: blank margins trimmed, at most 800x400, transparency kept.
 * Which brands show a logo, and on which background, is set in `data/brand-logos.csv`;
 * run `npm run import:catalog` afterwards so `content/brands.json` picks them up.
 * Usage: npx tsx scripts/brand-logos.ts <folder with downloaded logos>
 */
const OUT_DIR = resolve("public/brands");
const MAX_WIDTH = 800;
const MAX_HEIGHT = 400;
const SVG_DENSITY = 600;

async function convert(file: string, slug: string) {
  const input = extname(file).toLowerCase() === ".svg" ? sharp(file, { density: SVG_DENSITY }) : sharp(file);
  const trimmed = await input.ensureAlpha().trim({ threshold: 12 }).png().toBuffer();
  const info = await sharp(trimmed)
    .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(join(OUT_DIR, `${slug}.webp`));
  console.log(`${slug}.webp ${info.width}x${info.height}`);
}

async function main() {
  const source = process.argv[2];
  if (!source || !existsSync(source)) {
    console.error("Usage: npx tsx scripts/brand-logos.ts <folder with downloaded logos>");
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const files = readdirSync(source).filter((name) => /\.(svg|png|jpe?g|webp)$/i.test(name));
  for (const name of files) {
    await convert(join(source, name), basename(name, extname(name)));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
