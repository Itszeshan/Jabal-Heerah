import { site } from "../../config/site";

function mapTarget() {
  return site.geo ? `${site.geo.latitude},${site.geo.longitude}` : site.mapQuery;
}

function embedSrc() {
  if (site.mapPinUrl.includes("output=embed")) return site.mapPinUrl;
  return `https://maps.google.com/maps?q=${encodeURIComponent(mapTarget())}&z=17&output=embed`;
}

export function mapLink() {
  return (
    site.mapPinUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapTarget())}`
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
