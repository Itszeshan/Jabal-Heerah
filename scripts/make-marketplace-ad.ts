import { mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";
import { site } from "../config/site";
import { BODY, GOLD, HEAD, ICON, NAVY, RED, backgroundSvg, esc, fadeMask, sharedDefs } from "./marketing-kit";

/**
 * Builds the square (1080x1080) Facebook Marketplace ad for the shop: logo, headline, a wide shop photo,
 * product/service pills, phone + WhatsApp, website, social accounts and address.
 * Contact details come from `config/site.ts`.
 * Usage: npx tsx scripts/make-marketplace-ad.ts <photo.jpg> [out.png]
 */
const [photoPath, outPath = "marketing/marketplace-ad.png"] = process.argv.slice(2);
if (!photoPath) {
  console.error("Usage: npx tsx scripts/make-marketplace-ad.ts <photo.jpg> [out.png]");
  process.exit(1);
}

/** Shown on the Facebook page; `site.socials.instagram` stays empty until the owner confirms the account for the website. */
const INSTAGRAM_HANDLE = "jabalalheerahautopaints";
const FACEBOOK_NAME = site.name.en;
const TIKTOK_HANDLE = site.socials.tiktok.split("/@")[1] ?? "";

const W = 1080;
const H = 1080;
const LOGO = "public/jabal-logo.png";
const LOGO_WIDTH = 280;

const PHOTO = { top: 335, height: 415, sourceTop: 30 };
const PILLS = ["Car Paints", "Clear Coats", "Polishing", "Accident Repair"];
const PILLS_TOP = 700;
const panelTop = 866;

/** Logos from `public/brands/<slug>.webp`; card colour follows `data/brand-logos.csv` like the website. */
const BRANDS = ["challanger", "standox", "kapci", "numix", "sonax"];
const BRAND_CARD = { top: 762, width: 158, height: 66, gap: 12, left: 214, pad: 9 };
type Box = { left: number; top: number; width: number; height: number };
/**
 * Stacked logos (mark above the name) are tiny in a wide card, so the mark and the name are set side by side.
 * Boxes are in logo pixels (alpha bounds; `trim` does not work on these files' transparent edges).
 */
const STACKED: Record<string, { mark: Box; name: Box }> = {
  kapci: { mark: { left: 0, top: 0, width: 209, height: 181 }, name: { left: 85, top: 210, width: 257, height: 122 } },
};

async function wideLogo(slug: string): Promise<Buffer> {
  const file = `public/brands/${slug}.webp`;
  const stacked = STACKED[slug];
  if (!stacked) return sharp(file).trim({ threshold: 10 }).png().toBuffer();
  const mark = await sharp(file).extract(stacked.mark).png().toBuffer();
  const name = await sharp(file)
    .extract(stacked.name)
    .resize({ height: Math.round(stacked.mark.height * 0.8) })
    .png()
    .toBuffer();
  const [m, n] = await Promise.all([sharp(mark).metadata(), sharp(name).metadata()]);
  const gap = Math.round(stacked.mark.height * 0.12);
  const w = (m.width ?? 0) + gap + (n.width ?? 0);
  const h = Math.max(m.height ?? 0, n.height ?? 0);
  return sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: mark, left: 0, top: Math.round((h - (m.height ?? 0)) / 2) },
      { input: name, left: (m.width ?? 0) + gap, top: Math.round((h - (n.height ?? 0)) / 2) },
    ])
    .png()
    .toBuffer();
}

function brandBackgrounds(): Map<string, string> {
  const rows = readFileSync("data/brand-logos.csv", "utf8").trim().split(/\r?\n/).slice(1);
  return new Map(rows.map((row) => row.split(",").map((cell) => cell.trim()) as [string, string]));
}

function facebookIcon(cx: number, cy: number): string {
  return `
  <circle cx="${cx}" cy="${cy}" r="16" fill="#1877f2"/>
  <text x="${cx + 1}" y="${cy + 9}" text-anchor="middle" font-family="${HEAD}" font-size="25" fill="#ffffff">f</text>`;
}

function instagramIcon(cx: number, cy: number): string {
  return `
  <rect x="${cx - 16}" y="${cy - 16}" width="32" height="32" rx="9" fill="url(#insta)"/>
  <rect x="${cx - 10}" y="${cy - 10}" width="20" height="20" rx="6" fill="none" stroke="#ffffff" stroke-width="2.4"/>
  <circle cx="${cx}" cy="${cy}" r="4.6" fill="none" stroke="#ffffff" stroke-width="2.4"/>
  <circle cx="${cx + 6}" cy="${cy - 6}" r="1.5" fill="#ffffff"/>`;
}

function tiktokIcon(cx: number, cy: number): string {
  const at = (dx: number, colour: string) =>
    `<g transform="translate(${cx - 9 + dx} ${cy - 9 + dx}) scale(0.75)"><path d="${ICON.tiktok}" fill="${colour}"/></g>`;
  return `
  <circle cx="${cx}" cy="${cy}" r="16" fill="#000000"/>
  ${at(-1, "#25f4ee")}${at(1, "#fe2c55")}${at(0, "#ffffff")}`;
}

function globeIcon(cx: number, cy: number): string {
  return `
  <circle cx="${cx}" cy="${cy}" r="16" fill="${GOLD}"/>
  <g transform="translate(${cx - 11} ${cy - 11})">
    <circle cx="11" cy="11" r="9.5" fill="none" stroke="${NAVY}" stroke-width="2"/>
    <ellipse cx="11" cy="11" rx="4.3" ry="9.5" fill="none" stroke="${NAVY}" stroke-width="1.8"/>
    <line x1="1.5" y1="11" x2="20.5" y2="11" stroke="${NAVY}" stroke-width="1.8"/>
  </g>`;
}

const contacts = [
  { x: 50, y: 990, icon: globeIcon, label: site.domain, colour: GOLD },
  { x: 560, y: 990, icon: facebookIcon, label: FACEBOOK_NAME, colour: "#ffffff" },
  { x: 50, y: 1033, icon: instagramIcon, label: `@${INSTAGRAM_HANDLE}`, colour: "#ffffff" },
  { x: 560, y: 1033, icon: tiktokIcon, label: `@${TIKTOK_HANDLE}`, colour: "#ffffff" },
];

const pillW = 240;
const pillGap = 20;
const pillsLeft = (W - (PILLS.length * pillW + (PILLS.length - 1) * pillGap)) / 2;

const backgrounds = brandBackgrounds();
const brandCards = BRANDS.map((slug, i) => ({
  slug,
  x: BRAND_CARD.left + i * (BRAND_CARD.width + BRAND_CARD.gap),
  dark: backgrounds.get(slug) === "dark",
}));

const overlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>${sharedDefs}
    <linearGradient id="insta" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#feda75"/>
      <stop offset="0.35" stop-color="#fa7e1e"/>
      <stop offset="0.65" stop-color="#d62976"/>
      <stop offset="1" stop-color="#4f5bd5"/>
    </linearGradient>
  </defs>

  <text x="${W / 2}" y="254" text-anchor="middle" font-family="${HEAD}" font-size="94" fill="url(#gold)" stroke="#6b4a08" stroke-width="1.5" letter-spacing="3" filter="url(#shadow)">AUTO PAINTS</text>
  <g filter="url(#shadow)">
    <polygon points="${W / 2 - 340},274 ${W / 2 + 360},274 ${W / 2 + 340},322 ${W / 2 - 360},322" fill="url(#redBanner)"/>
  </g>
  <text x="${W / 2}" y="309" text-anchor="middle" font-family="${HEAD}" font-size="31" fill="#ffffff" letter-spacing="3">BODY REPAIR  •  COLOUR MATCHING</text>

  ${PILLS.map((label, i) => {
    const x = pillsLeft + i * (pillW + pillGap);
    const y = PILLS_TOP;
    return `
  <rect x="${x}" y="${y}" width="${pillW}" height="46" rx="23" fill="${NAVY}" fill-opacity="0.85" stroke="${GOLD}" stroke-width="2"/>
  <text x="${x + pillW / 2}" y="${y + 31}" text-anchor="middle" font-family="${BODY}" font-size="23" font-weight="700" fill="#ffffff">${esc(label)}</text>`;
  }).join("")}

  <text x="${BRAND_CARD.left - 22}" y="${BRAND_CARD.top + 28}" text-anchor="end" font-family="${HEAD}" font-size="22" fill="${GOLD}" letter-spacing="2">OUR</text>
  <text x="${BRAND_CARD.left - 22}" y="${BRAND_CARD.top + 54}" text-anchor="end" font-family="${HEAD}" font-size="22" fill="${GOLD}" letter-spacing="2">BRANDS</text>
  ${brandCards
    .map(
      (card) =>
        `<rect x="${card.x}" y="${BRAND_CARD.top}" width="${BRAND_CARD.width}" height="${BRAND_CARD.height}" rx="10" fill="${card.dark ? "#1b1e22" : "#ffffff"}" stroke="${GOLD}" stroke-width="2"/>`,
    )
    .join("\n  ")}

  <polygon points="0,${panelTop - 8} ${W},${panelTop - 30} ${W},${panelTop - 20} 0,${panelTop + 2}" fill="${RED}"/>
  <polygon points="0,${panelTop + 2} ${W},${panelTop - 20} ${W},952 0,952" fill="url(#goldPanel)"/>
  <circle cx="88" cy="910" r="34" fill="${NAVY}"/>
  <g transform="translate(70 892) scale(1.5)"><path d="${ICON.phone}" fill="${GOLD}"/></g>
  <circle cx="168" cy="910" r="34" fill="#25d366"/>
  <g transform="translate(150 892) scale(1.5)"><path d="${ICON.whatsapp}" fill="#ffffff"/></g>
  <text x="222" y="893" font-family="${BODY}" font-size="21" font-weight="800" fill="${NAVY}" letter-spacing="3">CALL / WHATSAPP</text>
  <text x="219" y="940" font-family="${HEAD}" font-size="50" fill="${NAVY}">${esc(site.phoneDisplay)}</text>

  ${contacts
    .map(
      (c) => `${c.icon(c.x + 16, c.y - 8)}
  <text x="${c.x + 42}" y="${c.y}" font-family="${BODY}" font-size="23" font-weight="700" fill="${c.colour}">${esc(c.label)}</text>`,
    )
    .join("")}

  <g transform="translate(${W / 2 - 318} 1053) scale(0.85)"><path d="${ICON.pin}" fill="${GOLD}"/></g>
  <text x="${W / 2 + 12}" y="1071" text-anchor="middle" font-family="${BODY}" font-size="19" fill="#ffffff" fill-opacity="0.85">${esc(site.address.en)}</text>
</svg>`;

async function main() {
  const meta = await sharp(photoPath).metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  const cropH = Math.min(Math.round((srcW * PHOTO.height) / W), srcH - PHOTO.sourceTop);

  const photo = await sharp(photoPath)
    .extract({ left: 0, top: PHOTO.sourceTop, width: srcW, height: cropH })
    .resize(W, PHOTO.height, { fit: "cover" })
    .modulate({ saturation: 1.06 })
    .composite([{ input: fadeMask(W, PHOTO.height, 0.12, 0.1), blend: "dest-in" }])
    .png()
    .toBuffer();

  const logo = await sharp(LOGO).resize({ width: LOGO_WIDTH }).png().toBuffer();

  const boxW = BRAND_CARD.width - 2 * BRAND_CARD.pad;
  const boxH = BRAND_CARD.height - 2 * BRAND_CARD.pad;
  const brandLogos = await Promise.all(
    brandCards.map(async (card) => {
      const { data, info } = await sharp(await wideLogo(card.slug))
        .resize(boxW, boxH, { fit: "inside" })
        .png()
        .toBuffer({ resolveWithObject: true });
      return {
        input: data,
        left: Math.round(card.x + BRAND_CARD.pad + (boxW - info.width) / 2),
        top: Math.round(BRAND_CARD.top + BRAND_CARD.pad + (boxH - info.height) / 2),
      };
    }),
  );

  mkdirSync(dirname(outPath), { recursive: true });
  const info = await sharp(Buffer.from(backgroundSvg(W, H, 170)))
    .composite([
      { input: logo, left: Math.round((W - LOGO_WIDTH) / 2), top: 14 },
      { input: photo, left: 0, top: PHOTO.top },
      { input: Buffer.from(overlay), left: 0, top: 0 },
      ...brandLogos,
    ])
    .png()
    .toFile(outPath);
  console.log(outPath, `${info.width}x${info.height}`);
}

main();
