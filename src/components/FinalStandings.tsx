"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import { matches } from "@/data/matches"
import results from "@/data/matchResults.json"
import { groups } from "@/data/groups"

/**
 * Final placement of all 48 teams at the 2026 World Cup, computed from results:
 * each team's exit round determines its tier. Filter by confederation.
 */

type Res = { homeScore?: number; awayScore?: number; status?: string; penaltyHome?: number; penaltyAway?: number }
const R = results as Record<string, Res>
const FLAG = (c: string) => `https://flagcdn.com/w40/${c}.png`

const TEAMS = groups.flatMap((g) => g.teams.map((t) => ({ name: t.name, iso2: t.iso2, conf: t.confederation })))

type Tier = { key: string; label: string; color: string }
const TIERS: Tier[] = [
  { key: "champion", label: "Champions", color: "#eab308" },
  { key: "runner", label: "Runners-up", color: "#94a3b8" },
  { key: "third", label: "Third place", color: "#b45309" },
  { key: "fourth", label: "Fourth place", color: "#64748b" },
  { key: "qf", label: "Quarter-finals", color: "#f59e0b" },
  { key: "r16", label: "Round of 16", color: "#10b981" },
  { key: "r32", label: "Round of 32", color: "#3b82f6" },
  { key: "group", label: "Group stage", color: "#7E43FF" },
]

function won(id: string, team: string, home: string, away: string): boolean | null {
  const r = R[id]
  if (!r || !["FT", "AET", "PEN"].includes(r.status ?? "") || r.homeScore == null || r.awayScore == null) return null
  const isHome = team === home
  const gf = isHome ? r.homeScore : r.awayScore
  const ga = isHome ? r.awayScore : r.homeScore
  if (gf > ga) return true
  if (gf < ga) return false
  const ph = isHome ? (r.penaltyHome ?? 0) : (r.penaltyAway ?? 0)
  const pa = isHome ? (r.penaltyAway ?? 0) : (r.penaltyHome ?? 0)
  return ph > pa
}

function tierFor(team: string): string {
  const played = matches
    .filter((m) => (m.homeTeam === team || m.awayTeam === team))
    .filter((m) => { const r = R[m.id]; return r && ["FT", "AET", "PEN"].includes(r.status ?? "") })
    .sort((a, b) => b.matchNumber - a.matchNumber)
  const last = played[0]
  if (!last) return "group"
  const w = won(last.id, team, last.homeTeam, last.awayTeam)
  switch (last.round) {
    case "Final": return w ? "champion" : "runner"
    case "3rd Place": return w ? "third" : "fourth"
    case "Semi-final": return "qf" // shouldn't happen (SF losers play 3rd place)
    case "Quarterfinal": return "qf"
    case "Round of 16": return "r16"
    case "Round of 32": return "r32"
    default: return "group"
  }
}

const CONFS = ["All", "UEFA", "CONMEBOL", "CAF", "AFC", "CONCACAF", "OFC"]

export default function FinalStandings() {
  const [conf, setConf] = useState("All")
  const placed = useMemo(() => TEAMS.map((t) => ({ ...t, tier: tierFor(t.name) })), [])
  const filtered = conf === "All" ? placed : placed.filter((t) => t.conf === conf)

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Interactive · Final standings</p>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">Where all 48 teams finished</h2>
        <p className="text-sm text-[#615E6E]">Every nation grouped by how far it got. Filter by confederation to see how each region fared.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CONFS.map((c) => (
          <button key={c} onClick={() => setConf(c)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${conf === c ? "bg-[#231645] text-white" : "bg-[#f5f4fa] text-[#615E6E] hover:bg-[#f1ecff]"}`}>{c}</button>
        ))}
      </div>

      <div className="space-y-5">
        {TIERS.map((tier) => {
          const teams = filtered.filter((t) => t.tier === tier.key)
          if (teams.length === 0) return null
          return (
            <div key={tier.key}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: tier.color }} />
                <h3 className="text-sm font-extrabold text-[#231645]">{tier.label}</h3>
                <span className="text-[10px] font-bold text-[#615E6E] bg-[#f5f4fa] px-2 py-0.5 rounded-full">{teams.length}</span>
                <div className="flex-1 h-px bg-black/[0.06]" />
              </div>
              <div className="flex flex-wrap gap-2">
                {teams.map((t) => (
                  <span key={t.name} className={`inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 border ${tier.key === "champion" ? "border-[#eab308] bg-[#eab308]/10" : "border-black/[0.08] bg-[#f8f7fd]"}`}>
                    <img src={FLAG(t.iso2)} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
                    <span className={`text-xs font-bold ${tier.key === "champion" ? "text-[#a16207]" : "text-[#231645]"}`}>{t.name}{tier.key === "champion" ? " 🏆" : ""}</span>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
