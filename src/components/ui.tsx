import type { ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const variants = {
  primary:
    "bg-orange text-white hover:bg-orange-ink focus-visible:outline-ink",
  secondary:
    "border border-ink bg-white text-ink hover:bg-paper",
  inverse:
    "border border-white bg-transparent text-white hover:bg-white hover:text-ink",
  dark: "bg-charcoal text-white hover:bg-ink",
} as const;

export function buttonClass(variant: keyof typeof variants = "primary", className?: string) {
  return cx(
    "inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold whitespace-nowrap transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className,
  );
}

export function fieldClass() {
  return "min-h-11 w-full border border-line bg-white px-3 text-ink placeholder:text-muted";
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-7xl px-4", className)}>{children}</div>;
}
