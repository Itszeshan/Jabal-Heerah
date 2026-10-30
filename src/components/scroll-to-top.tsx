"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Product pages should open at the top. `scroll-behavior: smooth` on <html>
 * lets the browser keep animating the previous scroll, so a click from lower
 * on a long page lands on the bottom of the new one.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    html.getClientRects();
    window.scrollTo(0, 0);

    const until = performance.now() + 500;
    let frame = 0;
    const lockTop = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      if (performance.now() < until) frame = window.requestAnimationFrame(lockTop);
      else html.style.scrollBehavior = previous;
    };
    frame = window.requestAnimationFrame(lockTop);

    return () => {
      window.cancelAnimationFrame(frame);
      html.style.scrollBehavior = previous;
    };
  }, [pathname]);

  return null;
}
