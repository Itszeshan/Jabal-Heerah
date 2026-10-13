"use client";

import { Funnel, X } from "@phosphor-icons/react";
import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";

export function FilterSheet({
  label,
  closeLabel,
  children,
}: {
  label: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 border border-line bg-white px-4 text-sm font-semibold lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Funnel size={18} aria-hidden />
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/50" aria-label={closeLabel} onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-auto bg-paper p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id={titleId} className="text-lg font-semibold">
                {label}
              </h2>
              <button type="button" className="inline-flex size-11 items-center justify-center" onClick={() => setOpen(false)}>
                <X size={20} aria-hidden />
                <span className="sr-only">{closeLabel}</span>
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
