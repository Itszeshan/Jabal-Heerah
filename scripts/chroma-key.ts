import sharp from "sharp";

/**
 * Cuts a photo shot on a flat green background into a transparent webp.
 * --paint-mask writes a mask that is white where the photo is body paint and transparent on dark glass,
 * tyres and grille and on bright lights, so colour can be laid on the body only.
 * --exclude takes an SVG (same size as the cut-out) whose shapes the paint mask must skip, such as windows and wheels.
 * --roof takes an SVG whose shapes become --roof-mask (cut to the car outline), for a fixed roof colour.
 * --lift takes an SVG marking a shadow on the body; mid-tone pixels there are brightened towards the lit paint.
 * Usage: npx tsx scripts/chroma-key.ts <input image> <output .webp> [--paint-mask out.webp] [--exclude in.svg]
 *        [--roof in.svg --roof-mask out.webp] [--lift in.svg]
 */
/** Brightness of the lit body paint in the source photo, and how far shadowed paint is pulled towards it (0.8 leaves 20% of the shadow). */
const LIFT_TARGET = 188;
const LIFT_AMOUNT = 0.8;

function ramp(value: number, from: number, to: number): number {
  return Math.min(1, Math.max(0, (value - from) / (to - from)));
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

async function svgAlpha(svg: string, width: number, height: number, feather = 1.5): Promise<Buffer> {
  return sharp(svg)
    .resize(width, height, { fit: "fill" })
    .ensureAlpha()
    .blur(feather)
    .extractChannel("alpha")
    .raw()
    .toBuffer();
}

async function writeMask(alpha: Buffer, width: number, height: number, output: string) {
  const mask = Buffer.alloc(width * height * 4, 255);
  for (let i = 0; i < alpha.length; i++) mask[i * 4 + 3] = alpha[i];
  const result = await sharp(mask, { raw: { width, height, channels: 4 } })
    .blur(0.8)
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(output);
  console.log(`${output}: ${result.width}x${result.height}, ${result.size} bytes`);
}

async function main() {
  const args = process.argv.slice(2);
  const [input, output] = args;
  if (!input || !output || input.startsWith("--") || output.startsWith("--")) {
    console.error(
      "Usage: npx tsx scripts/chroma-key.ts <input image> <output .webp> [--paint-mask out.webp] [--exclude in.svg] [--roof in.svg --roof-mask out.webp] [--lift in.svg]",
    );
    process.exit(1);
  }
  const paintMaskOutput = option(args, "--paint-mask");
  const excludeSvg = option(args, "--exclude");
  const roofSvg = option(args, "--roof");
  const roofMaskOutput = option(args, "--roof-mask");
  const liftSvg = option(args, "--lift");

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const spill = g - Math.max(r, b);
    let alpha = 255;
    if (spill > 70) alpha = 0;
    else if (spill > 25) alpha = Math.round(((70 - spill) / 45) * 255);
    if (g > Math.max(r, b)) data[i + 1] = Math.max(r, b);
    data[i + 3] = alpha;
  }

  const keyed = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(keyed).trim({ threshold: 1 }).toBuffer();
  const car = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = car.info;
  const pixels = width * height;

  if (liftSvg) {
    const region = await svgAlpha(liftSvg, width, height, 6);
    for (let p = 0; p < pixels; p++) {
      if (region[p] === 0) continue;
      const i = p * 4;
      const lum = 0.299 * car.data[i] + 0.587 * car.data[i + 1] + 0.114 * car.data[i + 2];
      if (lum >= LIFT_TARGET) continue;
      const weight = (region[p] / 255) * ramp(lum, 45, 65) * LIFT_AMOUNT;
      const gain = (lum + weight * (LIFT_TARGET - lum)) / lum;
      for (let c = 0; c < 3; c++) car.data[i + c] = Math.min(255, Math.round(car.data[i + c] * gain));
    }
  }

  const result = await sharp(car.data, { raw: { width, height, channels: 4 } })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(output);
  console.log(`${output}: ${result.width}x${result.height}, ${result.size} bytes`);

  if (paintMaskOutput) {
    const excluded = excludeSvg ? await svgAlpha(excludeSvg, width, height) : null;
    const paint = Buffer.alloc(pixels);
    for (let p = 0; p < pixels; p++) {
      const i = p * 4;
      const lum = 0.299 * car.data[i] + 0.587 * car.data[i + 1] + 0.114 * car.data[i + 2];
      const keep = excluded ? 1 - excluded[p] / 255 : 1;
      paint[p] = Math.round(ramp(lum, 35, 70) * (1 - ramp(lum, 235, 252)) * keep * car.data[i + 3]);
    }
    await writeMask(paint, width, height, paintMaskOutput);
  }

  if (roofSvg && roofMaskOutput) {
    const shape = await svgAlpha(roofSvg, width, height);
    const roof = Buffer.alloc(pixels);
    for (let p = 0; p < pixels; p++) roof[p] = Math.round((shape[p] / 255) * car.data[p * 4 + 3]);
    await writeMask(roof, width, height, roofMaskOutput);
  }
}

main();
