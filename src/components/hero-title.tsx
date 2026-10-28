import Image from "next/image";
import type { CSSProperties } from "react";
import type { Locale } from "@/types/content";
import { cx } from "./ui";

const NAME = { src: "/home/logo-name.webp", width: 973, height: 112, quality: 90 };
/** Drawn at 60% of its artwork height (`aspect-[793/24]`) so it reads as a thin rule. */
const BAR = { src: "/home/logo-bar.webp", width: 793, height: 40, quality: 90 };
const TAGLINE = { src: "/home/logo-tagline.webp", width: 798, height: 93, quality: 90 };

function delay(seconds: number) {
  return { "--delay": `${seconds}s` } as CSSProperties;
}

/** Light streak clipped to the lettering of a logo part. */
function Shine({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="logo-shine"
      style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
    />
  );
}

/**
 * Shop name, paint bar and tagline cut from the logo artwork (`scripts/logo-parts.ts`).
 * The artwork lettering is English, so the Arabic page sets the name and tagline as gold text.
 */
export function HeroTitle({ name, tagline, locale }: { name: string; tagline: string; locale: Locale }) {
  const artwork = locale === "en";

  return (
    <div
      className={cx(
        "flex-col items-center drop-shadow-[0_4px_12px_rgb(0_0_0/0.45)]",
        artwork ? "flex w-full max-w-[36rem]" : "inline-flex max-w-full",
      )}
    >
      <h1 className="logo-rise relative w-full">
        {artwork ? (
          <>
            <Image {...NAME} alt={name} priority sizes="(min-width: 1024px) 576px, 100vw" className="h-auto w-full" />
            <Shine src={NAME.src} />
          </>
        ) : (
          <span className="gold-chrome block whitespace-nowrap text-[clamp(1.5rem,7vw,3rem)] font-bold leading-[1.3] lg:text-[clamp(2rem,3.4vw,3rem)]">
            {name}
          </span>
        )}
      </h1>
      <Image
        {...BAR}
        alt=""
        sizes="(min-width: 1024px) 472px, 82vw"
        className="logo-draw mt-2 aspect-[793/24] h-auto w-[82%]"
        style={delay(0.25)}
      />
      <p className="logo-rise relative mt-2 w-[82%] text-center" style={delay(0.45)}>
        {artwork ? (
          <>
            <Image {...TAGLINE} alt={tagline} sizes="(min-width: 1024px) 472px, 82vw" className="h-auto w-full" />
            <Shine src={TAGLINE.src} />
          </>
        ) : (
          <span className="gold-chrome text-base font-semibold md:text-lg lg:text-xl">{tagline}</span>
        )}
      </p>
    </div>
  );
}
