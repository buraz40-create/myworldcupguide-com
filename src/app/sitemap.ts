import type { MetadataRoute } from "next"
import { cities } from "@/data/cities"
import { groups } from "@/data/groups"

export const dynamic = "force-static"
import { stadiums } from "@/data/stadiums"
import { teams } from "@/data/teams"
import { matches, slugForMatch } from "@/data/matches"
import { blogPosts } from "@/data/blogPosts"

const SITE = "https://myworldcupguide.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes = ["", "/cities", "/stadiums", "/stadiums/compare", "/schedule", "/schedule/friendlies", "/predictor", "/round-of-32", "/round-of-16", "/world-cup-2030", "/tickets", "/tickets/affordability", "/kits", "/how-to-watch", "/faq", "/blog", "/groups", "/globe", "/about", "/contact", "/privacy", "/terms", "/affiliate-disclosure"].map(
    (path) => ({
      url: `${SITE}${path || "/"}`,
      lastModified,
      changeFrequency: path === "/privacy" || path === "/terms" ? "yearly" as const : "weekly" as const,
      priority: path === "" ? 1.0 : path === "/tickets" || path === "/predictor" ? 0.9 : path === "/faq" || path === "/blog" ? 0.85 : path === "/about" || path === "/contact" ? 0.5 : path === "/privacy" || path === "/terms" ? 0.3 : 0.8,
    })
  )

  const blogRoutes = blogPosts.map((p) => ({
    url: `${SITE}/blog/${p.slug}/`,
    lastModified: new Date(p.updated ?? p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const cityRoutes = cities.map((c) => ({
    url: `${SITE}/cities/${c.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const stadiumRoutes = stadiums.map((s) => ({
    url: `${SITE}/stadiums/${s.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const teamRoutes = teams.map((t) => ({
    url: `${SITE}/teams/${t.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const groupHubRoutes = groups.map((g) => ({
    url: `${SITE}/groups/${g.letter.toLowerCase()}/`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }))

  const teamFanGuideRoutes = teams.map((t) => ({
    url: `${SITE}/teams/${t.slug}/fan-guide/`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }))

  const matchRoutes = matches.map((m) => ({
    url: `${SITE}/matches/${slugForMatch(m)}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  // One indexable page per unique match day . high-volume daily search target
  // ("what World Cup matches are on June 22 2026" etc).
  const matchDays = [...new Set(matches.map((m) => m.date))]
  const matchDayRoutes = matchDays.map((d) => ({
    url: `${SITE}/schedule/${d}/`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }))

  return [...staticRoutes, ...cityRoutes, ...stadiumRoutes, ...teamRoutes, ...teamFanGuideRoutes, ...groupHubRoutes, ...matchRoutes, ...matchDayRoutes, ...blogRoutes]
}
