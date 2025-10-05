import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dehli Mirch",
    short_name: "DehliMirch",
    description:
      "Dehli Mirch — Authentic spices, pickles, and snacks. Heat you can taste.",
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ef4444",
    icons: [
      { src: "/placeholder-logo.png", sizes: "192x192", type: "image/png" },
      { src: "/placeholder-logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
