"use client";

import { useEffect, useState } from "react";
import { GlowButton } from "../ui/glow-button";

type TestimonialItem = {
  author: string;
  quote: string;
};

export function TestimonialsSlider({ items }: { items: TestimonialItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items]);
  // Reset index if it's out of bounds
  useEffect(() => {
    if (items.length > 0 && index >= items.length) {
      setIndex(0);
    }
  }, [items.length, index]);

  if (!items || items.length === 0) {
    return null;
  }

  const item = items[index];

  return (
    <div className="relative rounded-2xl">
      <div className="border-orbit-track border-orbit">
        <div className="border-orbit-dot" />
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 md:p-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--cta-gradient-from)] via-transparent to-[var(--cta-gradient-to)]" />
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          What our customers say
        </div>
        <blockquote className="mt-3 text-lg md:text-xl font-medium text-primary">
          "{item.quote}"
        </blockquote>
        <div className="mt-3 text-sm text-foreground/80">— {item.author}</div>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 text-xs text-muted-foreground/50">
            Testimonial {index + 1} of {items.length}
          </div>
        )}
      </div>
    </div>
  );
}
