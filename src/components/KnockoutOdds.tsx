"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import {
  simulateKnockout, knockoutWinner, mulberry32, iso2, rank, confederation,
  teamRating, expectedGoals, R16_STRUCTURE, QF_STRUCTURE, SF_STRUCTURE,
} from "@/lib/predictorEngine"

export type Tie = { matchNumber: number; date: string; home: string; away: string }

type Stat = {
  name: string; iso2: string; conf: string
  r16: number; qf: number; sf: number; final: number; win: number
  opp: string; advProb: number; xg: number
}
type SortKey = "r16" | "qf" | "sf" | "final" | "win"

const FLAG = (iso: string) => `https://flagcdn.com/w40/${iso}.png`
const fmtDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })
const CONF_COLOR: Record<string, string> = {
  UEFA: "#3b82f6", CONMEBOL: "#10b981", CAF: "#f59e0b", AFC: "#ef4444", CONCACAF: "#7E43FF", OFC: "#06b6d4",
}
const DEFAULT_SEED = 20260711

function play(a: string, b: string, rng: () => number): string {
  return knockoutWinner(a, b, simulateKnockout(a, b, rng)) ?? a
}

function simulate(ties: Tie[], sims: number, seed: number): Stat[] {
  const C: Record<string, { r16: number; qf: number; sf: number; final: number; win: number }> = {}
  const ensure = (t: string) => (C[t] ??= { r16: 0, qf: 0, sf: 0, final: 0, win: 0 })
  ties.forEach((t) => { ensure(t.home); ensure(t.away) })
  const rng = mulberry32(seed)
  for (let s = 0; s < sims; s++) {
    const w32 = ties.map((t) => play(t.home, t.away, rng))
    w32.forEach((w) => C[w].r16++)
    const w16 = R16_STRUCTURE.map(([a, b]) => play(w32[a], w32[b], rng))
    w16.forEach((w) => C[w].qf++)
    const w8 = QF_STRUCTURE.map(([a, b]) => play(w16[a], w16[b], rng))
    w8.forEach((w) => C[w].sf++)
    const w4 = SF_STRUCTURE.map(([a, b]) => play(w8[a], w8[b], rng))
    w4.forEach((w) => C[w].final++)
    C[play(w4[0], w4[1], rng)].win++
  }
  return ties.flatMap((t) => {
    const eg = expectedGoals(teamRating(t.home), teamRating(t.away))
    const mk = (name: string, opp: string, xg: number): Stat => {
      const c = C[name]
      return {
        name, iso2: iso2(name), conf: confederation(name),
        r16: (c.r16 / sims) * 100, qf: (c.qf / sims) * 100, sf: (c.sf / sims) * 100,
        final: (c.final / sims) * 100, win: (c.win / sims) * 100,
        opp, advProb: (c.r16 / sims) * 100, xg,
      }
    }
    return [mk(t.home, t.away, eg.lA), mk(t.away, t.home, eg.lB)]
  })
}

function HeatCell({ v }: { v: number }) {
  const a = Math.min(0.9, (v / 100) * 0.9 + (v > 0 ? 0.05 : 0))
  return (
    <td className="px-1.5 py-1.5 text-center tabular-nums text-[11px] font-bold" style={{ background: `rgba(126,67,255,${a})`, color: v >= 55 ? "#fff" : "#231645" }}>
      {v < 0.5 ? "·" : v.toFixed(v >= 10 ? 0 : 1)}
    </td>
  )
}

const SIM_OPTIONS = [2000, 10000, 50000]

export default function KnockoutOdds({ ties }: { ties: Tie[] }) {
  const [sims, setSims] = useState(10000)
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const [sortKey, setSortKey] = useState<SortKey>("win")
  const [conf, setConf] = useState<string | null>(null)

  const stats = useMemo(() => simulate(ties, sims, seed), [ties, sims, seed])

  const confs = useMemo(() => Array.from(new Set(stats.map((s) => s.conf))).sort(), [stats])
  const filtered = conf ? stats.filter((s) => s.conf === conf) : stats
  const sorted = [...filtered].sort((a, b) => b[sortKey] - a[sortKey] || b.win - a.win)
  const titleTop = [...stats].sort((a, b) => b.win - a.win).slice(0, 12)
  const maxWin = titleTop[0]?.win || 1

  const confAgg: Record<string, number> = {}
  stats.forEach((s) => { confAgg[s.conf] = (confAgg[s.conf] ?? 0) + s.advProb / 100 })
  const confRows = Object.entries(confAgg).sort((a, b) => b[1] - a[1])
  const maxConf = confRows[0]?.[1] || 1

  const tieView = ties.map((t) => {
    const h = stats.find((s) => s.name === t.home)!
    const a = stats.find((s) => s.name === t.away)!
    return { ...t, h, a, homeFav: h.advProb >= a.advProb }
  })
  const byWin = [...stats].sort((a, b) => b.win - a.win)
  const biggestFav = [...stats].sort((a, b) => b.advProb - a.advProb)[0]
  const tightest = [...tieView].sort((x, y) => Math.abs(x.h.advProb - 50) - Math.abs(y.h.advProb - 50))[0]

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th onClick={() => setSortKey(k)} className={`px-1.5 py-2.5 text-center cursor-pointer select-none hover:text-[#7E43FF] ${sortKey === k ? "text-[#7E43FF]" : ""}`}>
      {label}{sortKey === k ? " ▾" : ""}
    </th>
  )

  return (
    <div>
      {/* Controls */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div className="rounded-2xl border border-[#7E43FF]/20 bg-[#faf9fe] p-4 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#231645]">Simulations:</span>
            {SIM_OPTIONS.map((n) => (
              <button key={n} onClick={() => setSims(n)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${sims === n ? "bg-[#7E43FF] text-white" : "bg-white text-[#231645] border border-black/[0.08] hover:bg-[#f1ecff]"}`}>
                {n >= 1000 ? `${n / 1000}k` : n}
              </button>
            ))}
          </div>
          <button onClick={() => setSeed(Math.floor(Math.random() * 1e9))} className="btn-primary text-xs py-1.5 px-4">↻ Re-run</button>
          <span className="text-[11px] text-[#615E6E]">{(sims * 31).toLocaleString()} matches simulated</span>
        </div>
      </div>

      {/* Insight cards */}
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

      {/* Title odds */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Title odds</h2>
        <p className="text-sm text-[#615E6E] mb-5">Probability of winning the World Cup. Hit Re-run to resimulate, or raise the simulation count to tighten the estimates.</p>
        <div className="space-y-2">
          {titleTop.map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <img src={FLAG(t.iso2)} alt="" width={24} height={17} className="rounded-sm flex-shrink-0" />
              <span className="text-sm font-semibold text-[#231645] w-28 truncate">{t.name}</span>
              <div className="flex-1 h-5 rounded-md bg-[#f1ecff] overflow-hidden">
                <div className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-300" style={{ width: `${Math.max(6, (t.win / maxWin) * 100)}%`, background: "linear-gradient(90deg,#4f1ea1,#7E43FF)" }}>
                  <span className="text-[10px] font-bold text-white tabular-nums">{t.win.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Survival heatmap (sortable + filterable) */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">How far does each team go?</h2>
        <p className="text-sm text-[#615E6E] mb-3">Probability (%) of reaching each round. Click a column to sort; filter by confederation below. Darker = more likely.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setConf(null)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${!conf ? "bg-[#231645] text-white" : "bg-[#f5f4fa] text-[#615E6E] hover:bg-[#f1ecff]"}`}>All</button>
          {confs.map((c) => (
            <button key={c} onClick={() => setConf(c)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${conf === c ? "text-white" : "bg-[#f5f4fa] text-[#615E6E] hover:bg-[#f1ecff]"}`} style={conf === c ? { background: CONF_COLOR[c] ?? "#7E43FF" } : undefined}>{c}</button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-black/[0.06]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8f7fd] text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">
                <th className="text-left px-3 py-2.5">Team</th>
                <Th k="r16" label="R16" /><Th k="qf" label="QF" /><Th k="sf" label="SF" /><Th k="final" label="Final" /><Th k="win" label="Win" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
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

      {/* Per-tie with xG */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mb-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Every Round of 32 tie, and why</h2>
        <p className="text-sm text-[#615E6E] mb-5">Each team&apos;s chance of advancing, plus the model&apos;s expected goals (xG). The xG gap is the &quot;why&quot; behind the advance probability.</p>
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
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${s.advProb}%`, background: fav ? "#7E43FF" : "#b9a6e8" }} />
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
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Confederation breakdown</h2>
        <p className="text-sm text-[#615E6E] mb-5">Expected Round of 16 qualifiers per confederation (sum of advance probabilities; totals 16).</p>
        <div className="space-y-2.5">
          {confRows.map(([c, n]) => (
            <div key={c} className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#231645] w-24">{c}</span>
              <div className="flex-1 h-6 rounded-md bg-[#f1ecff] overflow-hidden">
                <div className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-300" style={{ width: `${(n / maxConf) * 100}%`, background: CONF_COLOR[c] ?? "#7E43FF" }}>
                  <span className="text-[11px] font-bold text-white tabular-nums">{n.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
