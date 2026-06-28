import type { Metadata } from "next"
import Link from "next/link"
import RoundOf32Bracket, { type BracketData, type BracketTeam } from "@/components/RoundOf32Bracket"
import KnockoutOdds, { type Tie } from "@/components/KnockoutOdds"
import { matches } from "@/data/matches"
import { iso2, slug as teamSlug, rank, R16_STRUCTURE, QF_STRUCTURE, SF_STRUCTURE } from "@/lib/predictorEngine"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Round of 32 Bracket - Interactive Knockout Predictor",
  description:
    "The 2026 World Cup Round of 32 is set. See all 16 knockout fixtures with dates and venues, then click through the interactive bracket to pick every winner up to the Final.",
  keywords: [
    "World Cup 2026 round of 32",
    "World Cup 2026 bracket",
    "World Cup knockout bracket",
    "World Cup 2026 knockout stage",
    "round of 32 fixtures",
    "interactive World Cup bracket",
    "World Cup 2026 predictor",
  ],
  alternates: alternatesFor(`${SITE}/round-of-32/`),
  openGraph: {
    title: "World Cup 2026 Round of 32 Bracket - Interactive Predictor",
    description: "All 16 Round of 32 fixtures plus an interactive bracket to the Final.",
    url: `${SITE}/round-of-32/`,
    type: "website",
  },
}

const CITY: Record<string, string> = {
  "los-angeles": "Los Angeles", "houston": "Houston", "boston": "Boston",
  "monterrey": "Monterrey", "dallas": "Dallas", "new-york-new-jersey": "New York",
  "mexico-city": "Mexico City", "atlanta": "Atlanta", "san-francisco-bay-area": "SF Bay Area",
  "toronto": "Toronto", "vancouver": "Vancouver", "miami": "Miami",
  "kansas-city": "Kansas City", "seattle": "Seattle", "philadelphia": "Philadelphia",
  "guadalajara": "Guadalajara",
}

const byNumber = new Map(matches.map((m) => [m.matchNumber, m]))
function meta(matchNumber: number) {
  const m = byNumber.get(matchNumber)
  return { date: m?.date ?? "", time: m?.time ?? "", city: m ? (CITY[m.citySlug] ?? m.citySlug) : "" }
}
function team(name: string): BracketTeam | null {
  if (!name || name === "TBD") return null
  return { name, iso2: iso2(name), slug: teamSlug(name), rank: rank(name) }
}

export default function RoundOf32Page() {
  // Seed the bracket directly from the authoritative Round of 32 fixtures.
  const r32Matches = matches
    .filter((m) => m.round === "Round of 32")
    .sort((a, b) => a.matchNumber - b.matchNumber)

  const oddsTies: Tie[] = r32Matches
    .filter((m) => m.homeTeam !== "TBD" && m.awayTeam !== "TBD")
    .map((m) => ({ matchNumber: m.matchNumber, date: m.date, home: m.homeTeam, away: m.awayTeam }))

  const data: BracketData = {
    r32: r32Matches.map((m) => ({
      matchNumber: m.matchNumber,
      date: m.date,
      time: m.time,
      city: CITY[m.citySlug] ?? m.citySlug,
      home: team(m.homeTeam),
      away: team(m.awayTeam),
    })),
    structures: {
      r16: R16_STRUCTURE.map(([a, b]) => [a, b]),
      qf: QF_STRUCTURE.map(([a, b]) => [a, b]),
      sf: SF_STRUCTURE.map(([a, b]) => [a, b]),
      final: [0, 1],
    },
    meta: {
      r16: Array.from({ length: 8 }, (_, i) => meta(89 + i)),
      qf: Array.from({ length: 4 }, (_, i) => meta(97 + i)),
      sf: Array.from({ length: 2 }, (_, i) => meta(101 + i)),
      final: meta(104),
    },
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-6 text-center mb-8">
        <div className="pill inline-flex mb-5">Knockout Stage</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">World Cup 2026 Round of 32 Bracket</h1>
        <p className="text-[#615E6E] text-base">
          The group stage is complete and the knockout bracket is set. All 16 Round of 32 fixtures run from June 28 to July 3. Click a team in any matchup to pick the winner and build your bracket all the way to the Final on July 19.
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <RoundOf32Bracket data={data} />
      </div>

      {/* Knockout odds simulator */}
      <div className="max-w-3xl mx-auto px-6 text-center mt-16 mb-2">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-2">Knockout odds</h2>
        <p className="text-[#615E6E] text-base">
          Not sure who to pick? We simulated the whole bracket thousands of times. Re-run it, change the simulation count, and sort or filter the table to see every team&apos;s odds of reaching each round and winning it all.
        </p>
      </div>
      <KnockoutOdds ties={oddsTies} />

      <div className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-3">How the Round of 32 works</h2>
        <p className="text-[#231645] leading-relaxed mb-3">
          The 2026 World Cup is the first with 48 teams, so the knockout stage opens with a Round of 32 instead of a Round of 16. The 12 group winners and 12 runners-up advance automatically, joined by the 8 best third-placed teams across all groups. That is 32 teams, paired by FIFA&apos;s published bracket so no two teams from the same group can meet again until later rounds.
        </p>
        <p className="text-[#615E6E] leading-relaxed">
          Want to go deeper? Run full match simulations on the <Link href="/predictor/" className="text-[#7E43FF] font-semibold underline">bracket predictor</Link>, check the final <Link href="/groups/" className="text-[#7E43FF] font-semibold underline">group standings</Link>, or see the complete <Link href="/schedule/" className="text-[#7E43FF] font-semibold underline">match schedule</Link>.
        </p>
      </div>
    </div>
  )
}
