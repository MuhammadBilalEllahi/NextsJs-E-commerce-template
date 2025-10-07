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
        <blockquote className="mt-3 text-lg md:text-xl font-medium text-foreground">
          “{item.quote}”
        </blockquote>
        <div className="mt-3 text-sm text-foreground/80">— {item.author}</div>
      </div>
      <GlowButton className="px-6 py-3 text-sm font-semibold text-foreground bg-card/60 hover:bg-card/70">
        CSSScript
      </GlowButton>
    </div>
  );
}
