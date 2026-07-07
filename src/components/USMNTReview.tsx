"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import { matches } from "@/data/matches"
import results from "@/data/matchResults.json"
import { iso2 } from "@/lib/predictorEngine"

/**
 * USMNT tournament review: their five games, each with an interactive grade the
 * reader assigns (A-F). A live overall grade updates as you rate the run.
 */

type Res = { homeScore?: number; awayScore?: number; status?: string }
const R = results as Record<string, Res>
const FLAG = (c: string) => `https://flagcdn.com/w40/${c}.png`
const fmtDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })

const NOTES: Record<string, string> = {
  Paraguay: "A statement opener. Four goals, a front line clicking, belief sky-high.",
  Australia: "Professional, controlled, a second clean-sheet win. Group D looked locked.",
  Turkey: "A flat dead-rubber loss with qualification secured, but a warning sign ignored.",
  "Bosnia and Herzegovina": "The projected R32 tie, handled 2-0. Business as usual at Levi's.",
  Belgium: "The wheels came off. Overrun 4-1, the defensive frailties from the Turkey game laid bare on the biggest night.",
}
const GRADES = ["A", "B", "C", "D", "F"] as const
const GPA: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 }

export default function USMNTReview() {
  const path = useMemo(() => {
    const games = matches.filter((m) => m.homeTeam === "United States" || m.awayTeam === "United States").sort((a, b) => a.matchNumber - b.matchNumber)
    return games.map((g) => {
      const r = R[g.id]
      if (!r || !["FT", "AET", "PEN"].includes(r.status ?? "") || r.homeScore == null || r.awayScore == null) return null
      const home = g.homeTeam === "United States"
      const gf = home ? r.homeScore : r.awayScore
      const ga = home ? r.awayScore : r.homeScore
      const opp = home ? g.awayTeam : g.homeTeam
      return { round: g.round, date: g.date, opp, oppIso: iso2(opp), gf, ga, win: gf > ga }
    }).filter(Boolean) as { round: string; date: string; opp: string; oppIso: string; gf: number; ga: number; win: boolean }[]
  }, [])

  const [grades, setGrades] = useState<Record<number, string>>({})
  const overall = useMemo(() => {
    const vals = Object.values(grades)
    if (!vals.length) return null
    const avg = vals.reduce((a, g) => a + GPA[g], 0) / vals.length
    return avg >= 3.5 ? "A" : avg >= 2.5 ? "B" : avg >= 1.5 ? "C" : avg >= 0.5 ? "D" : "F"
  }, [grades])

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Interactive · Rate the run</p>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">Grade the USMNT&apos;s World Cup</h2>
          <p className="text-sm text-[#615E6E]">Five games, one Round of 16 exit. Give each match a grade and we&apos;ll tally your overall verdict on the summer.</p>
        </div>
        {overall && (
          <div className="flex-shrink-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">Your grade</p>
            <p className="text-4xl font-extrabold text-[#7E43FF] leading-none">{overall}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {path.map((s, i) => (
          <div key={i} className="rounded-xl border border-black/[0.06] p-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] w-24 flex-shrink-0">{s.round === "Group Stage" ? "Group" : s.round}</span>
              <span className="text-[10px] text-[#615E6E] w-12 flex-shrink-0 tabular-nums">{fmtDate(s.date)}</span>
              <img src="https://flagcdn.com/w40/us.png" alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
              <span className={`text-sm font-extrabold tabular-nums flex-shrink-0 ${s.win ? "text-[#065f46]" : "text-[#7f1d1d]"}`}>{s.gf}-{s.ga}</span>
              <img src={FLAG(s.oppIso)} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
              <span className="text-sm font-semibold text-[#231645] flex-1 truncate">{s.opp}</span>
            </div>
            <p className="text-xs text-[#615E6E] mb-2.5 leading-relaxed">{NOTES[s.opp]}</p>
            <div className="flex gap-1.5">
              {GRADES.map((g) => (
                <button key={g} onClick={() => setGrades((p) => ({ ...p, [i]: g }))} className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all ${grades[i] === g ? "bg-[#7E43FF] text-white shadow-md scale-105" : "bg-[#f8f7fd] text-[#231645] hover:bg-[#f1ecff]"}`}>{g}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#615E6E] mt-4">The USMNT reached the Round of 16, the same stage as fellow hosts Mexico and Canada, before Belgium ended the run 4-1.</p>
    </section>
  )
}
