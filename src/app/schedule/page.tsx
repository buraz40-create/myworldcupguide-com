import type { Metadata } from "next"
import Link from "next/link"
import ScheduleClient from "@/components/ScheduleClient"
import { matches, slugForMatch } from "@/data/matches"
import { quickAnswersJsonLd, type QA } from "@/components/QuickAnswers"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

const SCHEDULE_QA: QA[] = [
  { question: "When does the 2026 World Cup start and end?", answer: "The 2026 FIFA World Cup runs from June 11 to July 19, 2026 - 39 days. The Opening Match is June 11 at Estadio Azteca (Mexico City) and the Final is July 19 at MetLife Stadium (New York / New Jersey)." },
  { question: "How many matches are at the 2026 World Cup?", answer: "104 matches in total - up from 64 at the 2022 World Cup. 72 group-stage matches, 16 in the new Round of 32, 8 Round of 16, 4 Quarterfinals, 2 Semi-finals, the 3rd Place playoff, and the Final." },
  { question: "When are the World Cup 2026 knockout rounds?", answer: "Round of 32: June 28-July 3. Round of 16: July 4-7. Quarterfinals: July 9-11. Semi-finals: July 14-15. 3rd Place playoff: July 18 (Hard Rock Stadium, Miami). Final: July 19 (MetLife Stadium, NY/NJ)." },
  { question: "When does the 2026 World Cup group stage end?", answer: "The group stage runs June 11-27, 2026. Top two teams from each of the 12 groups plus the 8 best third-placed teams advance to the new Round of 32." },
]

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule - All 104 Games & Fixtures",
  description:
    "Complete World Cup 2026 schedule. Every fixture from June 11 to July 19, 2026 - dates, kickoff times, group stage games, knockout brackets, and venues across the USA, Canada and Mexico.",
  keywords: [
    "World Cup 2026 schedule",
    "FIFA World Cup 2026 schedule",
    "2026 World Cup schedule",
    "World Cup schedule",
    "World Cup fixtures",
    "World Cup games",
    "FIFA World Cup games",
    "World Cup 2026 fixtures",
  ],
  alternates: alternatesFor(`${SITE}/schedule`),
  openGraph: {
    title: "World Cup 2026 Schedule - All 104 Games & Fixtures",
    description:
      "Every World Cup 2026 fixture - dates, kickoff times, groups, knockout brackets, and venues across USA, Canada and Mexico.",
    url: `${SITE}/schedule`,
    type: "website",
  },
}

const scheduleJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "FIFA World Cup 2026 Match Schedule",
  description: "All 104 matches of the 2026 FIFA World Cup, June 11 - July 19, 2026.",
  numberOfItems: matches.length,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  itemListElement: matches.map((m, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE}/matches/${slugForMatch(m)}`,
    name:
      m.homeTeam === "TBD" || m.awayTeam === "TBD"
        ? `${m.round} - Match ${m.matchNumber}`
        : `${m.homeTeam} vs ${m.awayTeam}`,
  })),
}

export default function SchedulePage() {
  const faqJsonLd = quickAnswersJsonLd(SCHEDULE_QA)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(scheduleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <ScheduleClient quickAnswers={SCHEDULE_QA} />
      {/* Server-rendered match-day links so Google's crawler discovers every day page. */}
      <nav aria-label="Match-day pages" className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-extrabold text-[#231645] mb-3">Browse match days</h2>
        <p className="text-sm text-[#615E6E] mb-4">31 indexed pages, one per match day. Tap any date for that day&apos;s fixtures, kickoff times, broadcasters and live odds.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {[...new Set(matches.map((m) => m.date))].sort().map((d) => {
            const dayMatches = matches.filter((m) => m.date === d).length
            return (
              <Link key={d} href={`/schedule/${d}/`} className="card p-3 hover:-translate-y-0.5 transition-transform">
                <p className="text-xs font-extrabold text-[#7E43FF] uppercase tracking-widest">
                  {new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <p className="text-[11px] text-[#615E6E]">{dayMatches} match{dayMatches === 1 ? "" : "es"}</p>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
