"use client";

import { useEffect, useState } from "react";

export function TestimonialsSlider() {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<{ author: string; quote: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/testimonials");
        const data = await res.json();
        if (data?.success) {
          setItems(
            (data.testimonials || []).map((x: any) => ({
              author: x.author,
              quote: x.quote,
            }))
          );
        }
      } catch {
        setItems([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 3000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }
  const item = items[index];
  return (
    <div className="rounded-xl border bg-white p-6 shadow">
      <div className="text-sm text-neutral-600 dark:text-neutral-300">
        What our customers say
      </div>
      <blockquote className="mt-2 text-lg font-medium">
        “{item.quote}”
      </blockquote>
      <div className="mt-2 text-sm">— {item.author}</div>
    </div>
  );
}
