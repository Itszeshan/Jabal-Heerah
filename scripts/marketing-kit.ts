/** Shared colours, fonts, icons and SVG helpers for the marketing images in `marketing/`. */

export const GOLD = "#f5c542";
export const NAVY = "#0b1530";
export const RED = "#d62828";
export const GREEN = "#1f9d55";
export const HEAD = "Segoe UI Black, Arial Black, Arial, sans-serif";
export const BODY = "Segoe UI, Arial, sans-serif";

/** 24x24 icon paths. */
export const ICON = {
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
};

export function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function starburst(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    coords.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return coords.join(" ");
}

/** A slanted label (parallelogram) with centred text. Needs the `shadow` filter from `sharedDefs`. */
export function slantTag(x: number, y: number, w: number, h: number, fill: string, label: string, size: number): string {
  const s = h * 0.35;
  return `
  <g filter="url(#shadow)">
    <polygon points="${x + s},${y} ${x + w + s},${y} ${x + w - s},${y + h} ${x - s},${y + h}" fill="${fill}"/>
    <polygon points="${x + s},${y} ${x + w + s},${y} ${x + w + s - 4},${y + 6} ${x + s - 4},${y + 6}" fill="#ffffff" opacity="0.25"/>
  </g>
  <text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-family="${HEAD}" font-size="${size}" fill="#ffffff" letter-spacing="3">${label}</text>`;
}

/** Gradients and the drop shadow used by the overlays: `gold`, `goldPanel`, `redBanner`, `shadow`. */
export const sharedDefs = `
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
    </filter>`;

/** Navy gradient with a top glow, faint diagonal lines and gold/red corner accents. */
export function backgroundSvg(w: number, h: number, corner = 230): string {
  const c = corner;
  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
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
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" fill="url(#lines)"/>
  <polygon points="0,0 ${c},0 0,${c * 0.83}" fill="${GOLD}" opacity="0.9"/>
  <polygon points="${c * 1.09},0 ${c * 1.22},0 0,${c * 1.01} 0,${c * 0.9}" fill="${RED}"/>
  <polygon points="${w},0 ${w - c},0 ${w},${c * 0.83}" fill="${GOLD}" opacity="0.9"/>
  <polygon points="${w - c * 1.09},0 ${w - c * 1.22},0 ${w},${c * 1.01} ${w},${c * 0.9}" fill="${RED}"/>
</svg>`;
}

/** Alpha mask for a photo band: fades the top and bottom fractions of the height to transparent. */
export function fadeMask(w: number, h: number, top = 0.12, bottom = top): Buffer {
  return Buffer.from(`
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="${top}" stop-color="#fff" stop-opacity="1"/>
      <stop offset="${1 - bottom}" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#f)"/>
</svg>`);
}
