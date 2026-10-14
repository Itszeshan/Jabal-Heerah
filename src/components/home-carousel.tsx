"use client";

import { PendingImage } from "./pending-image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "./ui";

export type HomeSlide = {
  id: string;
  kind: "sale" | "highlight" | "offers" | "activity" | "new";
  href: string;
  title: string;
  body: string;
  image: string;
  meta: string;
  compare?: string;
  cta: string;
  external?: boolean;
};

const AUTO_MS = 4500;

function slideLabel(kind: HomeSlide["kind"], labels: { sale: string; highlight: string; offers: string; activity: string; fresh: string }) {
  if (kind === "sale") return labels.sale;
  if (kind === "offers") return labels.offers;
  if (kind === "activity") return labels.activity;
  if (kind === "new") return labels.fresh;
  return labels.highlight;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function HomeCarousel({
  slides,
  dir,
  labels,
}: {
  slides: HomeSlide[];
  dir: "ltr" | "rtl";
  labels: { sale: string; highlight: string; offers: string; activity: string; fresh: string; previous: string; next: string; position: string };
}) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const reduced = useReducedMotion();
  const count = slides.length;
  const current = count === 0 ? 0 : index % count;

  useEffect(() => {
    const onHide = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  useEffect(() => {
    if (reduced || hidden || count < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % count), AUTO_MS);
    return () => window.clearInterval(timer);
  }, [reduced, hidden, count, index]);

  if (count === 0) return null;

  const slide = slides[current];
  const position = labels.position.replace("{current}", String(current + 1)).replace("{total}", String(count));
  const shift = (dir === "rtl" ? current : -current) * (100 / count);
  const label = slideLabel(slide.kind, labels);

  function go(step: number) {
    setIndex((value) => (value + step + count) % count);
  }

  return (
    <div
      className="border border-line bg-white"
      role="region"
      aria-roledescription="carousel"
      aria-label={position}
    >
      <div className="overflow-hidden">
        <div
          className="flex motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${count * 100}%`, transform: `translateX(${shift}%)` }}
        >
          {slides.map((item, itemIndex) => {
            const itemLabel = slideLabel(item.kind, labels);
            const actionClass = buttonClass(item.kind === "highlight" ? "secondary" : "primary", "mt-6 w-fit");
            return (
              <article
                key={item.id}
                className="grid shrink-0 lg:grid-cols-2"
                style={{ width: `${100 / count}%` }}
                aria-hidden={itemIndex !== current}
                inert={itemIndex !== current}
              >
                <div className={`relative min-h-64 lg:col-start-2 lg:row-start-1 lg:min-h-[24rem] ${item.image ? "photo-well" : "bg-charcoal"}`}>
                  {item.image ? (
                    <PendingImage
                      src={item.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-contain p-6"
                      priority={itemIndex === 0}
                    />
                  ) : (
                    <p className="flex h-full min-h-64 items-end p-8 text-3xl font-semibold text-white lg:min-h-[24rem]">{item.title}</p>
                  )}
                </div>
                <div className="flex flex-col justify-center p-5 md:p-8 lg:col-start-1 lg:row-start-1 lg:p-10">
                  <p className="text-sm font-semibold text-orange-ink">{itemLabel}</p>
                  <h3 className="mt-3 max-w-md text-3xl font-semibold tracking-tight md:text-4xl">{item.title}</h3>
                  <p className="mt-3 max-w-md text-base leading-7 text-muted">{item.body}</p>
                  {item.meta ? (
                    <p className="mt-4 flex flex-wrap items-baseline gap-3 text-sm font-semibold tabular-nums">
                      {item.compare ? <span className="font-normal text-muted line-through">{item.compare}</span> : null}
                      <span>{item.meta}</span>
                    </p>
                  ) : null}
                  {item.external ? (
                    <a href={item.href} className={actionClass} target="_blank" rel="noopener noreferrer">
                      {item.cta}
                    </a>
                  ) : (
                    <Link href={item.href} className={actionClass}>
                      {item.cta}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {count > 1 && !reduced ? (
        <div className="h-0.5 bg-line">
          <div key={current} className="carousel-progress h-full bg-orange" />
        </div>
      ) : null}
      {count > 1 ? (
        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 md:px-8">
          <p className="text-sm tabular-nums text-muted" aria-live="polite">
            <span className="sr-only">{label}. </span>
            {position}
          </p>
          <div className="flex gap-2">
            <button type="button" className={buttonClass("secondary", "size-11 px-0")} aria-label={labels.previous} onClick={() => go(-1)}>
              <CaretLeft size={18} weight="regular" className="rtl:rotate-180" aria-hidden />
            </button>
            <button type="button" className={buttonClass("secondary", "size-11 px-0")} aria-label={labels.next} onClick={() => go(1)}>
              <CaretRight size={18} weight="regular" className="rtl:rotate-180" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
