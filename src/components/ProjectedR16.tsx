"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import { simulateKnockout, knockoutWinner, mulberry32, iso2, R16_STRUCTURE } from "@/lib/predictorEngine"

export type Tie = { matchNumber: number; date: string; home: string; away: string }

const FLAG = (iso: string) => `https://flagcdn.com/w40/${iso}.png`
const SIMS = 8000

// Per-tie probability that the home team advances (quick Monte Carlo).
function advanceProbs(ties: Tie[]): number[] {
  return ties.map((t) => {
    const rng = mulberry32(4242 + t.matchNumber * 17)
    let h = 0
    for (let i = 0; i < SIMS; i++) if (knockoutWinner(t.home, t.away, simulateKnockout(t.home, t.away, rng)) === t.home) h++
    return (h / SIMS) * 100
  })
}

export default function ProjectedR16({ ties }: { ties: Tie[] }) {
  const probs = useMemo(() => advanceProbs(ties), [ties])
  // Default projected winner = favourite per tie. User can override (flip).
  const [overrides, setOverrides] = useState<Record<number, string>>({})

  const winnerOf = (i: number): { name: string; prob: number } => {
    const t = ties[i]
    const hp = probs[i]
    const fav = hp >= 50 ? t.home : t.away
    const picked = overrides[i] ?? fav
    return { name: picked, prob: picked === t.home ? hp : 100 - hp }
  }
  const flip = (i: number, name: string) => setOverrides((o) => ({ ...o, [i]: name }))
  const resetProjection = () => setOverrides({})

  const projected = ties.map((_, i) => winnerOf(i))
  const overriddenCount = Object.keys(overrides).filter((k) => {
    const i = Number(k); const t = ties[i]; const fav = probs[i] >= 50 ? t.home : t.away
    return overrides[i] !== fav
  }).length

  // Projected Round of 16 matchups from the projected winners.
  const r16 = R16_STRUCTURE.map(([a, b], i) => ({
    matchNumber: 89 + i,
    home: projected[a].name,
    away: projected[b].name,
  }))

  return (
    <div>
      {/* Projected qualifiers grid */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mb-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-extrabold text-[#231645]">The 16 projected qualifiers</h2>
          {overriddenCount > 0 && (
            <button onClick={resetProjection} className="text-xs font-semibold text-[#615E6E] hover:text-[#231645] underline">Reset to model ({overriddenCount} changed)</button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {projected.map((p, i) => (
            <div key={i} className="rounded-xl border border-[#7E43FF]/15 bg-[#faf9fe] px-3 py-2.5 flex items-center gap-2">
              <img src={FLAG(iso2(p.name))} alt="" width={26} height={19} className="rounded-sm flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#231645] truncate leading-tight">{p.name}</p>
                <p className="text-[10px] text-[#615E6E]">{p.prob.toFixed(0)}% to advance</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive R32 picks */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mb-12">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Round of 32: who we project to win</h2>
        <p className="text-sm text-[#615E6E] mb-5">The model&apos;s favourite is highlighted in each tie. Disagree? Click the other team to send them through instead, and the projected Round of 16 below updates.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ties.map((t, i) => {
            const w = winnerOf(i).name
            const rows = [{ name: t.home, prob: probs[i] }, { name: t.away, prob: 100 - probs[i] }]
            return (
              <div key={i} className="rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
                {rows.map((r) => {
                  const picked = w === r.name
                  return (
                    <button key={r.name} onClick={() => flip(i, r.name)} className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${picked ? "bg-[#7E43FF] text-white" : "hover:bg-[#f1ecff]"}`}>
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${picked ? "border-white bg-white" : "border-[#c9c2e0]"}`}>
                        {picked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#7E43FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </span>
                      <img src={FLAG(iso2(r.name))} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
                      <span className={`text-sm font-semibold flex-1 truncate ${picked ? "text-white" : "text-[#231645]"}`}>{r.name}</span>
                      <span className={`text-xs tabular-nums ${picked ? "text-white/90" : "text-[#615E6E]"}`}>{r.prob.toFixed(0)}%</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Projected Round of 16 matchups */}
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Projected Round of 16 matchups</h2>
        <p className="text-sm text-[#615E6E] mb-5">Pairing the projected winners into the Round of 16 bracket (matches 89-96).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {r16.map((m) => (
            <div key={m.matchNumber} className="rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
              <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#615E6E] bg-[#f8f7fd] border-b border-black/[0.05]">Match {m.matchNumber}</div>
              <div className="flex items-center gap-2 px-3 py-2">
                <img src={FLAG(iso2(m.home))} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
                <span className="text-sm font-semibold text-[#231645] truncate">{m.home}</span>
              </div>
              <div className="h-px bg-black/[0.06] mx-3" />
              <div className="flex items-center gap-2 px-3 py-2">
                <img src={FLAG(iso2(m.away))} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
                <span className="text-sm font-semibold text-[#231645] truncate">{m.away}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#615E6E] mt-4">Want the full odds, title chances and survival heatmap? See the <a href="/round-of-32/" className="text-[#7E43FF] font-semibold underline">Round of 32 page</a>. Pick the whole bracket on the same page.</p>
      </div>
    </div>
  )
}
