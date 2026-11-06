import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";
import { site } from "../config/site";

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

const GOLD = "#f5c542";
const NAVY = "#0b1530";
const RED = "#d62828";
const GREEN = "#1f9d55";
const HEAD = "Segoe UI Black, Arial Black, Arial, sans-serif";
const BODY = "Segoe UI, Arial, sans-serif";

/** Full-width photo band; top and bottom fade into the background. */
const PHOTO = { top: 690, height: 760, sourceTop: 70 };
const SPLIT_X = W / 2;

const FEATURES = [
  ["Denting &", "Painting"],
  ["Exact Colour", "Matching"],
  ["Bumper &", "Body Repair"],
  ["Polishing &", "Finishing"],
];

const ICON = {
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
};

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function starburst(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    coords.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return coords.join(" ");
}

/** A slanted label (parallelogram) with centred text. */
function tag(x: number, y: number, w: number, h: number, fill: string, label: string, size: number): string {
  const s = h * 0.35;
  return `
  <g filter="url(#shadow)">
    <polygon points="${x + s},${y} ${x + w + s},${y} ${x + w - s},${y + h} ${x - s},${y + h}" fill="${fill}"/>
    <polygon points="${x + s},${y} ${x + w + s},${y} ${x + w + s - 4},${y + 6} ${x + s - 4},${y + 6}" fill="#ffffff" opacity="0.25"/>
  </g>
  <text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-family="${HEAD}" font-size="${size}" fill="#ffffff" letter-spacing="3">${label}</text>`;
}

const background = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#14265a"/>
      <stop offset="0.38" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="#040815"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.1" r="0.5">
      <stop offset="0" stop-color="#3b7bff" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#3b7bff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="lines" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="22" stroke="#ffffff" stroke-width="1.2" opacity="0.035"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#lines)"/>
  <polygon points="0,0 230,0 0,190" fill="${GOLD}" opacity="0.9"/>
  <polygon points="250,0 280,0 0,232 0,207" fill="${RED}"/>
  <polygon points="${W},0 ${W - 230},0 ${W},190" fill="${GOLD}" opacity="0.9"/>
  <polygon points="${W - 250},0 ${W - 280},0 ${W},232 ${W},207" fill="${RED}"/>
</svg>`;

const photoBottom = PHOTO.top + PHOTO.height;
const seal = { cx: 1070, cy: photoBottom - 150, r: 130 };
const panelTop = 1590;

const overlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff1b8"/>
      <stop offset="0.45" stop-color="${GOLD}"/>
      <stop offset="0.55" stop-color="#d99a1c"/>
      <stop offset="1" stop-color="#ffd66b"/>
    </linearGradient>
    <linearGradient id="goldPanel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffd45e"/>
      <stop offset="0.5" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="#e0a52a"/>
    </linearGradient>
    <linearGradient id="redBanner" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ef3b3b"/>
      <stop offset="1" stop-color="#a51515"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <text x="${W / 2}" y="404" text-anchor="middle" font-family="${HEAD}" font-size="150" fill="url(#gold)" stroke="#6b4a08" stroke-width="2" letter-spacing="4" filter="url(#shadow)">ACCIDENT</text>
  <text x="${W / 2}" y="506" text-anchor="middle" font-family="${HEAD}" font-size="104" fill="#ffffff" letter-spacing="2" filter="url(#shadow)">CAR REPAIR</text>

  <g filter="url(#shadow)">
    <polygon points="${W / 2 - 370},532 ${W / 2 + 395},532 ${W / 2 + 370},602 ${W / 2 - 395},602" fill="url(#redBanner)"/>
  </g>
  <text x="${W / 2}" y="584" text-anchor="middle" font-family="${HEAD}" font-size="50" fill="#ffffff" letter-spacing="6">SERVICE AVAILABLE</text>
  <text x="${W / 2}" y="660" text-anchor="middle" font-family="${BODY}" font-size="38" font-weight="700" fill="${GOLD}" direction="rtl">خدمة إصلاح السيارات المتضررة من الحوادث</text>

  ${tag(60, PHOTO.top + 70, 250, 74, RED, "BEFORE", 46)}
  ${tag(W - 310, PHOTO.top + 70, 250, 74, GREEN, "AFTER", 46)}

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

  const fade = Buffer.from(`
<svg width="${W}" height="${PHOTO.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.12" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.85" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${PHOTO.height}" fill="url(#f)"/>
</svg>`);
  const photo = await sharp(photoPath)
    .extract({ left: 0, top: PHOTO.sourceTop, width: srcW, height: cropH })
    .resize(W, PHOTO.height, { fit: "cover" })
    .modulate({ saturation: 1.08 })
    .composite([{ input: fade, blend: "dest-in" }])
    .png()
    .toBuffer();

  const logo = await sharp(LOGO).resize({ width: LOGO_WIDTH }).png().toBuffer();

  mkdirSync(dirname(outPath), { recursive: true });
  const info = await sharp(Buffer.from(background))
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
