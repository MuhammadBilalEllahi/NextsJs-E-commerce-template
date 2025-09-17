"use client";

import { useMemo, useState } from "react";

interface VariantLabel {
  imageIndex: number;
  label: string;
}

export function ProductImages({
  images = [] as string[],
  title = "Product",
  variantLabels = [] as VariantLabel[],
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = images[index] ?? "/modern-tech-product.png";
  const cursor = useMemo(
    () => (zoom ? "cursor-zoom-out" : "cursor-zoom-in"),
    [zoom]
  );

  // Helper function to get variant label for a specific image
  const getVariantLabel = (imageIndex: number) => {
    return variantLabels.find((vl) => vl.imageIndex === imageIndex)?.label;
  };

  return (
    <div className="lg:sticky top-4 h-fit">
      <div className="relative overflow-hidden rounded-lg border max-h-[35rem]">
        <img
          src={current || "/placeholder.svg"}
          alt={title}
          className={`w-full object-fill transition-transform duration-300 ${cursor} ${
            zoom ? "scale-125" : "scale-100"
          }`}
          onClick={() => setZoom((z) => !z)}
        />
        {/* Show variant label on main image if it's a variant image */}
        {getVariantLabel(index) && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
            {getVariantLabel(index)}
          </div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i);
              setZoom(false);
            }}
            className={`relative rounded border overflow-hidden ${
              i === index ? "ring-2 ring-red-600" : ""
            }`}
          >
            <img
              src={src || "/placeholder.svg?height=64&width=64&query=thumb"}
              alt={`${title} ${i + 1}`}
              className="h-16 w-full object-cover"
            />
            {/* Show variant label on thumbnail if it's a variant image */}
            {getVariantLabel(i) && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white px-1 py-0.5 rounded-tl text-xs font-medium">
                {getVariantLabel(i)}
              </div>
            )}
          </button>
        ))}
      </div>
      {/* Sticky add-to-cart bar is in AddToCartSection */}
    </div>
  );
}
