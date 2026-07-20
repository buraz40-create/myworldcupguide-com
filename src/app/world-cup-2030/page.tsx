import type { Metadata } from "next"
import Link from "next/link"
import WC2030Hub from "@/components/WC2030Hub"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "2030 World Cup: Hosts, Dates, Qualifying and the 48 vs 64 Team Debate",
  description:
    "Everything known about the 2030 FIFA World Cup: hosts Spain, Portugal and Morocco plus centenary opening matches in Uruguay, Argentina and Paraguay, the estimated schedule, qualifying timeline, and the proposed expansion to 64 teams. Live countdown and interactive format explainer.",
  keywords: [
    "2030 World Cup", "World Cup 2030", "2030 World Cup hosts", "World Cup 2030 dates",
    "2030 World Cup qualifying", "64 team World Cup", "World Cup 2030 format", "World Cup centenary",
  ],
  alternates: alternatesFor(`${SITE}/world-cup-2030/`),
  openGraph: {
    title: "2030 World Cup: Hosts, Dates, Qualifying and the 48 vs 64 Debate",
    description: "Hosts, estimated schedule, qualifying timeline and the 64-team proposal, with a live countdown.",
    url: `${SITE}/world-cup-2030/`,
    type: "website",
  },
}

export default function WorldCup2030Page() {
  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-6 text-center mb-10">
        <div className="pill inline-flex mb-5">Next up</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">The 2030 World Cup</h1>
        <p className="text-[#615E6E] text-base">
          The 2026 tournament is done, and attention turns to a landmark edition: the 2030 World Cup marks 100 years since the first, and will be staged across three continents. Here is everything known so far, from hosts and dates to the debate over expanding to 64 teams.
        </p>
      </div>

      <WC2030Hub />

      <div className="max-w-3xl mx-auto px-6 mt-12">
        <p className="text-sm text-[#615E6E]">
          Looking back instead? Relive the 2026 tournament in <Link href="/blog/world-cup-2026-wrapped-full-story/" className="text-[#7E43FF] font-semibold underline">the 2026 World Cup, wrapped</Link>, or see <Link href="/blog/world-cup-2026-final-standings/" className="text-[#7E43FF] font-semibold underline">where all 48 teams finished</Link>.
        </p>
      </div>
    </div>
  )
}
