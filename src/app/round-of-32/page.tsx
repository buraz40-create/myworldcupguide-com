import type { Metadata } from "next"
import Link from "next/link"
import RoundOf32Bracket, { type BracketData, type BracketTeam } from "@/components/RoundOf32Bracket"
import { matches } from "@/data/matches"
import results from "@/data/matchResults.json"
import {
  buildBracket, iso2, slug as teamSlug, R16_STRUCTURE, QF_STRUCTURE, SF_STRUCTURE,
  type ScoreMap,
} from "@/lib/predictorEngine"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Round of 32 Bracket - Interactive Knockout Predictor",
  description:
    "The 2026 World Cup Round of 32 is set. See all 16 knockout fixtures with dates and venues, then make your picks through the interactive bracket all the way to the Final.",
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

const metaByNumber = new Map(matches.map((m) => [m.matchNumber, m]))
function roundMeta(matchNumber: number) {
  const m = metaByNumber.get(matchNumber)
  return { date: m?.date ?? "", city: m ? (CITY[m.citySlug] ?? m.citySlug) : "" }
}

function toTeam(q: { team: string; rank: number } | null): BracketTeam | null {
  if (!q) return null
  return { name: q.team, iso2: iso2(q.team), slug: teamSlug(q.team), rank: q.rank }
}

export default function RoundOf32Page() {
  // Build the real bracket from the final group results.
  const scores: ScoreMap = {}
  for (const m of matches) {
    const r = (results as Record<string, { homeScore?: number; awayScore?: number; status?: string }>)[m.id]
    if (r && (r.status === "FT" || r.status === "AET" || r.status === "PEN") && r.homeScore != null && r.awayScore != null) {
      scores[m.id] = { home: r.homeScore, away: r.awayScore }
    }
  }
  const bracket = buildBracket(scores)

  const data: BracketData | null = bracket && {
    r32: bracket.r32.map((bm) => {
      const m = metaByNumber.get(bm.matchNumber)
      return {
        matchNumber: bm.matchNumber,
        date: m?.date ?? "",
        time: m?.time ?? "",
        city: m ? (CITY[m.citySlug] ?? m.citySlug) : "",
        home: toTeam(bm.home),
        away: toTeam(bm.away),
      }
    }),
    structures: {
      r16: R16_STRUCTURE.map(([a, b]) => [a, b]),
      qf: QF_STRUCTURE.map(([a, b]) => [a, b]),
      sf: SF_STRUCTURE.map(([a, b]) => [a, b]),
      final: [0, 1],
    },
    meta: {
      r16: Array.from({ length: 8 }, (_, i) => roundMeta(89 + i)),
      qf: Array.from({ length: 4 }, (_, i) => roundMeta(97 + i)),
      sf: Array.from({ length: 2 }, (_, i) => roundMeta(101 + i)),
      final: roundMeta(104),
    },
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-6 text-center mb-8">
        <div className="pill inline-flex mb-5">Knockout Stage</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">World Cup 2026 Round of 32 Bracket</h1>
        <p className="text-[#615E6E] text-base">
          The group stage is complete and the knockout bracket is set. All 16 Round of 32 fixtures run from June 28 to July 3. Tap a team to send it through and build your bracket all the way to the Final on July 19.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {data ? (
          <RoundOf32Bracket data={data} />
        ) : (
          <p className="text-center text-[#615E6E]">The bracket will appear here once all group games are final.</p>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-3">How the Round of 32 works</h2>
        <p className="text-[#231645] leading-relaxed mb-3">
          The 2026 World Cup is the first with 48 teams, so the knockout stage opens with a Round of 32 instead of a Round of 16. The 12 group winners and 12 runners-up advance automatically, joined by the 8 best third-placed teams across all groups. That is 32 teams, paired by FIFA&apos;s published bracket so that no two teams from the same group can meet again until later rounds.
        </p>
        <p className="text-[#615E6E] leading-relaxed">
          Want to go deeper? Run full match simulations on the <Link href="/predictor/" className="text-[#7E43FF] font-semibold underline">bracket predictor</Link>, check the final <Link href="/groups/" className="text-[#7E43FF] font-semibold underline">group standings</Link>, or see the complete <Link href="/schedule/" className="text-[#7E43FF] font-semibold underline">match schedule</Link>.
        </p>
      </div>
    </div>
  )
}
