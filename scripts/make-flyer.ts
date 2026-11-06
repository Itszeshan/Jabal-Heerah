import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";
import { site } from "../config/site";
import { BODY, GOLD, GREEN, HEAD, ICON, NAVY, RED, backgroundSvg, esc, fadeMask, sharedDefs, slantTag, starburst } from "./marketing-kit";

/**
 * Builds the "accident car repair" flyer (A4 portrait at 150 dpi) from a before/after photo:
 * the left half of the photo is the damaged car, the right half the repaired one, split in the middle.
 * Text, phone and address come from `config/site.ts` so they are always exact (AI images misspell numbers).
 * Usage: npx tsx scripts/make-flyer.ts <before-after.jpg> [out.png]
 */
const [photoPath, outPath = "marketing/accident-repair-flyer.png"] = process.argv.slice(2);
if (!photoPath) {
  console.error("Usage: npx tsx scripts/make-flyer.ts <before-after.jpg> [out.png]");
  process.exit(1);
}

const W = 1240;
const H = 1754;
const LOGO = "public/jabal-logo.png";
const LOGO_WIDTH = 440;

/** Full-width photo band; top and bottom fade into the background. */
const PHOTO = { top: 690, height: 760, sourceTop: 70 };
const SPLIT_X = W / 2;

const FEATURES = [
  ["Denting &", "Painting"],
  ["Exact Colour", "Matching"],
  ["Bumper &", "Body Repair"],
  ["Polishing &", "Finishing"],
];

const photoBottom = PHOTO.top + PHOTO.height;
const seal = { cx: 1070, cy: photoBottom - 150, r: 130 };
const panelTop = 1590;

const overlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>${sharedDefs}
  </defs>

  <text x="${W / 2}" y="404" text-anchor="middle" font-family="${HEAD}" font-size="150" fill="url(#gold)" stroke="#6b4a08" stroke-width="2" letter-spacing="4" filter="url(#shadow)">ACCIDENT</text>
  <text x="${W / 2}" y="506" text-anchor="middle" font-family="${HEAD}" font-size="104" fill="#ffffff" letter-spacing="2" filter="url(#shadow)">CAR REPAIR</text>

  <g filter="url(#shadow)">
    <polygon points="${W / 2 - 370},532 ${W / 2 + 395},532 ${W / 2 + 370},602 ${W / 2 - 395},602" fill="url(#redBanner)"/>
  </g>
  <text x="${W / 2}" y="584" text-anchor="middle" font-family="${HEAD}" font-size="50" fill="#ffffff" letter-spacing="6">SERVICE AVAILABLE</text>
  <text x="${W / 2}" y="660" text-anchor="middle" font-family="${BODY}" font-size="38" font-weight="700" fill="${GOLD}" direction="rtl">خدمة إصلاح السيارات المتضررة من الحوادث</text>

  ${slantTag(60, PHOTO.top + 70, 250, 74, RED, "BEFORE", 46)}
  ${slantTag(W - 310, PHOTO.top + 70, 250, 74, GREEN, "AFTER", 46)}

  <g filter="url(#shadow)">
    <circle cx="${SPLIT_X}" cy="${PHOTO.top + 107}" r="44" fill="${GOLD}"/>
    <circle cx="${SPLIT_X}" cy="${PHOTO.top + 107}" r="36" fill="none" stroke="${NAVY}" stroke-width="3"/>
  </g>
  <path d="M${SPLIT_X - 18},${PHOTO.top + 91} l14,16 l-14,16 M${SPLIT_X + 2},${PHOTO.top + 91} l14,16 l-14,16" fill="none" stroke="${NAVY}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>

  <g transform="rotate(-12 ${seal.cx} ${seal.cy})" filter="url(#shadow)">
    <polygon points="${starburst(seal.cx, seal.cy, seal.r, seal.r - 18, 24)}" fill="url(#gold)"/>
    <circle cx="${seal.cx}" cy="${seal.cy}" r="${seal.r - 32}" fill="${RED}"/>
    <circle cx="${seal.cx}" cy="${seal.cy}" r="${seal.r - 42}" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="7 6"/>
    <text x="${seal.cx}" y="${seal.cy - 8}" text-anchor="middle" font-family="${HEAD}" font-size="46" fill="#ffffff">GOOD</text>
    <text x="${seal.cx}" y="${seal.cy + 42}" text-anchor="middle" font-family="${HEAD}" font-size="46" fill="${GOLD}">PRICE</text>
  </g>

  ${FEATURES.map(([a, b], i) => {
    const x = 40 + i * 295;
    const y = 1480;
    return `
  <circle cx="${x + 30}" cy="${y + 30}" r="26" fill="${GOLD}"/>
  <path d="M${x + 17},${y + 31} l9,9 l17,-19" fill="none" stroke="${NAVY}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${x + 68}" y="${y + 24}" font-family="${BODY}" font-size="27" font-weight="700" fill="#ffffff">${esc(a)}</text>
  <text x="${x + 68}" y="${y + 56}" font-family="${BODY}" font-size="27" font-weight="700" fill="#ffffff">${esc(b)}</text>`;
  }).join("")}

  <polygon points="0,${panelTop - 8} ${W},${panelTop - 38} ${W},${panelTop - 26} 0,${panelTop + 4}" fill="${RED}"/>
  <polygon points="0,${panelTop + 4} ${W},${panelTop - 26} ${W},1700 0,1700" fill="url(#goldPanel)"/>

  <circle cx="130" cy="1646" r="44" fill="${NAVY}"/>
  <g transform="translate(106 1622) scale(2)"><path d="${ICON.phone}" fill="${GOLD}"/></g>
  <circle cx="232" cy="1646" r="44" fill="#25d366"/>
  <g transform="translate(208 1622) scale(2)"><path d="${ICON.whatsapp}" fill="#ffffff"/></g>
  <text x="302" y="1626" font-family="${BODY}" font-size="27" font-weight="800" fill="${NAVY}" letter-spacing="3">CALL / WHATSAPP NOW</text>
  <text x="298" y="1688" font-family="${HEAD}" font-size="66" fill="${NAVY}">${esc(site.phoneDisplay)}</text>

  <g transform="translate(118 1709) scale(1.25)"><path d="${ICON.pin}" fill="${GOLD}"/></g>
  <text x="152" y="1736" font-family="${BODY}" font-size="24" fill="#ffffff">${esc(site.address.en)}</text>
  <g transform="translate(${W - 230} 1712)">
    <circle cx="12" cy="12" r="11" fill="none" stroke="${GOLD}" stroke-width="2.2"/>
    <ellipse cx="12" cy="12" rx="5" ry="11" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <line x1="1" y1="12" x2="23" y2="12" stroke="${GOLD}" stroke-width="2"/>
  </g>
  <text x="${W - 198}" y="1736" font-family="${BODY}" font-size="24" font-weight="700" fill="${GOLD}">${esc(site.domain)}</text>
</svg>`;

async function main() {
  const meta = await sharp(photoPath).metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  const cropH = Math.min(Math.round((srcW * PHOTO.height) / W), srcH - PHOTO.sourceTop);

  const photo = await sharp(photoPath)
    .extract({ left: 0, top: PHOTO.sourceTop, width: srcW, height: cropH })
    .resize(W, PHOTO.height, { fit: "cover" })
    .modulate({ saturation: 1.08 })
    .composite([{ input: fadeMask(W, PHOTO.height, 0.12, 0.15), blend: "dest-in" }])
    .png()
    .toBuffer();

  const logo = await sharp(LOGO).resize({ width: LOGO_WIDTH }).png().toBuffer();

  mkdirSync(dirname(outPath), { recursive: true });
  const info = await sharp(Buffer.from(backgroundSvg(W, H)))
    .composite([
      { input: logo, left: Math.round((W - LOGO_WIDTH) / 2), top: 26 },
      { input: photo, left: 0, top: PHOTO.top },
      { input: Buffer.from(overlay), left: 0, top: 0 },
    ])
    .png()
    .toFile(outPath);
  console.log(outPath, `${info.width}x${info.height}`);
}

main();
