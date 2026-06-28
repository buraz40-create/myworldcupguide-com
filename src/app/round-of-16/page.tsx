import type { Metadata } from "next"
import Link from "next/link"
import { matches } from "@/data/matches"
import {
  simulateKnockout, knockoutWinner, mulberry32, iso2, rank, confederation,
  teamRating, expectedGoals, R16_STRUCTURE, QF_STRUCTURE, SF_STRUCTURE,
} from "@/lib/predictorEngine"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"
const SIMS = 20000 // full-tournament simulations

export const metadata: Metadata = {
  title: "World Cup 2026 Knockout Odds: Round of 16 to the Final (Simulated)",
  description:
    "Full-tournament Monte Carlo for the 2026 World Cup knockouts: each team's probability of reaching the Round of 16, quarter-finals, semis, final and lifting the trophy, from 20,000 simulated brackets. Title odds, survival heatmap, per-tie expected goals and confederation breakdown.",
  keywords: [
    "World Cup 2026 odds", "World Cup 2026 title odds", "World Cup 2026 round of 16 odds",
    "World Cup 2026 predictions", "who will win World Cup 2026", "World Cup 2026 simulation",
    "World Cup 2026 bracket probabilities",
  ],
  alternates: alternatesFor(`${SITE}/round-of-16/`),
  openGraph: {
    title: "World Cup 2026 Knockout Odds: Round of 16 to the Final",
    description: "20,000 simulated brackets: title odds, deep-run probabilities, per-tie expected goals.",
    url: `${SITE}/round-of-16/`,
    type: "website",
  },
}

type Stat = {
  name: string; iso2: string; conf: string; rank: number
  r16: number; qf: number; sf: number; final: number; win: number
  opp: string; advProb: number; xg: number; oppXg: number
}

// One knockout match → winner name.
function play(a: string, b: string, rng: () => number): string {
  return knockoutWinner(a, b, simulateKnockout(a, b, rng)) ?? a
}

// Full-tournament Monte Carlo, run once at build with a fixed seed.
function run() {
  const r32 = matches
    .filter((m) => m.round === "Round of 32" && m.homeTeam !== "TBD" && m.awayTeam !== "TBD")
    .sort((a, b) => a.matchNumber - b.matchNumber)
  const ties = r32.map((m) => ({ matchNumber: m.matchNumber, date: m.date, home: m.homeTeam, away: m.awayTeam }))

  const C: Record<string, { r16: number; qf: number; sf: number; final: number; win: number }> = {}
  const ensure = (t: string) => (C[t] ??= { r16: 0, qf: 0, sf: 0, final: 0, win: 0 })
  ties.forEach((t) => { ensure(t.home); ensure(t.away) })

  const rng = mulberry32(20260711)
  for (let s = 0; s < SIMS; s++) {
    const w32 = ties.map((t) => play(t.home, t.away, rng))
    w32.forEach((w) => C[w].r16++)
    const w16 = R16_STRUCTURE.map(([a, b]) => play(w32[a], w32[b], rng))
    w16.forEach((w) => C[w].qf++)
    const w8 = QF_STRUCTURE.map(([a, b]) => play(w16[a], w16[b], rng))
    w8.forEach((w) => C[w].sf++)
    const w4 = SF_STRUCTURE.map(([a, b]) => play(w8[a], w8[b], rng))
    w4.forEach((w) => C[w].final++)
    const champ = play(w4[0], w4[1], rng)
    C[champ].win++
  }

  const stats: Stat[] = ties.flatMap((t) => {
    const eg = expectedGoals(teamRating(t.home), teamRating(t.away))
    const mk = (name: string, opp: string, xg: number, oppXg: number): Stat => {
      const c = C[name]
      return {
        name, iso2: iso2(name), conf: confederation(name), rank: rank(name),
        r16: (c.r16 / SIMS) * 100, qf: (c.qf / SIMS) * 100, sf: (c.sf / SIMS) * 100,
        final: (c.final / SIMS) * 100, win: (c.win / SIMS) * 100,
        opp, advProb: (c.r16 / SIMS) * 100, xg, oppXg,
      }
    }
    return [mk(t.home, t.away, eg.lA, eg.lB), mk(t.away, t.home, eg.lB, eg.lA)]
  })

  return { ties, stats }
}

const FLAG = (iso: string) => `https://flagcdn.com/w40/${iso}.png`
const fmtDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })

const CONF_COLOR: Record<string, string> = {
  UEFA: "#3b82f6", CONMEBOL: "#10b981", CAF: "#f59e0b", AFC: "#ef4444", CONCACAF: "#7E43FF", OFC: "#06b6d4",
}

// Heatmap cell: deeper purple = higher probability.
function HeatCell({ v }: { v: number }) {
  const a = Math.min(0.9, (v / 100) * 0.9 + (v > 0 ? 0.05 : 0))
  const dark = v >= 55
  return (
    <td className="px-1.5 py-1.5 text-center tabular-nums text-[11px] font-bold" style={{ background: `rgba(126,67,255,${a})`, color: dark ? "#fff" : "#231645" }}>
      {v < 0.5 ? "·" : v.toFixed(v >= 10 ? 0 : 1)}
    </td>
  )
}

export default function RoundOf16Page() {
  const { ties, stats } = run()
  const byWin = [...stats].sort((a, b) => b.win - a.win || b.final - a.final)
  const byR16 = [...stats].sort((a, b) => b.r16 - a.r16)
  const titleTop = byWin.slice(0, 12)
  const maxWin = titleTop[0].win

  // Confederation: expected number of R16 qualifiers (sum of advance probs).
  const confAgg: Record<string, number> = {}
  stats.forEach((s) => { confAgg[s.conf] = (confAgg[s.conf] ?? 0) + s.advProb / 100 })
  const confRows = Object.entries(confAgg).sort((a, b) => b[1] - a[1])
  const maxConf = confRows[0][1]

  const tieView = ties.map((t) => {
    const h = stats.find((s) => s.name === t.home)!
    const a = stats.find((s) => s.name === t.away)!
    return { ...t, h, a, homeFav: h.advProb >= a.advProb }
  })
  const tightest = [...tieView].sort((x, y) => Math.abs(x.h.advProb - 50) - Math.abs(y.h.advProb - 50))[0]
  const biggestFav = [...stats].sort((a, b) => b.advProb - a.advProb)[0]

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-6 text-center mb-8">
        <div className="pill inline-flex mb-5">Knockout Probabilities</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">World Cup 2026 Knockout Odds</h1>
        <p className="text-[#615E6E] text-base">
          We simulated the entire knockout bracket <strong>{SIMS.toLocaleString()} times</strong> ({(SIMS * 31).toLocaleString()} match simulations) to estimate every team&apos;s odds of reaching each round and lifting the trophy. The model uses FIFA ranking, a confederation strength adjustment, and Poisson goal-scoring with extra time and penalties.
        </p>
      </div>

      {/* Quick insight cards */}
      <div className="max-w-5xl mx-auto px-6 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-black/[0.06] bg-[#faf9fe] p-4 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Title favourite</p>
          <div className="flex items-center justify-center gap-2"><img src={FLAG(byWin[0].iso2)} alt="" width={26} height={19} className="rounded-sm" /><span className="text-lg font-extrabold text-[#231645]">{byWin[0].name}</span></div>
          <p className="text-sm font-bold text-[#7E43FF] mt-0.5">{byWin[0].win.toFixed(1)}% to win it all</p>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-[#faf9fe] p-4 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Safest in R32</p>
          <div className="flex items-center justify-center gap-2"><img src={FLAG(biggestFav.iso2)} alt="" width={26} height={19} className="rounded-sm" /><span className="text-lg font-extrabold text-[#231645]">{biggestFav.name}</span></div>
          <p className="text-sm font-bold text-[#7E43FF] mt-0.5">{biggestFav.advProb.toFixed(1)}% to reach R16</p>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-[#faf9fe] p-4 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Closest tie</p>
          <p className="text-sm font-extrabold text-[#231645] mt-1">{tightest.h.name} v {tightest.a.name}</p>
          <p className="text-sm font-bold text-[#7E43FF] mt-0.5">{tightest.h.advProb.toFixed(1)}% / {tightest.a.advProb.toFixed(1)}%</p>
        </div>
      </div>

      {/* Title odds chart */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Title odds</h2>
        <p className="text-sm text-[#615E6E] mb-5">Probability of winning the 2026 World Cup. The bracket draw matters as much as raw strength here: a team on the lighter side of the bracket can out-rank its title odds.</p>
        <div className="space-y-2">
          {titleTop.map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <img src={FLAG(t.iso2)} alt="" width={24} height={17} className="rounded-sm flex-shrink-0" />
              <span className="text-sm font-semibold text-[#231645] w-28 truncate">{t.name}</span>
              <div className="flex-1 h-5 rounded-md bg-[#f1ecff] overflow-hidden">
                <div className="h-full rounded-md flex items-center justify-end pr-2" style={{ width: `${Math.max(6, (t.win / maxWin) * 100)}%`, background: "linear-gradient(90deg,#4f1ea1,#7E43FF)" }}>
                  <span className="text-[10px] font-bold text-white tabular-nums">{t.win.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Survival heatmap */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">How far does each team go?</h2>
        <p className="text-sm text-[#615E6E] mb-5">Probability (%) of reaching each round. Darker cells are more likely. Read across to see a team&apos;s survival curve collapse as the competition stiffens.</p>
        <div className="overflow-x-auto rounded-2xl border border-black/[0.06]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8f7fd] text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">
                <th className="text-left px-3 py-2.5">Team</th>
                <th className="px-1.5 py-2.5 text-center">R16</th>
                <th className="px-1.5 py-2.5 text-center">QF</th>
                <th className="px-1.5 py-2.5 text-center">SF</th>
                <th className="px-1.5 py-2.5 text-center">Final</th>
                <th className="px-1.5 py-2.5 text-center">Win</th>
              </tr>
            </thead>
            <tbody>
              {byWin.map((s) => (
                <tr key={s.name} className="border-t border-black/[0.04]">
                  <td className="px-3 py-1.5 font-semibold text-[#231645] whitespace-nowrap flex items-center gap-2">
                    <img src={FLAG(s.iso2)} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
                    <span className="truncate max-w-[140px]">{s.name}</span>
                  </td>
                  <HeatCell v={s.r16} /><HeatCell v={s.qf} /><HeatCell v={s.sf} /><HeatCell v={s.final} /><HeatCell v={s.win} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-tie with expected goals */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mb-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Every Round of 32 tie, and why</h2>
        <p className="text-sm text-[#615E6E] mb-5">Each team&apos;s chance of advancing, plus the model&apos;s expected goals (xG) per side. The xG gap is the &quot;why&quot;: it is what drives the advance probability before extra time and penalties are factored in.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tieView.map((t) => (
            <div key={t.matchNumber} className="rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#615E6E] bg-[#f8f7fd] border-b border-black/[0.05] flex justify-between">
                <span>Match {t.matchNumber} · {fmtDate(t.date)}</span>
                <span>xG {t.h.xg.toFixed(1)} – {t.a.xg.toFixed(1)}</span>
              </div>
              {[t.h, t.a].map((s, idx) => {
                const fav = idx === 0 ? t.homeFav : !t.homeFav
                return (
                  <div key={s.name} className={`flex items-center gap-2 px-3 py-2 ${fav ? "bg-[#7E43FF]/8" : ""}`}>
                    <img src={FLAG(s.iso2)} alt="" width={22} height={16} className="rounded-sm flex-shrink-0" />
                    <span className={`text-sm flex-1 truncate ${fav ? "font-extrabold text-[#231645]" : "font-medium text-[#615E6E]"}`}>{s.name}</span>
                    <div className="w-20 h-2 rounded-full bg-[#f1ecff] overflow-hidden flex-shrink-0">
                      <div className="h-full rounded-full" style={{ width: `${s.advProb}%`, background: fav ? "#7E43FF" : "#b9a6e8" }} />
                    </div>
                    <span className={`text-sm tabular-nums w-12 text-right ${fav ? "font-extrabold text-[#231645]" : "font-semibold text-[#615E6E]"}`}>{s.advProb.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Confederation breakdown */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Confederation breakdown</h2>
        <p className="text-sm text-[#615E6E] mb-5">Expected number of Round of 16 qualifiers per confederation (the sum of advance probabilities). UEFA and CONMEBOL sides dominate the deep rounds; CONCACAF&apos;s total is propped up by the three hosts.</p>
        <div className="space-y-2.5">
          {confRows.map(([conf, n]) => (
            <div key={conf} className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#231645] w-24">{conf}</span>
              <div className="flex-1 h-6 rounded-md bg-[#f1ecff] overflow-hidden">
                <div className="h-full rounded-md flex items-center justify-end pr-2" style={{ width: `${(n / maxConf) * 100}%`, background: CONF_COLOR[conf] ?? "#7E43FF" }}>
                  <span className="text-[11px] font-bold text-white tabular-nums">{n.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#615E6E] mt-3">Values sum to 16 (the number of Round of 16 places).</p>
      </div>

      {/* Method */}
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-3">How the model works</h2>
        <ul className="space-y-2 text-sm text-[#231645]">
          <li className="flex gap-3"><span className="text-[#7E43FF] mt-1">•</span><span><strong>Team strength</strong> comes from FIFA ranking on a smoothed curve, plus a confederation adjustment that nudges historically strong-or-weak regions.</span></li>
          <li className="flex gap-3"><span className="text-[#7E43FF] mt-1">•</span><span><strong>Each match</strong> draws goals from a Poisson distribution around the two sides&apos; expected goals, so an upset is always possible, just less likely.</span></li>
          <li className="flex gap-3"><span className="text-[#7E43FF] mt-1">•</span><span><strong>Ties</strong> go to simulated extra time, then a penalty shootout with a slight edge to the stronger side.</span></li>
          <li className="flex gap-3"><span className="text-[#7E43FF] mt-1">•</span><span><strong>{SIMS.toLocaleString()} full brackets</strong> are simulated with a fixed random seed, so these numbers are stable and reproducible rather than a single guess.</span></li>
        </ul>
        <p className="text-sm text-[#615E6E] mt-4">This is a model, not a crystal ball: it has no injuries, form, or tactics. Build your own bracket on the <Link href="/round-of-32/" className="text-[#7E43FF] font-semibold underline">Round of 32 page</Link> and compare your champion to the model&apos;s.</p>
      </div>
    </div>
  )
}
