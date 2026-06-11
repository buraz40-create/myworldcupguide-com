import type { Metadata } from "next"
import Link from "next/link"
import AffordabilityClient from "@/components/AffordabilityClient"
import { alternatesFor } from "@/lib/hreflang"
import { byAffordability, groupTripCost, monthsOfSalary } from "@/data/affordability"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Fan Affordability Index: Months of Salary to Attend",
  description:
    "How many months of an average salary it takes a fan from each of the 48 World Cup nations to follow their team through the group stage. Flights, tickets and hotels ranked from most to least affordable.",
  keywords: [
    "World Cup 2026 affordability",
    "cost to attend World Cup 2026",
    "World Cup 2026 cost by country",
    "how much to go to the World Cup",
    "World Cup ticket cost months salary",
    "World Cup 2026 fan budget",
    "most affordable World Cup nation",
  ],
  alternates: alternatesFor(`${SITE}/tickets/affordability/`),
  openGraph: {
    title: "World Cup 2026 Fan Affordability Index",
    description:
      "Months of average salary to follow your team through the group stage, for all 48 World Cup nations.",
    url: `${SITE}/tickets/affordability/`,
    type: "website",
  },
}

export default function AffordabilityPage() {
  const ranked = byAffordability()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "World Cup 2026 Fan Affordability Index",
    description:
      "World Cup 2026 nations ranked by how many months of average net salary it costs a fan to attend the group stage (flight, three tickets, six hotel nights).",
    numberOfItems: ranked.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: ranked.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.team,
      description: `${monthsOfSalary(r).toFixed(2)} months of average salary (about ${"$" + Math.round(groupTripCost(r)).toLocaleString("en-US")} for the group-stage trip).`,
    })),
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/tickets" className="hover:text-[#231645] transition-colors font-medium">Tickets</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Affordability Index</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-10 max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <span className="pill" style={{ background: "#7E43FF", color: "#fff", border: "none" }}>Fan Affordability Index</span>
            <span className="pill">48 nations ranked</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">
            How many months&apos; pay to follow your team?
          </h1>
          <p className="text-[#615E6E] text-base md:text-lg leading-relaxed">
            For every World Cup 2026 nation, we worked out the cost of following your team through the
            group stage, one return flight, three tickets and six hotel nights, then divided it by the
            country&apos;s average monthly salary. A Swiss fan needs about half a month&apos;s pay. For
            others it is most of a year.
          </p>
        </header>

        <AffordabilityClient />

        {/* Related */}
        <section className="mt-12 pt-8 border-t border-black/[0.06]">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Keep planning</h2>
          <ul className="space-y-2">
            <li><Link href="/tickets" className="text-[#7E43FF] font-semibold hover:underline">Full World Cup 2026 tickets guide →</Link></li>
            <li><Link href="/schedule" className="text-[#7E43FF] font-semibold hover:underline">All 104 matches with dates and venues →</Link></li>
            <li><Link href="/cities" className="text-[#7E43FF] font-semibold hover:underline">Host city travel and hotel guides →</Link></li>
          </ul>
        </section>

      </div>
    </div>
  )
}
