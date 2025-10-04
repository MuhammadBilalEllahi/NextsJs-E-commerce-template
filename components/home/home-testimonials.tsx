"use client";

import { useEffect, useState } from "react";
import { TestimonialsSlider } from "./testimonials-slider";

export function HomeTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        const data = await res.json();
        if (data?.success) {
          setTestimonials(data.testimonials || []);
        }
      } catch (error) {
        console.error("Error loading testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] flex-1 bg-gray-300" />
          <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
            What Our Customers Say
          </h2>
          <div className="h-[1px] flex-1 bg-gray-300" />
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-gray-300" />
        <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
          What Our Customers Say
        </h2>
        <div className="h-[1px] flex-1 bg-gray-300" />
      </div>

      <div className="max-w-4xl mx-auto">
        <TestimonialsSlider />
      </div>
    </section>
  );
}

