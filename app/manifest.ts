import type { MetadataRoute } from "next";
import {
  SITE_NAME_FIRST,
  SITE_NAME_SECOND,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { SITE_OG_IMAGE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME ? SITE_NAME : `${SITE_NAME_FIRST} ${SITE_NAME_SECOND}`,
    short_name: SITE_NAME
      ? SITE_NAME
      : `${SITE_NAME_FIRST} ${SITE_NAME_SECOND}`,
    description: `${
      SITE_NAME ? SITE_NAME : `${SITE_NAME_FIRST} ${SITE_NAME_SECOND}`
    } — Authentic spices, pickles, and snacks. Heat you can taste.`,
    start_url: SITE_URL,
    scope: SITE_URL,
    id: SITE_URL,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ef4444",
    icons: [
      { src: SITE_OG_IMAGE, sizes: "192x192", type: "image/png" },
      { src: SITE_OG_IMAGE, sizes: "512x512", type: "image/png" },
    ],
  };
}
