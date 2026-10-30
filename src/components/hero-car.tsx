"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { carColours, carImage, photoCarColour, type CarColourId } from "../../config/car-colours";
import { cx } from "./ui";

/** Jetour T2 (2026), one pre-painted image per colour made by `scripts/car-colours.ts`. */
const CAR_SRC = carImage(photoCarColour);

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
 * Where the tyres touch the floor in the car images (971x672), in percent of its box: far front (11.3%, 93.2%),
 * near front (68%, 98.2%) and rear (94.2%, 86.9%). The rear tyre sits higher because it is further away.
 */
const contactShadow: CSSProperties = {
  backgroundImage: [
    "radial-gradient(5.5% 1% at 68% 98%, rgb(0 0 0), transparent)",
    "radial-gradient(3.5% 0.9% at 94.2% 86.8%, rgb(0 0 0), transparent)",
    "radial-gradient(5% 0.9% at 11.3% 93.1%, rgb(0 0 0), transparent)",
    "radial-gradient(10% 2.5% at 68% 97.5%, rgb(0 0 0 / 0.9), transparent)",
    "radial-gradient(7% 2.5% at 93.7% 86.9%, rgb(0 0 0 / 0.95), transparent)",
    "radial-gradient(9% 2.4% at 11.3% 92.9%, rgb(0 0 0 / 0.9), transparent)",
  ].join(", "),
};

/** Darkens the stage floor (and its bright horizon line) around the car, so the far tyre reads as standing on it. */
const floorShade: CSSProperties = {
  backgroundImage: "radial-gradient(50% 50% at 55% 40%, rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.25) 60%, transparent)",
};

/** Floor under the body, joining the three visible contact points and the hidden far rear tyre (about 37.6%, 81.8%). */
const bodyShadowShape: CSSProperties = {
  clipPath: "polygon(4% 91.4%, 11.3% 94.9%, 68% 99%, 96% 87.9%, 92% 84.4%, 37.6% 80.7%)",
};

/**
 * The floor line runs through the contact points, so the reflection is mirrored about two lines that meet
 * under the near front tyre: skewY(angle) scaleY(-1) mirrors about a line whose slope is half of tan(angle).
 */
const reflectionHalves: CSSProperties[] = [
  { clipPath: "inset(0 32% 0 0)", transformOrigin: "68% 98.2%", transform: "skewY(7deg) scaleY(-1)" },
  { clipPath: "inset(0 0 0 68%)", transformOrigin: "68% 98.2%", transform: "skewY(-30.8deg) scaleY(-1)" },
];

const reflectionFade: CSSProperties = {
  WebkitMaskImage: "linear-gradient(to top, rgb(0 0 0 / 0.9), transparent 40%)",
  maskImage: "linear-gradient(to top, rgb(0 0 0 / 0.9), transparent 40%)",
};

type Paint = { current: CarColourId; previous: CarColourId | null; loaded: CarColourId[] };

/**
 * Only colours that were chosen or hovered are mounted. The new colour fades in over the previous one,
 * which stays underneath until then, so a slow download never shows an empty stage.
 */
function CarLayers({ paint, alt, priority }: { paint: Paint; alt: string; priority?: boolean }) {
  return (
    <>
      {paint.loaded.map((id) => (
        <Image
          key={id}
          src={carImage(id)}
          alt={id === paint.current ? alt : ""}
          fill
          priority={priority && id === photoCarColour}
          sizes="(min-width: 1024px) 48vw, 100vw"
          className={cx(
            "object-contain transition-opacity duration-500",
            id === paint.current ? "z-[2] opacity-100" : id === paint.previous ? "z-[1] opacity-100" : "opacity-0",
          )}
        />
      ))}
      {/* Blue stage light from above, so the studio shot sits in the scene. */}
      <div
        className="absolute inset-0 z-[3] bg-gradient-to-b from-[#3d7bff]/35 via-[#3d7bff]/10 to-black/25"
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
  const [paint, setPaint] = useState<Paint>({ current: photoCarColour, previous: null, loaded: [photoCarColour] });

  function preload(id: CarColourId) {
    setPaint((state) => (state.loaded.includes(id) ? state : { ...state, loaded: [...state.loaded, id] }));
  }

  function choose(id: CarColourId) {
    setPaint((state) =>
      state.current === id
        ? state
        : {
            current: id,
            previous: state.current,
            loaded: state.loaded.includes(id) ? state.loaded : [...state.loaded, id],
          },
    );
  }

  return (
    <div className="relative w-full lg:absolute lg:end-4 lg:bottom-[11%] lg:w-[48%]">
      <div className="relative aspect-[971/672] w-full">
        <div className="absolute -inset-x-[6%] top-[72%] h-[40%] blur-lg" style={floorShade} aria-hidden />
        {reflectionHalves.map((half, index) => (
          <div
            key={index}
            className="absolute inset-0 opacity-30 blur-[1.5px]"
            style={{ ...half, ...reflectionFade }}
            aria-hidden
          >
            <div className="relative isolate size-full">
              <CarLayers paint={paint} alt="" />
            </div>
          </div>
        ))}
        <div className="absolute inset-0 blur-md" aria-hidden>
          <div className="size-full bg-black/70" style={bodyShadowShape} />
        </div>
        <div className="absolute inset-0" style={contactShadow} aria-hidden />
        <div className="relative isolate size-full drop-shadow-[0_0_28px_rgb(61_123_255/0.28)]">
          <CarLayers paint={paint} alt={alt} priority />
        </div>
      </div>

      <fieldset className="relative z-10 mt-6 flex flex-col items-center gap-3 lg:absolute lg:inset-x-0 lg:top-full lg:mt-3 lg:gap-1.5">
        <legend className="sr-only">{pickLabel}</legend>
        <div className="flex flex-wrap justify-center gap-2.5">
          {carColours.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === paint.current}
              aria-label={names[item.id]}
              title={names[item.id]}
              onPointerEnter={() => preload(item.id)}
              onFocus={() => preload(item.id)}
              onClick={() => choose(item.id)}
              className={cx(
                "size-8 rounded-full border border-white/40 shadow-md shadow-black/40 transition-transform hover:scale-110",
                item.id === paint.current && "ring-2 ring-white ring-offset-2 ring-offset-charcoal",
              )}
              style={{ backgroundColor: item.hex }}
            />
          ))}
        </div>
        <p className="text-sm text-white/85" aria-live="polite">
          {names[paint.current]}
        </p>
      </fieldset>
    </div>
  );
}
