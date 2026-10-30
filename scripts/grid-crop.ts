import sharp from "sharp";

/**
 * Crops an image, enlarges it and draws a labelled pixel grid in source coordinates,
 * for measuring shapes such as `scripts/suv-paint-exclude.svg`.
 * Usage: npx tsx scripts/grid-crop.ts <image> <out.png> <left> <top> <width> <height> [scale] [step]
 */
async function main() {
  const [input, output, ...rest] = process.argv.slice(2);
  const [left, top, width, height, scale = 4, step = 10] = rest.map(Number);
  if (!input || !output || [left, top, width, height].some((value) => Number.isNaN(value))) {
    console.error("Usage: npx tsx scripts/grid-crop.ts <image> <out.png> <left> <top> <width> <height> [scale] [step]");
    process.exit(1);
  }

  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const lines: string[] = [];
  for (let x = Math.ceil(left / step) * step; x <= left + width; x += step) {
    const px = (x - left) * scale;
    const major = x % (step * 5) === 0;
    lines.push(`<line x1="${px}" y1="0" x2="${px}" y2="${h}" stroke="${major ? "#0ff" : "#0ff6"}" stroke-width="1"/>`);
    if (major) lines.push(`<text x="${px + 2}" y="12" font-size="12" fill="#ff0">${x}</text>`);
  }
  for (let y = Math.ceil(top / step) * step; y <= top + height; y += step) {
    const py = (y - top) * scale;
    const major = y % (step * 5) === 0;
    lines.push(`<line x1="0" y1="${py}" x2="${w}" y2="${py}" stroke="${major ? "#0ff" : "#0ff6"}" stroke-width="1"/>`);
    if (major) lines.push(`<text x="2" y="${py - 2}" font-size="12" fill="#ff0">${y}</text>`);
  }
  const grid = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${lines.join("")}</svg>`);

  await sharp(input)
    .flatten({ background: "#222" })
    .extract({ left, top, width, height })
    .resize(w, h, { kernel: "nearest" })
    .composite([{ input: grid }])
    .png()
    .toFile(output);
  console.log(output);
}

main();
