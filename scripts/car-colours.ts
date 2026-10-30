import sharp from "sharp";
import path from "node:path";
import { carColours, carImage, carRoofHex, photoCarColour } from "../config/car-colours";

/**
 * Paints the light grey car cut-out in every colour of `config/car-colours.ts`, with a gloss black roof.
 * Each body pixel keeps its shading: shadows deepen the new colour a little more than the photo did and
 * bright panels (bonnet, bumper, wheel-arch flares) become a brighter shade of the same colour. On top sits a
 * clear coat: a faint reflection of the photo everywhere and white only on its sharpest highlights.
 * Inputs come from `scripts/chroma-key.ts` (`--paint-mask`) and `scripts/suv-roof.svg`.
 * Usage: npx tsx scripts/car-colours.ts
 */
const CUTOUT = "scripts/suv-cutout.webp";
const PAINT_MASK = "scripts/suv-paint-mask.webp";
const ROOF_SHAPE = "scripts/suv-roof.svg";
/** Above 1, shadows get darker than in the photo: more contrast, a deeper and glossier paint. */
const SHADOW_DEPTH = 1.25;
/**
 * Share of the photo's light the clear coat reflects on a black car; this is what makes black look glossy.
 * Bright colours get far less, since white mixed into a saturated colour reads as a milky veil.
 */
const CLEAR_COAT = 0.6;
/** Photo brightness (0–255) where white highlights start and reach full strength, and that strength. */
const SPECULAR_FROM = 225;
const SPECULAR_TO = 252;
const SPECULAR_MAX = 0.75;
/**
 * The render's camera is higher than the hero stage's, so its rear tyre touched the floor right at the stage
 * horizon and looked like it floated. The side of the car is sheared down behind the front corner: zero at the
 * corner, `SIDE_DROP` px at the rear tyre's contact point (x `REAR_CONTACT_X`). The front face does not move.
 * The corner runs from the A-pillar (x `CORNER_TOP`, above y `CORNER_TOP_Y`) to the near front tyre's contact
 * (x `CORNER_BOTTOM`, below y `CORNER_BOTTOM_Y`), so the windscreen and the front tyre's floor point stay put.
 */
const SIDE_DROP = 50;
const REAR_CONTACT_X = 905;
const CORNER_TOP = 712;
const CORNER_TOP_Y = 190;
const CORNER_BOTTOM = 650;
const CORNER_BOTTOM_Y = 330;
/** Rows added under the cut-out, so the near front tyre's sheared back half is not cut off. */
const BOTTOM_PAD = 12;

function toLinear(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function toSrgb(value: number): number {
  const v = Math.min(1, Math.max(0, value));
  return Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055));
}

function hexToLinear(hex: string): number[] {
  return [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16)));
}

function sideShift(x: number, y: number): number {
  const t = Math.min(1, Math.max(0, (y - CORNER_TOP_Y) / (CORNER_BOTTOM_Y - CORNER_TOP_Y)));
  const corner = CORNER_TOP + (CORNER_BOTTOM - CORNER_TOP) * t;
  return (SIDE_DROP * Math.max(0, x - corner)) / (REAR_CONTACT_X - CORNER_BOTTOM);
}

/** Moves every column down by `sideShift`, sampling between source rows with premultiplied alpha. */
function lowerSide(image: Buffer, width: number, height: number): Buffer {
  const out = Buffer.alloc(width * (height + BOTTOM_PAD) * 4);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height + BOTTOM_PAD; y++) {
      let source = y;
      for (let n = 0; n < 4; n++) source = y - sideShift(x, source);
      const top = Math.floor(source);
      const f = source - top;
      const rows = [top, top + 1].filter((row) => row >= 0 && row < height);
      if (rows.length === 0) continue;
      const weights = rows.length === 2 ? [1 - f, f] : [rows[0] === top ? 1 - f : f];
      let alpha = 0;
      const colour = [0, 0, 0];
      rows.forEach((row, n) => {
        const i = (row * width + x) * 4;
        const a = (image[i + 3] / 255) * weights[n];
        alpha += a;
        for (let c = 0; c < 3; c++) colour[c] += image[i + c] * a;
      });
      const o = (y * width + x) * 4;
      if (alpha > 0) for (let c = 0; c < 3; c++) out[o + c] = Math.round(colour[c] / alpha);
      out[o + 3] = Math.round(alpha * 255);
    }
  }
  return out;
}

async function main() {
  const { data: car, info } = await sharp(CUTOUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const pixels = width * height;
  const mask = await sharp(PAINT_MASK).extractChannel(3).raw().toBuffer();
  const roof = await sharp(ROOF_SHAPE)
    .resize(width, height, { fit: "fill" })
    .ensureAlpha()
    .blur(1.5)
    .extractChannel("alpha")
    .raw()
    .toBuffer();

  const luminance = new Float32Array(pixels);
  const lit: number[] = [];
  for (let p = 0; p < pixels; p++) {
    const i = p * 4;
    luminance[p] = 0.2126 * toLinear(car[i]) + 0.7152 * toLinear(car[i + 1]) + 0.0722 * toLinear(car[i + 2]);
    if (mask[p] > 240 && roof[p] === 0) lit.push(luminance[p]);
  }
  lit.sort((a, b) => a - b);
  /** The body's typical lit brightness: the paint colour lands exactly here. */
  const base = lit[Math.floor(lit.length * 0.6)];

  function paint(out: Buffer, p: number, target: number[], weight: number) {
    const shade = luminance[p] / base;
    const brightness = (toSrgb(luminance[p]) - SPECULAR_FROM) / (SPECULAR_TO - SPECULAR_FROM);
    const specular = SPECULAR_MAX * Math.min(1, Math.max(0, brightness)) ** 2;
    const coatStrength = CLEAR_COAT * (1 - Math.max(...target)) ** 4;
    /** Steep, so lit panels reflect and shadows stay deep: contrast is what reads as gloss. */
    const coat = Math.min(1, specular + coatStrength * luminance[p] ** 4);
    for (let c = 0; c < 3; c++) {
      const body = shade <= 1 ? target[c] * shade ** SHADOW_DEPTH : Math.min(1, target[c] * shade);
      const painted = body + (1 - body) * coat;
      const i = p * 4 + c;
      out[i] = Math.round(out[i] * (1 - weight) + toSrgb(painted) * weight);
    }
  }

  const roofTarget = hexToLinear(carRoofHex);
  for (const colour of carColours) {
    const target = colour.id === photoCarColour ? null : hexToLinear(colour.hex);
    const out = Buffer.from(car);
    for (let p = 0; p < pixels; p++) {
      if (mask[p] === 0) continue;
      const k = mask[p] / 255;
      const r = roof[p] / 255;
      if (target) paint(out, p, target, k * (1 - r));
      if (r > 0) paint(out, p, roofTarget, k * r);
    }
    const file = path.join("public", carImage(colour.id));
    const result = await sharp(lowerSide(out, width, height), {
      raw: { width, height: height + BOTTOM_PAD, channels: 4 },
    })
      .sharpen({ sigma: 0.6 })
      .webp({ quality: 88, alphaQuality: 100 })
      .toFile(file);
    console.log(`${file}: ${result.width}x${result.height}, ${result.size} bytes`);
  }
}

main();
