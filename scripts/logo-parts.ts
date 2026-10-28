import sharp from "sharp";

/**
 * Cuts `public/jabal-logo.png` (989x525 artwork) into:
 * - the lettering for the home hero title (name, paint bar, tagline), without the spray gun and splash;
 * - a header mark: the logo with the name across the top erased (spray gun, splash, paint bar and tagline).
 * Boxes are in logo pixels; if the logo artwork changes, re-measure them.
 * Usage: npx tsx scripts/logo-parts.ts
 */
const SOURCE = "public/jabal-logo.png";

const PARTS = [
  { out: "public/home/logo-name.webp", left: 0, top: 0, width: 989, height: 116 },
  { out: "public/home/logo-bar.webp", left: 164, top: 348, width: 804, height: 50 },
  { out: "public/home/logo-tagline.webp", left: 160, top: 402, width: 808, height: 108 },
];

const MARK_OUT = "public/jabal-logo-mark.webp";
/** The name across the top; the hero shows it large instead. */
const MARK_ERASE = [{ left: 0, top: 0, right: 989, bottom: 130 }];

async function cutParts() {
  for (const part of PARTS) {
    const { out, ...box } = part;
    const cropped = await sharp(SOURCE).extract(box).png().toBuffer();
    const info = await sharp(cropped).trim({ threshold: 1 }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(out);
    console.log(out, `${info.width}x${info.height}`);
  }
}

async function cutMark() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (const box of MARK_ERASE) {
    for (let y = box.top; y < Math.min(box.bottom, info.height); y++) {
      for (let x = box.left; x < Math.min(box.right, info.width); x++) {
        data[(y * info.width + x) * 4 + 3] = 0;
      }
    }
  }
  const erased = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  const out = await sharp(erased).trim({ threshold: 1 }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(MARK_OUT);
  console.log(MARK_OUT, `${out.width}x${out.height}`);
}

async function main() {
  await cutParts();
  await cutMark();
}

main();
