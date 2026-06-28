import type { Metadata } from "next"
import Link from "next/link"
import { matches } from "@/data/matches"
import ProjectedR16, { type Tie } from "@/components/ProjectedR16"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Projected Round of 16: The 16 Teams Tipped to Advance",
  description:
    "The 16 teams projected to win their Round of 32 ties and reach the 2026 World Cup Round of 16, with each team's advance probability. Flip any pick and the projected Round of 16 bracket updates live.",
  keywords: [
    "World Cup 2026 round of 16", "projected round of 16", "World Cup 2026 round of 16 teams",
    "who will reach round of 16", "World Cup 2026 round of 16 bracket", "round of 16 predictions",
  ],
  alternates: alternatesFor(`${SITE}/round-of-16/`),
  openGraph: {
    title: "World Cup 2026 Projected Round of 16",
    description: "The 16 teams projected to advance, plus the projected Round of 16 matchups.",
    url: `${SITE}/round-of-16/`,
    type: "website",
  },
}

export default function RoundOf16Page() {
  const ties: Tie[] = matches
    .filter((m) => m.round === "Round of 32" && m.homeTeam !== "TBD" && m.awayTeam !== "TBD")
    .sort((a, b) => a.matchNumber - b.matchNumber)
    .map((m) => ({ matchNumber: m.matchNumber, date: m.date, home: m.homeTeam, away: m.awayTeam }))

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-6 text-center mb-10">
        <div className="pill inline-flex mb-5">Projected Round of 16</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">Who Reaches the Round of 16?</h1>
        <p className="text-[#615E6E] text-base">
          The 16 teams our model projects to win their Round of 32 ties and advance. Each pick is the favourite from a Monte Carlo simulation, with its advance probability. Disagree with one? Flip it, and the projected Round of 16 bracket updates instantly.
        </p>
      </div>

      <ProjectedR16 ties={ties} />

      <div className="max-w-3xl mx-auto px-6 mt-12">
        <p className="text-sm text-[#615E6E]">
          These projections are favourites only, so upsets will happen. For each team&apos;s full odds of reaching the quarter-finals, semis and final, the title-odds chart, and the survival heatmap, head to the <Link href="/round-of-32/" className="text-[#7E43FF] font-semibold underline">Round of 32 page</Link>.
        </p>
      </div>
    </div>
  )
}
