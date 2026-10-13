"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { captureUtm } from "@/lib/utm";

export function UtmCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUtm();
  }, [pathname, searchParams]);

  return null;
}
