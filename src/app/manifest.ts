import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My World Cup Guide - 2026 FIFA World Cup",
    short_name: "WC 2026 Guide",
    description: "Your complete 2026 FIFA World Cup guide: cities, stadiums, schedule, and tickets across the USA, Canada, and Mexico.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#231645",
    orientation: "portrait",
    categories: ["sports", "travel", "guides"],
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
