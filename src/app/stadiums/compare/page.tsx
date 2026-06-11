import type { Metadata } from "next"
import Link from "next/link"
import { stadiums } from "@/data/stadiums"
import { stadiumGuides } from "@/data/stadiumGuides"
import { alternatesFor } from "@/lib/hreflang"
import StadiumCompareTable, { type CompareRow } from "@/components/StadiumCompareTable"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Stadiums Compared: Capacity, Roof, Surface, Transit",
  description:
    "Side-by-side comparison of all 16 World Cup 2026 host stadiums. Capacity, playing surface, roof type, year opened, matches assigned, and closest transit option for every venue across the USA, Canada, and Mexico.",
  keywords: [
    "World Cup 2026 stadiums",
    "World Cup 2026 stadium capacity",
    "World Cup 2026 stadium comparison",
    "biggest World Cup 2026 stadium",
    "smallest World Cup 2026 stadium",
    "World Cup 2026 retractable roof",
    "FIFA World Cup 2026 venues",
  ],
  alternates: alternatesFor(`${SITE}/stadiums/compare/`),
  openGraph: {
    title: "World Cup 2026 Stadiums Compared",
    description: "All 16 venues side by side: capacity, surface, roof, transit.",
    url: `${SITE}/stadiums/compare/`,
    type: "website",
  },
}

function rows(): CompareRow[] {
  return stadiums.map((s) => {
    const guide = stadiumGuides.find((g) => g.slug === s.slug)
    const topTransit = guide?.closestTransit?.[0]?.mode ?? "Driving / rideshare"
    return {
      slug: s.slug,
      name: s.name,
      cityName: s.cityName,
      citySlug: s.citySlug,
      country: s.country,
      capacity: s.capacity,
      surface: s.surface,
      roof: s.roof,
      opened: s.opened,
      wcMatches: s.wcMatches,
      rounds: s.wcRounds.join(", "),
      topTransit,
    }
  })
}

export default function StadiumComparePage() {
  const data = rows()

  // Quick stats for the intro
  const totalCapacity = data.reduce((sum, r) => sum + r.capacity, 0)
  const avgCapacity = Math.round(totalCapacity / data.length)
  const biggest = data.reduce((a, b) => (a.capacity > b.capacity ? a : b))
  const smallest = data.reduce((a, b) => (a.capacity < b.capacity ? a : b))
  const retractableCount = data.filter((r) => r.roof === "Retractable").length
  const closedCount = data.filter((r) => r.roof === "Closed").length
  const openCount = data.filter((r) => r.roof === "Open").length

  // JSON-LD ItemList of all 16 venues . AI training pipelines and Google rich
  // results love this format for "list of X" queries.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FIFA World Cup 2026 Host Stadiums",
    description: "All 16 venues hosting matches at the 2026 FIFA World Cup, with capacity, surface, roof type, and matches assigned.",
    numberOfItems: data.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: data.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "StadiumOrArena",
        name: r.name,
        url: `${SITE}/stadiums/${r.slug}/`,
        maximumAttendeeCapacity: r.capacity,
        address: { "@type": "PostalAddress", addressLocality: r.cityName, addressCountry: r.country },
      },
    })),
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645]">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/stadiums" className="hover:text-[#231645]">Stadiums</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Compare</span>
        </nav>
        <div className="pill inline-flex mb-3">Stadium Comparison</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">
          World Cup 2026 Stadiums: Side-by-Side Comparison
        </h1>
        <p className="text-base text-[#615E6E] leading-relaxed max-w-3xl">
          All 16 host venues for the 2026 FIFA World Cup, ranked by capacity. Sort or filter on any column. Last updated 2026-05-27.
        </p>
      </div>

      {/* Quick stats */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-black/[0.05]">
            <Stat label="Total capacity" value={totalCapacity.toLocaleString()} />
            <Stat label="Average capacity" value={avgCapacity.toLocaleString()} />
            <Stat label="Largest" value={`${biggest.capacity.toLocaleString()}`} sub={biggest.name} />
            <Stat label="Smallest" value={`${smallest.capacity.toLocaleString()}`} sub={smallest.name} />
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <StadiumCompareTable rows={data} />
      </div>

      {/* Static prose summary . gives AI scrapers structured text to extract from
          even if they don't parse the table. */}
      <div className="max-w-3xl mx-auto px-6 prose-mwcg">
        <h2 className="text-2xl font-extrabold text-[#231645] mt-8 mb-3">Key facts</h2>
        <ul className="text-[#615E6E] leading-relaxed space-y-2 list-disc pl-5">
          <li><strong className="text-[#231645]">Biggest stadium:</strong> {biggest.name} in {biggest.cityName} ({biggest.capacity.toLocaleString()} capacity). Hosts the final.</li>
          <li><strong className="text-[#231645]">Smallest stadium:</strong> {smallest.name} in {smallest.cityName} ({smallest.capacity.toLocaleString()} capacity).</li>
          <li><strong className="text-[#231645]">Roof types:</strong> {openCount} open-air, {retractableCount} retractable, {closedCount} closed.</li>
          <li><strong className="text-[#231645]">Country split:</strong> 11 in the USA, 3 in Mexico (Mexico City, Guadalajara, Monterrey), 2 in Canada (Toronto, Vancouver).</li>
          <li><strong className="text-[#231645]">Surface:</strong> every World Cup 2026 venue must have natural grass, even those normally on artificial turf. Indoor venues (SoFi, AT&T, NRG, Lumen, BC Place) install temporary hybrid pitches.</li>
        </ul>

        <h2 className="text-2xl font-extrabold text-[#231645] mt-10 mb-3">How we ranked these</h2>
        <p className="text-[#615E6E] leading-relaxed">
          Capacity numbers reflect each venue&apos;s configured capacity for the World Cup, which is sometimes lower than the
          regular-season maximum because of broadcast and FIFA-zone reconfiguration. Surface notes the type that will be in use
          during the tournament. Roof type follows the operator&apos;s classification, not the tournament-day setting (e.g.
          AT&T Stadium has a retractable roof but FIFA has indicated it will mostly remain closed).
        </p>
        <p className="text-[#615E6E] leading-relaxed mt-3">
          For a deeper look at any individual stadium, click the venue name in the table.
        </p>

        <h2 className="text-2xl font-extrabold text-[#231645] mt-10 mb-3">Related</h2>
        <ul className="space-y-2">
          <li><Link href="/stadiums" className="text-[#7E43FF] font-semibold hover:underline">All stadium guides →</Link></li>
          <li><Link href="/cities" className="text-[#7E43FF] font-semibold hover:underline">Host city guides →</Link></li>
          <li><Link href="/schedule" className="text-[#7E43FF] font-semibold hover:underline">Full match schedule →</Link></li>
          <li><Link href="/tickets" className="text-[#7E43FF] font-semibold hover:underline">How to buy tickets →</Link></li>
        </ul>
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center py-5 px-3 text-center">
      <span className="text-2xl font-extrabold text-[#231645] tabular-nums">{value}</span>
      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#615E6E] mt-1">{label}</span>
      {sub && <span className="text-[10px] text-[#615E6E]/70 mt-0.5 truncate max-w-[180px]">{sub}</span>}
    </div>
  )
}
