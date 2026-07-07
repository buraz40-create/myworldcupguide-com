"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import { matches } from "@/data/matches"
import results from "@/data/matchResults.json"
import { iso2 } from "@/lib/predictorEngine"

/**
 * Interactive tracker for the three 2026 host nations (USA, Mexico, Canada),
 * all eliminated in the Round of 16. Tab between them to see each team's full
 * tournament path, record, and how it ended.
 */

type Res = { homeScore?: number; awayScore?: number; status?: string; penaltyHome?: number; penaltyAway?: number }
const R = results as Record<string, Res>
const FINAL = ["FT", "AET", "PEN"]
const FLAG = (c: string) => `https://flagcdn.com/w40/${c}.png`
const fmtDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })

type Step = { round: string; date: string; opp: string; oppIso: string; gf: number; ga: number; status: string; result: "W" | "L" | "D" | "Wp" | "Lp" }

function pathFor(team: string): Step[] {
  const games = matches.filter((m) => m.homeTeam === team || m.awayTeam === team).sort((a, b) => a.matchNumber - b.matchNumber)
  const out: Step[] = []
  for (const g of games) {
    const r = R[g.id]
    if (!r || !FINAL.includes(r.status ?? "") || r.homeScore == null || r.awayScore == null) continue
    const home = g.homeTeam === team
    const gf = home ? r.homeScore : r.awayScore
    const ga = home ? r.awayScore : r.homeScore
    const opp = home ? g.awayTeam : g.homeTeam
    let result: Step["result"] = gf > ga ? "W" : gf < ga ? "L" : "D"
    if (r.status === "PEN") {
      const ph = home ? (r.penaltyHome ?? 0) : (r.penaltyAway ?? 0)
      const pa = home ? (r.penaltyAway ?? 0) : (r.penaltyHome ?? 0)
      result = ph > pa ? "Wp" : "Lp"
    }
    out.push({ round: g.round, date: g.date, opp, oppIso: iso2(opp), gf, ga, status: r.status ?? "FT", result })
  }
  return out
}

const HOSTS = [
  { name: "United States", short: "USA", iso: "us" },
  { name: "Mexico", short: "Mexico", iso: "mx" },
  { name: "Canada", short: "Canada", iso: "ca" },
]

const RESULT_STYLE: Record<string, string> = {
  W: "bg-[#10b981]/15 text-[#065f46]", Wp: "bg-[#10b981]/15 text-[#065f46]",
  D: "bg-[#615E6E]/15 text-[#615E6E]",
  L: "bg-[#ef4444]/15 text-[#7f1d1d]", Lp: "bg-[#ef4444]/15 text-[#7f1d1d]",
}
const resultLabel = (s: Step["result"]) => (s === "Wp" ? "W (pens)" : s === "Lp" ? "L (pens)" : s)

export default function HostExits() {
  const [tab, setTab] = useState(0)
  const paths = useMemo(() => HOSTS.map((h) => pathFor(h.name)), [])
  const path = paths[tab]
  const host = HOSTS[tab]

  const sum = useMemo(() => {
    const w = path.filter((s) => s.result[0] === "W").length
    const d = path.filter((s) => s.result === "D").length
    const l = path.filter((s) => s.result[0] === "L").length
    const gf = path.reduce((a, s) => a + s.gf, 0)
    const ga = path.reduce((a, s) => a + s.ga, 0)
    const exit = path.find((s) => s.round === "Round of 16")
    return { w, d, l, gf, ga, exit }
  }, [path])

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Interactive · Host nations</p>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">Every host&apos;s road to the exit</h2>
        <p className="text-sm text-[#615E6E]">All three 2026 hosts were knocked out in the Round of 16. Tap a nation to see its full tournament path and how it ended.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {HOSTS.map((h, i) => (
          <button key={h.name} onClick={() => setTab(i)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === i ? "bg-[#7E43FF] text-white shadow-md" : "bg-[#f8f7fd] text-[#231645] hover:bg-[#f1ecff]"}`}>
            <img src={FLAG(h.iso)} alt="" width={22} height={16} className="rounded-sm" />
            {h.short}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-[#f8f7fd] p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E] mb-1">Record</p>
          <p className="text-lg font-extrabold text-[#231645] tabular-nums">{sum.w}W {sum.d}D {sum.l}L</p>
        </div>
        <div className="rounded-xl bg-[#f8f7fd] p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E] mb-1">Goals</p>
          <p className="text-lg font-extrabold text-[#231645] tabular-nums">{sum.gf}-{sum.ga}</p>
        </div>
        <div className="rounded-xl bg-[#ef4444]/10 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f1d1d] mb-1">Knocked out by</p>
          <p className="text-sm font-extrabold text-[#7f1d1d] leading-tight mt-1">{sum.exit ? `${sum.exit.opp} ${sum.exit.gf}-${sum.exit.ga}` : "-"}</p>
        </div>
      </div>

      {/* Match list */}
      <div className="space-y-2">
        {path.map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-black/[0.06] px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] w-24 flex-shrink-0">{s.round === "Group Stage" ? "Group" : s.round}</span>
            <span className="text-[10px] text-[#615E6E] w-12 flex-shrink-0 tabular-nums">{fmtDate(s.date)}</span>
            <img src={FLAG(host.iso)} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
            <span className="text-sm font-bold text-[#231645] tabular-nums flex-shrink-0">{s.gf}-{s.ga}</span>
            <img src={FLAG(s.oppIso)} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
            <span className="text-sm font-semibold text-[#231645] flex-1 truncate">{s.opp}</span>
            <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full flex-shrink-0 ${RESULT_STYLE[s.result]}`}>{resultLabel(s.result)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
