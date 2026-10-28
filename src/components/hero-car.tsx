"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { cx } from "./ui";

const CAR_SRC = "/home/suv.webp";
/** Made by `scripts/chroma-key.ts` with `scripts/suv-paint-exclude.svg`: body paint only, not glass, wheels, grille or lights. */
const PAINT_MASK_SRC = "/home/suv-paint-mask.webp";
/** Made by `scripts/chroma-key.ts` from `scripts/suv-roof.svg`: the roof stays black whatever the body colour. */
const ROOF_MASK_SRC = "/home/suv-roof-mask.webp";

const COLOURS = [
  { id: "silver", hex: "#a7adb4", tint: "#ffffff", blend: "multiply" },
  { id: "white", hex: "#f4f4f2", tint: "#8c8c8c", blend: "screen" },
  { id: "black", hex: "#16181b", tint: "#3a3c40", blend: "multiply" },
  { id: "red", hex: "#b3141f", tint: "#e0172f", blend: "multiply" },
  { id: "blue", hex: "#1f4fbf", tint: "#2a62f0", blend: "multiply" },
  { id: "orange", hex: "#d4561a", tint: "#ff7a24", blend: "multiply" },
  { id: "green", hex: "#1f5e3f", tint: "#2fae6c", blend: "multiply" },
  { id: "gold", hex: "#b8902c", tint: "#f0c54a", blend: "multiply" },
] as const;

export type CarColourId = (typeof COLOURS)[number]["id"];
type Colour = (typeof COLOURS)[number];

function maskStyle(src: string): CSSProperties {
  return {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}

/**
 * Where the tyres touch the floor in `suv.webp`, in percent of its box: far front (10%, 94.5%),
 * near front (53.7%, 99.8%) and rear (92.5%, 86.2%). The rear tyre sits higher because it is further away.
 */
const contactShadow: CSSProperties = {
  backgroundImage: [
    "radial-gradient(4.5% 1.2% at 53.7% 99.6%, rgb(0 0 0), transparent)",
    "radial-gradient(3.5% 1.1% at 92.3% 86.4%, rgb(0 0 0), transparent)",
    "radial-gradient(4% 1.1% at 10% 94.8%, rgb(0 0 0), transparent)",
    "radial-gradient(9% 3% at 53.7% 99%, rgb(0 0 0 / 0.9), transparent)",
    "radial-gradient(7.5% 3% at 91.5% 86.5%, rgb(0 0 0 / 0.95), transparent)",
    "radial-gradient(8% 2.8% at 10% 94.5%, rgb(0 0 0 / 0.9), transparent)",
  ].join(", "),
};

/** Darkens the stage floor (and its bright horizon line) around the car, so the far tyre reads as standing on it. */
const floorShade: CSSProperties = {
  backgroundImage: "radial-gradient(50% 50% at 52% 45%, rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.25) 60%, transparent)",
};

/** Floor under the body, joining the three contact points. */
const bodyShadowShape: CSSProperties = {
  clipPath: "polygon(3% 92%, 10% 96%, 54% 100.5%, 94% 87.5%, 90% 82%, 45% 86%)",
};

/**
 * The floor line runs through the contact points, so the reflection is mirrored about two lines that meet
 * under the near front tyre: skewY(angle) scaleY(-1) mirrors about a line whose slope is half of tan(angle).
 */
const reflectionHalves: CSSProperties[] = [
  { clipPath: "inset(0 46.3% 0 0)", transformOrigin: "53.7% 99.8%", transform: "skewY(7.2deg) scaleY(-1)" },
  { clipPath: "inset(0 0 0 53.7%)", transformOrigin: "53.7% 99.8%", transform: "skewY(-20.4deg) scaleY(-1)" },
];

const reflectionFade: CSSProperties = {
  WebkitMaskImage: "linear-gradient(to top, rgb(0 0 0 / 0.9), transparent 40%)",
  maskImage: "linear-gradient(to top, rgb(0 0 0 / 0.9), transparent 40%)",
};

function CarLayers({ colour, alt, priority }: { colour: Colour; alt: string; priority?: boolean }) {
  return (
    <>
      <Image
        src={CAR_SRC}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 48vw, 100vw"
        className="object-contain"
      />
      <div
        className="absolute inset-0 transition-[background-color] duration-500"
        style={{ ...maskStyle(PAINT_MASK_SRC), backgroundColor: colour.tint, mixBlendMode: colour.blend }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[#25272b]"
        style={{ ...maskStyle(ROOF_MASK_SRC), mixBlendMode: "multiply" }}
        aria-hidden
      />
      {/* Blue stage light from above, so the studio shot sits in the scene. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#3d7bff]/45 via-[#3d7bff]/10 to-black/25"
        style={{ ...maskStyle(CAR_SRC), mixBlendMode: "soft-light" }}
        aria-hidden
      />
    </>
  );
}

export function HeroCar({
  alt,
  pickLabel,
  names,
}: {
  alt: string;
  pickLabel: string;
  names: Record<CarColourId, string>;
}) {
  const [colourId, setColourId] = useState<CarColourId>("blue");
  const colour = COLOURS.find((item) => item.id === colourId) ?? COLOURS[0];

  return (
    <div className="relative w-full lg:absolute lg:end-4 lg:bottom-[11%] lg:w-[48%]">
      <div className="relative aspect-[788/420] w-full">
        <div className="absolute -inset-x-[6%] top-[72%] h-[40%] blur-lg" style={floorShade} aria-hidden />
        {reflectionHalves.map((half, index) => (
          <div
            key={index}
            className="absolute inset-0 opacity-30 blur-[1.5px]"
            style={{ ...half, ...reflectionFade }}
            aria-hidden
          >
            <div className="relative isolate size-full">
              <CarLayers colour={colour} alt="" />
            </div>
          </div>
        ))}
        <div className="absolute inset-0 blur-md" aria-hidden>
          <div className="size-full bg-black/70" style={bodyShadowShape} />
        </div>
        <div className="absolute inset-0" style={contactShadow} aria-hidden />
        <div className="relative isolate size-full drop-shadow-[0_0_28px_rgb(61_123_255/0.28)]">
          <CarLayers colour={colour} alt={alt} priority />
        </div>
      </div>

      <fieldset className="relative z-10 mt-6 flex flex-col items-center gap-3 lg:absolute lg:inset-x-0 lg:top-full lg:mt-3 lg:gap-1.5">
        <legend className="sr-only">{pickLabel}</legend>
        <div className="flex flex-wrap justify-center gap-2.5">
          {COLOURS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === colourId}
              aria-label={names[item.id]}
              title={names[item.id]}
              onClick={() => setColourId(item.id)}
              className={cx(
                "size-8 rounded-full border border-white/40 shadow-md shadow-black/40 transition-transform hover:scale-110",
                item.id === colourId && "ring-2 ring-white ring-offset-2 ring-offset-charcoal",
              )}
              style={{ backgroundColor: item.hex }}
            />
          ))}
        </div>
        <p className="text-sm text-white/85" aria-live="polite">
          {names[colourId]}
        </p>
      </fieldset>
    </div>
  );
}
