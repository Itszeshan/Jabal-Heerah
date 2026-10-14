import {
  Drop,
  Eraser,
  Hammer,
  PaintBrush,
  PaintBucket,
  Palette,
  Sparkle,
  Stack,
  Wrench,
} from "@phosphor-icons/react/ssr";

const icons = {
  denting: Hammer,
  "full-painting": PaintBucket,
  "panel-painting": PaintBrush,
  "scratch-repair": Eraser,
  "colour-matching": Palette,
  polishing: Sparkle,
  detailing: Drop,
  "bumper-repair": Wrench,
  rims: Stack,
} as const;

export function ServiceIcon({ id, size = 20 }: { id: string; size?: number }) {
  const Icon = icons[id as keyof typeof icons] ?? Wrench;
  return <Icon size={size} weight="regular" aria-hidden />;
}

export function ServiceMark({ id }: { id: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center border border-line bg-well text-ink">
      <ServiceIcon id={id} />
    </span>
  );
}
