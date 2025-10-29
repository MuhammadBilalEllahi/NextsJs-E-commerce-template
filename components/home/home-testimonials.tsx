"use client";

import { useEffect, useState } from "react";
import { TestimonialsSlider } from "./testimonials-slider";
import { listPublicTestimonials } from "@/lib/api/testimonials";

export function HomeTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await listPublicTestimonials();
        console.log("Testimonials API response:", data); // Debug log
        if (data?.success) {
          setTestimonials(data.testimonials || []);
          console.log("Testimonials loaded:", data.testimonials); // Debug log
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
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-base md:text-lg font-semibold tracking-widest uppercase text-muted-foreground">
            What Our Customers Say
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-b-transparent"></div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-base md:text-lg font-semibold tracking-widest uppercase text-muted-foreground">
          What Our Customers Say
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="max-w-4xl mx-auto">
        <TestimonialsSlider items={testimonials} />
      </div>
    </section>
  );
}
