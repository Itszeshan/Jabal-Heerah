"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cx } from "./ui";
import { LoadingMark } from "./loading-mark";

export function PendingImage({ className, onLoad, onError, alt, src, ...props }: ImageProps) {
  const srcKey = typeof src === "string" ? src : "";
  const [seen, setSeen] = useState<string | null>(null);
  const ready = seen === srcKey;

  return (
    <>
      {ready ? null : (
        <span className="pointer-events-none absolute inset-0 z-[1] grid place-items-center bg-well">
          <LoadingMark />
        </span>
      )}
      <Image
        {...props}
        src={src}
        alt={alt}
        className={cx("pending-photo", ready && "is-ready", className)}
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) setSeen(srcKey);
        }}
        onLoad={(event) => {
          setSeen(srcKey);
          onLoad?.(event);
        }}
        onError={(event) => {
          onError?.(event);
        }}
      />
    </>
  );
}
