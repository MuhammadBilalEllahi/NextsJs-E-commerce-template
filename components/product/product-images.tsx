"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type VariantLabel = {
  label: string;
  imageIndex?: number;
};

export function ProductImages({
  images = [] as string[],
  name = "Product",
  variantLabels = [] as VariantLabel[],
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const getVariantLabel = (imageIndex: number) => {
    const v = variantLabels.find((v) => v.imageIndex === imageIndex);
    return v?.label || null;
  };

  useEffect(() => {
    if (!thumbsRef.current) return;
    const el = thumbsRef.current.querySelector(
      `[data-index="${activeIndex}"]`
    ) as HTMLButtonElement | null;
    if (el) {
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [activeIndex]);

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-lg border bg-muted" />;
  }

  return (
    <div className="grid gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-card">
        <Image
          width={128}
          height={128}
          src={images[activeIndex]}
          alt={`${name} image ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
        {getVariantLabel(activeIndex) && (
          <div className="absolute bottom-2 left-2 rounded-md bg-foreground/70 px-2 py-1 text-xs font-medium text-background">
            {getVariantLabel(activeIndex)}
          </div>
        )}
      </div>

      <div
        ref={thumbsRef}
        className="hide-scrollbar flex gap-2 overflow-x-auto py-1"
      >
        {images.map((src, i) => (
          <button
            key={i}
            data-index={i}
            onClick={() => setActiveIndex(i)}
            className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border ${
              i === activeIndex ? "ring-2 ring-primary" : ""
            }`}
            aria-label={`Preview image ${i + 1}`}
          >
            <Image
              width={128}
              height={128}
              src={src}
              alt="thumb"
              className="h-full w-full object-cover"
            />
            {i === activeIndex && (
              <div className="absolute inset-0 bg-foreground/10" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
