import { site } from "../../config/site";

function embedSrc() {
  if (site.mapPinUrl.includes("output=embed")) return site.mapPinUrl;
  return `https://maps.google.com/maps?q=${encodeURIComponent(site.mapPinUrl || site.mapQuery)}&z=16&output=embed`;
}

export function mapLink() {
  return (
    site.mapPinUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`
  );
}

export function MapEmbed({ title, className }: { title: string; className?: string }) {
  return (
    <iframe
      title={title}
      src={embedSrc()}
      className={className ?? "h-full min-h-80 w-full border-0"}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
