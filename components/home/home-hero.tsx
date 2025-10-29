"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner, GlobalSettings } from "@/types/types";
import Image from "next/image";

export function HomeHero({
  banners,
  globalSettings,
}: {
  banners: Banner[];
  globalSettings: GlobalSettings;
}) {
  // const [banners, setBanners] = useState<Banner[]>([])
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isPaused, setIsPaused] = useState(false);
  // const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null)

  // Fetch banners and global settings on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Filter only active banners and those that haven't expired
        const activeBanners = banners.filter((banner: Banner) => {
          if (!banner.isActive) return false;
          if (banner.expiresAt) {
            const expiryDate = new Date(banner.expiresAt);
            const now = new Date();
            return expiryDate > now;
          }
          return true;
        });

        // console.debug("Active banners:", activeBanners)
        // setBanners(activeBanners)
        // setGlobalSettings(fetchedSettings)
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-advance slides with individual banner timeouts
  useEffect(() => {
    if (banners.length <= 1 || !globalSettings || isPaused) return;

    const currentBanner = banners[index];
    const timeout = currentBanner.timeout || globalSettings.bannerScrollTime;

    const t = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, timeout);

    return () => clearInterval(t);
  }, [banners, index, globalSettings, isPaused]);

  // Don't render if no banners or still loading
  if (loading) {
    return (
      <section className="relative">
        <div className="relative isolate overflow-hidden rounded-none">
          <div className="w-full h-[360px] md:h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">
            <Image
              src="/dehli-mirch-ecommerce-banner.png"
              alt="Loading banners"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const current = banners[index];

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative isolate overflow-hidden rounded-none ">
        <div className="w-full h-[360px] md:h-[500px] ">
          <Image
            fill
            src={current.image || "/placeholder.svg"}
            alt={current.title}
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="ml-10 px-6 md:px-10">
            {current.showTitle && (
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {current.title}
              </h1>
            )}
            {current.showDescription && (
              <p className="mt-2 text-foreground/90 md:text-lg">
                {current.description}
              </p>
            )}
            {current.showLink && current.link && (
              <Link
                href={current.link}
                className="inline-block mt-5 rounded-md bg-foreground text-background font-medium px-5 py-2.5 shadow hover:bg-primary"
              >
                Learn More
              </Link>
            )}
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <button
              aria-label="Previous slide"
              onClick={() =>
                setIndex((i) => (i - 1 + banners.length) % banners.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border bg-white/90 p-2 hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5 dark:text-black" />
            </button>
            <button
              aria-label="Next slide"
              onClick={() => setIndex((i) => (i + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border bg-white/90 p-2 hover:bg-white transition-colors"
            >
              <ChevronRight className="h-5 w-5 dark:text-black" />
            </button>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === index
                      ? "bg-primary w-6"
                      : "bg-white/70 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
