import { PendingImage } from "./pending-image";
import { PhotoSlot } from "./photo-slot";

export async function ProductMedia({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 100vw",
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src?.startsWith("/")) return <PhotoSlot />;

  return (
    <div className="photo-well relative aspect-square">
      <PendingImage src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-contain p-4" />
    </div>
  );
}
