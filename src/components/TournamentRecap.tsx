"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import { matches } from "@/data/matches"
import results from "@/data/matchResults.json"
import { iso2 } from "@/lib/predictorEngine"

/**
 * 2026 World Cup recap: the podium plus an interactive tab through each of the
 * final four teams' full tournament paths. Reads results live.
 */

type Res = { homeScore?: number; awayScore?: number; status?: string; penaltyHome?: number; penaltyAway?: number }
const R = results as Record<string, Res>
const FLAG = (c: string) => `https://flagcdn.com/w80/${c}.png`
const fmtDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })

type Step = { round: string; date: string; opp: string; oppIso: string; gf: number; ga: number; status: string; result: "W" | "L" }
function pathFor(team: string): Step[] {
  return matches.filter((m) => m.homeTeam === team || m.awayTeam === team).sort((a, b) => a.matchNumber - b.matchNumber).map((g) => {
    const r = R[g.id]
    if (!r || !["FT", "AET", "PEN"].includes(r.status ?? "") || r.homeScore == null || r.awayScore == null) return null
    const home = g.homeTeam === team
    const gf = home ? r.homeScore : r.awayScore
    const ga = home ? r.awayScore : r.homeScore
    let win = gf > ga
    if (gf === ga && r.status === "PEN") win = (home ? (r.penaltyHome ?? 0) : (r.penaltyAway ?? 0)) > (home ? (r.penaltyAway ?? 0) : (r.penaltyHome ?? 0))
    return { round: g.round, date: g.date, opp: home ? g.awayTeam : g.homeTeam, oppIso: iso2(home ? g.awayTeam : g.homeTeam), gf, ga, status: r.status ?? "FT", result: (win ? "W" : "L") as "W" | "L" }
  }).filter(Boolean) as Step[]
}

const PODIUM = [
  { name: "Spain", iso: "es", place: "Champions", medal: "🥇", color: "#eab308" },
  { name: "Argentina", iso: "ar", place: "Runners-up", medal: "🥈", color: "#94a3b8" },
  { name: "England", iso: "gb-eng", place: "Third place", medal: "🥉", color: "#b45309" },
  { name: "France", iso: "fr", place: "Fourth place", medal: "4th", color: "#64748b" },
]

export default function TournamentRecap() {
  const [tab, setTab] = useState(0)
  const paths = useMemo(() => PODIUM.map((p) => pathFor(p.name)), [])
  const path = paths[tab]
  const team = PODIUM[tab]
  const sum = useMemo(() => {
    const w = path.filter((s) => s.result === "W").length
    const l = path.filter((s) => s.result === "L").length
    const gf = path.reduce((a, s) => a + s.gf, 0)
    const ga = path.reduce((a, s) => a + s.ga, 0)
    return { w, l, gf, ga }
  }, [path])

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Interactive · The podium</p>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">How the final four got there</h2>
        <p className="text-sm text-[#615E6E]">The 2026 podium, and the full path each of the top four took. Tap a team to walk its tournament.</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {PODIUM.map((p, i) => (
          <button key={p.name} onClick={() => setTab(i)} className={`rounded-xl p-3 text-center transition-all border-2 ${tab === i ? "border-[#7E43FF] bg-[#7E43FF]/5" : "border-transparent bg-[#f8f7fd] hover:bg-[#f1ecff]"}`}>
            <div className="text-2xl mb-1">{p.medal}</div>
            <img src={FLAG(p.iso)} alt="" width={40} height={28} className="rounded-sm mx-auto mb-1.5 shadow-sm" />
            <p className="text-sm font-extrabold text-[#231645] leading-tight">{p.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.place}</p>
          </button>
        ))}
      </div>

      {/* Selected path */}
      <div className="rounded-xl bg-gradient-to-br from-[#231645] to-[#7E43FF] text-white p-4 mb-4 flex items-center gap-4">
        <img src={FLAG(team.iso)} alt="" width={48} height={34} className="rounded-md shadow-md flex-shrink-0" />
        <div>
          <p className="text-lg font-extrabold">{team.name} · {team.place}</p>
          <p className="text-sm text-white/85 tabular-nums">{sum.w}W {sum.l}L · {sum.gf} scored, {sum.ga} conceded across {path.length} games</p>
        </div>
      </div>

      <div className="space-y-2">
        {path.map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-black/[0.06] px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] w-24 flex-shrink-0">{s.round === "Group Stage" ? "Group" : s.round}</span>
            <span className="text-[10px] text-[#615E6E] w-12 flex-shrink-0 tabular-nums">{fmtDate(s.date)}</span>
            <img src={`https://flagcdn.com/w40/${team.iso}.png`} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
            <span className={`text-sm font-extrabold tabular-nums flex-shrink-0 ${s.result === "W" ? "text-[#065f46]" : "text-[#7f1d1d]"}`}>{s.gf}-{s.ga}{s.status === "AET" ? " AET" : s.status === "PEN" ? " p" : ""}</span>
            <img src={`https://flagcdn.com/w40/${s.oppIso}.png`} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
            <span className="text-sm font-semibold text-[#231645] flex-1 truncate">{s.opp}</span>
            <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full flex-shrink-0 ${s.result === "W" ? "bg-[#10b981]/15 text-[#065f46]" : "bg-[#ef4444]/15 text-[#7f1d1d]"}`}>{s.result}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
