import type { Metadata } from "next"
import Link from "next/link"
import { matches } from "@/data/matches"
import {
  simulateKnockout, knockoutWinner, mulberry32, iso2, rank,
} from "@/lib/predictorEngine"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"
const SIMS = 30000 // simulations per match

export const metadata: Metadata = {
  title: "Who Will Reach the Round of 16? World Cup 2026 Probabilities",
  description:
    "Monte Carlo probabilities for every 2026 World Cup Round of 32 tie: each team's chance of reaching the Round of 16, from 30,000 simulations per match. Updated from the real bracket.",
  keywords: [
    "World Cup 2026 round of 16 odds",
    "World Cup 2026 round of 16 predictions",
    "who will reach round of 16",
    "World Cup 2026 probabilities",
    "round of 32 predictions",
    "World Cup 2026 simulation",
  ],
  alternates: alternatesFor(`${SITE}/round-of-16/`),
  openGraph: {
    title: "Who Will Reach the Round of 16? World Cup 2026 Probabilities",
    description: "Each team's chance of advancing from the Round of 32, from 30,000 simulations per match.",
    url: `${SITE}/round-of-16/`,
    type: "website",
  },
}

type Side = { name: string; iso2: string; rank: number; prob: number }
type Tie = { matchNumber: number; date: string; home: Side; away: Side }

// Run the Monte Carlo once at build time. Each R32 tie is a single knockout
// match (reg -> ET -> pens); reaching the Round of 16 means winning it.
function simulate(): Tie[] {
  const r32 = matches
    .filter((m) => m.round === "Round of 32" && m.homeTeam !== "TBD" && m.awayTeam !== "TBD")
    .sort((a, b) => a.matchNumber - b.matchNumber)

  return r32.map((m) => {
    const rng = mulberry32(7919 + m.matchNumber * 31) // fixed seed = reproducible build
    let homeWins = 0
    for (let i = 0; i < SIMS; i++) {
      const s = simulateKnockout(m.homeTeam, m.awayTeam, rng)
      if (knockoutWinner(m.homeTeam, m.awayTeam, s) === m.homeTeam) homeWins++
    }
    const hp = (homeWins / SIMS) * 100
    return {
      matchNumber: m.matchNumber,
      date: m.date,
      home: { name: m.homeTeam, iso2: iso2(m.homeTeam), rank: rank(m.homeTeam), prob: hp },
      away: { name: m.awayTeam, iso2: iso2(m.awayTeam), rank: rank(m.awayTeam), prob: 100 - hp },
    }
  })
}

const FLAG = (iso: string) => `https://flagcdn.com/w40/${iso}.png`
function fmtDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ProbRow({ s, favorite }: { s: Side; favorite: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${favorite ? "bg-[#7E43FF]/8" : ""}`}>
      <img src={FLAG(s.iso2)} alt="" width={22} height={16} className="rounded-sm flex-shrink-0" />
      <span className={`text-sm flex-1 truncate ${favorite ? "font-extrabold text-[#231645]" : "font-medium text-[#615E6E]"}`}>{s.name}</span>
      <div className="w-24 h-2 rounded-full bg-[#f1ecff] overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full" style={{ width: `${s.prob}%`, background: favorite ? "#7E43FF" : "#b9a6e8" }} />
      </div>
      <span className={`text-sm tabular-nums w-12 text-right ${favorite ? "font-extrabold text-[#231645]" : "font-semibold text-[#615E6E]"}`}>{s.prob.toFixed(1)}%</span>
    </div>
  )
}

export default function RoundOf16Page() {
  const ties = simulate()
  // Ranked: every team by advance probability.
  const ranked = ties
    .flatMap((t) => [{ ...t.home, opp: t.away.name }, { ...t.away, opp: t.home.name }])
    .sort((a, b) => b.prob - a.prob)
  // Tightest tie (closest to 50/50).
  const tightest = [...ties].sort((a, b) => Math.abs(a.home.prob - 50) - Math.abs(b.home.prob - 50))[0]

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-6 text-center mb-8">
        <div className="pill inline-flex mb-5">Knockout Probabilities</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">Who Reaches the Round of 16?</h1>
        <p className="text-[#615E6E] text-base">
          Every Round of 32 tie simulated <strong>{SIMS.toLocaleString()} times</strong> ({(SIMS * ties.length).toLocaleString()} match simulations in total). Each team&apos;s number is its probability of winning its tie and reaching the Round of 16, based on FIFA ranking, confederation strength, and a Poisson scoring model with extra time and penalties.
        </p>
      </div>

      {/* Tightest tie callout */}
      {tightest && (
        <div className="max-w-3xl mx-auto px-6 mb-8">
          <div className="rounded-2xl border border-[#7E43FF]/20 bg-[#faf9fe] p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Closest call</p>
            <p className="text-sm font-bold text-[#231645]">
              {tightest.home.name} {tightest.home.prob.toFixed(1)}% vs {tightest.away.prob.toFixed(1)}% {tightest.away.name} — the toughest tie to call in the whole round.
            </p>
          </div>
        </div>
      )}

      {/* Per-tie probabilities */}
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Every Round of 32 tie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ties.map((t) => {
            const homeFav = t.home.prob >= t.away.prob
            return (
              <div key={t.matchNumber} className="rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#615E6E] bg-[#f8f7fd] border-b border-black/[0.05]">
                  Match {t.matchNumber} · {fmtDate(t.date)}
                </div>
                <ProbRow s={t.home} favorite={homeFav} />
                <div className="h-px bg-black/[0.04]" />
                <ProbRow s={t.away} favorite={!homeFav} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Ranked list */}
      <div className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Most likely to advance</h2>
        <p className="text-sm text-[#615E6E] mb-5">All 32 teams ranked by their probability of reaching the Round of 16.</p>
        <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
          {ranked.map((r, i) => (
            <div key={r.name} className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 ? "bg-[#faf9fe]" : "bg-white"} ${i === 15 ? "border-b-2 border-[#7E43FF]/40" : "border-b border-black/[0.04]"}`}>
              <span className="text-xs font-bold text-[#615E6E] w-6 tabular-nums">{i + 1}</span>
              <img src={FLAG(r.iso2)} alt="" width={24} height={17} className="rounded-sm flex-shrink-0" />
              <span className="text-sm font-semibold text-[#231645] flex-1 truncate">{r.name}</span>
              <span className="text-xs text-[#615E6E] hidden sm:block">vs {r.opp}</span>
              <span className="text-sm font-extrabold text-[#231645] tabular-nums w-14 text-right">{r.prob.toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#615E6E] mt-3">Model: rank-based team ratings + confederation adjustment, Poisson goal sampling, extra time and penalty shootouts where tied. Fixed random seed so the figures are stable. Build your own bracket on the <Link href="/round-of-32/" className="text-[#7E43FF] font-semibold underline">Round of 32 page</Link>.</p>
      </div>
    </div>
  )
}
