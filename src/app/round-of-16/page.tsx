import type { Metadata } from "next"
import Link from "next/link"
import { matches } from "@/data/matches"
import KnockoutOdds, { type Tie } from "@/components/KnockoutOdds"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Knockout Odds: Round of 16 to the Final (Interactive)",
  description:
    "Interactive Monte Carlo for the 2026 World Cup knockouts. Re-run the simulation, change the sim count, sort and filter the survival table: each team's odds of reaching the Round of 16, quarter-finals, semis, final and winning the trophy, with title odds, a survival heatmap, per-tie expected goals and a confederation breakdown.",
  keywords: [
    "World Cup 2026 odds", "World Cup 2026 title odds", "World Cup 2026 round of 16 odds",
    "World Cup 2026 predictions", "who will win World Cup 2026", "World Cup 2026 simulation",
    "World Cup 2026 bracket probabilities", "interactive World Cup odds",
  ],
  alternates: alternatesFor(`${SITE}/round-of-16/`),
  openGraph: {
    title: "World Cup 2026 Knockout Odds: Round of 16 to the Final",
    description: "Interactive simulator: title odds, deep-run probabilities, per-tie expected goals.",
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
      <div className="max-w-3xl mx-auto px-6 text-center mb-8">
        <div className="pill inline-flex mb-5">Knockout Probabilities</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">World Cup 2026 Knockout Odds</h1>
        <p className="text-[#615E6E] text-base">
          An interactive simulator for the entire knockout bracket. Re-run it, dial the simulation count up or down, and sort or filter the table. Each number is a team&apos;s odds of reaching that round, from a Poisson scoring model with extra time and penalties.
        </p>
      </div>

      <KnockoutOdds ties={ties} />

      {/* Method */}
      <div className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-3">How the model works</h2>
        <ul className="space-y-2 text-sm text-[#231645]">
          <li className="flex gap-3"><span className="text-[#7E43FF] mt-1">•</span><span><strong>Team strength</strong> comes from FIFA ranking on a smoothed curve, plus a confederation adjustment.</span></li>
          <li className="flex gap-3"><span className="text-[#7E43FF] mt-1">•</span><span><strong>Each match</strong> draws goals from a Poisson distribution around the two sides&apos; expected goals, so an upset is always possible, just less likely.</span></li>
          <li className="flex gap-3"><span className="text-[#7E43FF] mt-1">•</span><span><strong>Ties</strong> go to simulated extra time, then a penalty shootout with a slight edge to the stronger side.</span></li>
          <li className="flex gap-3"><span className="text-[#7E43FF] mt-1">•</span><span><strong>Thousands of full brackets</strong> are simulated in your browser; raise the count for tighter estimates or Re-run for a fresh draw.</span></li>
        </ul>
        <p className="text-sm text-[#615E6E] mt-4">This is a model, not a crystal ball: no injuries, form, or tactics. Build your own bracket on the <Link href="/round-of-32/" className="text-[#7E43FF] font-semibold underline">Round of 32 page</Link> and compare your champion to the model&apos;s.</p>
      </div>
    </div>
  )
}
