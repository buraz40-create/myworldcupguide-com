"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { groups, type GroupTeam, type GroupStrength } from "@/data/groups"
import { teams } from "@/data/teams"
import QuickAnswers from "@/components/QuickAnswers"

import { getGroupStandings } from "@/lib/standings"

const teamSlugMap = new Map(teams.map((t) => [t.name, t.slug]))

const groupColors = [
  "#7E43FF", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4",
  "#7E43FF", "#3b82f6", "#10b981", "#ef4444",
]

const strengthConfig: Record<GroupStrength, { label: string; color: string; bg: string }> = {
  Weak:     { label: "Weak",     color: "#10b981", bg: "#10b98115" },
  Moderate: { label: "Moderate", color: "#f59e0b", bg: "#f59e0b15" },
  Strong:   { label: "Strong",   color: "#ef4444", bg: "#ef444415" },
}

const CONF_TABS = ["All Groups", "UEFA", "CONMEBOL", "CAF", "AFC", "CONCACAF", "OFC"] as const
type ConfTab = typeof CONF_TABS[number]

const stats = [
  { value: "48", label: "Teams" },
  { value: "12", label: "Groups" },
  { value: "104", label: "Matches" },
  { value: "16", label: "Stadiums" },
  { value: "3", label: "Hosts" },
  { value: "4", label: "Debuts" },
]

function FlagImg({ iso2, name }: { iso2: string; name: string }) {
  return (
    <Image
      src={`https://flagcdn.com/w40/${iso2}.png`}
      alt={name}
      width={28}
      height={19}
      className="rounded-sm object-cover flex-shrink-0"
      style={{ width: 28, height: 19 }}
      unoptimized
    />
  )
}

function TeamBadges({ team }: { team: GroupTeam }) {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {team.isHost && (
        <span className="text-[0.5rem] font-bold px-1 py-0.5 rounded-full text-white bg-[#3b82f6] leading-none">HOST</span>
      )}
      {team.isDebutant && (
        <span className="text-[0.5rem] font-bold px-1 py-0.5 rounded-full text-[#10b981] bg-[#10b981]/10 leading-none">NEW</span>
      )}
      {team.isPlayoff && (
        <span className="text-[0.5rem] font-bold px-1 py-0.5 rounded-full text-[#ec4899] bg-[#ec4899]/10 leading-none">PO</span>
      )}
      {team.isHistoricReturn && (
        <span className="text-[0.5rem] font-bold px-1 py-0.5 rounded-full text-[#f59e0b] bg-[#f59e0b]/10 leading-none">RET</span>
      )}
    </span>
  )
}

const COL = "text-center text-xs text-[#615E6E] w-8"
const VAL = "text-center text-sm text-[#231645] w-8"
const PTS = "text-center text-sm font-extrabold w-8"

type QA = { question: string; answer: string | (string | { text: string; href: string })[] }
type GroupsClientProps = { quickAnswers?: QA[] }

export default function GroupsClient({ quickAnswers }: GroupsClientProps = {}) {
  const [activeTab, setActiveTab] = useState<ConfTab>("All Groups")

  const visibleGroups = activeTab === "All Groups"
    ? groups
    : groups.filter((g) => g.teams.some((t) => t.confederation === activeTab))

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">

      {/* Header */}
      <div className="text-center px-6 mb-8">
        <div className="pill inline-flex mb-5">Group Stage</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-2">
          FIFA World Cup 2026 - Group Stage
        </h1>
        <p className="text-[#615E6E] text-sm">
          All 48 teams confirmed · June 11–27, 2026 · USA, Canada and Mexico
        </p>
      </div>

      {quickAnswers && quickAnswers.length > 0 && (
        <QuickAnswers heading="World Cup 2026 groups - quick answers" items={quickAnswers} variant="compact" />
      )}

      <div className="mt-12" />

      {/* Stats bar */}
      <div className="max-w-3xl mx-auto px-6 mb-8">
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-black/[0.05]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-4 px-2">
                <span className="text-2xl font-extrabold text-[#231645]">{s.value}</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#615E6E] mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 px-6 mb-5">
        {[
          { color: "#3b82f6", label: "Host nation" },
          { color: "#10b981", label: "World Cup debut" },
          { color: "#ec4899", label: "Playoff qualifier" },
          { color: "#f59e0b", label: "Historic return" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-[#231645] font-medium">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color + "33", border: `1.5px solid ${item.color}` }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Confederation filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 px-6 mb-8">
        {CONF_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={
              activeTab === tab
                ? { background: "#231645", color: "#ffffff" }
                : { background: "#f5f4fa", color: "#615E6E" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Groups grid - 2 columns */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleGroups.map((group) => {
            const globalIdx = groups.indexOf(group)
            const color = groupColors[globalIdx]
            const strength = strengthConfig[group.strength]

            return (
              <div key={group.letter} className="card overflow-hidden" style={{ borderTop: `3px solid ${color}` }}>

                {/* Group header */}
                <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-black/[0.05]">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
                    style={{ background: color }}
                  >
                    {group.letter}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#231645] text-sm leading-tight">Group {group.letter}</p>
                    <p className="text-xs text-[#615E6E]">June 11–27, 2026</p>
                  </div>
                  <span
                    className="text-[0.65rem] font-bold px-2 py-1 rounded-full"
                    style={{ color: strength.color, background: strength.bg }}
                  >
                    {strength.label}
                  </span>
                </div>

                {/* Standings table */}
                <div className="px-4 pt-2 pb-1">
                  {/* Column headers */}
                  <div className="flex items-center gap-1 mb-1 px-1">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#615E6E] w-5 text-center">#</span>
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#615E6E] flex-1 ml-8">Team</span>
                    <span className={COL}>MP</span>
                    <span className={COL}>W</span>
                    <span className={COL}>D</span>
                    <span className={COL}>L</span>
                    <span className={COL}>GF</span>
                    <span className={COL}>GA</span>
                    <span className={COL}>GD</span>
                    <span className="text-center text-[0.6rem] font-extrabold uppercase tracking-wider text-[#231645] w-8">Pts</span>
                  </div>

                  {/* Team rows . sorted by live standings once any matches have been played. */}
                  {(() => {
                    const standings = getGroupStandings(group.letter)
                    const byName = new Map(standings.map((s) => [s.team, s]))
                    const anyPlayed = standings.some((s) => s.played > 0)
                    const ordered = anyPlayed
                      ? standings.map((s) => group.teams.find((t) => t.name === s.team)!).filter(Boolean)
                      : group.teams
                    return ordered.map((team, idx) => {
                      const isFavorite = group.favorites.includes(team.name)
                      const isQualificationZone = idx < 2
                      const slug = teamSlugMap.get(team.name)
                      const s = byName.get(team.name)
                      return (
                        <div
                          key={team.name}
                          className="flex items-center gap-1 py-2 px-1 rounded-lg transition-colors hover:bg-black/[0.02]"
                          style={{
                            borderBottom: idx < group.teams.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                          }}
                        >
                          <span
                            className="w-5 text-center text-xs font-bold flex-shrink-0"
                            style={{ color: isQualificationZone ? color : "#615E6E" }}
                          >
                            {idx + 1}
                          </span>
                          <div
                            className="w-0.5 h-5 rounded-full flex-shrink-0 mx-0.5"
                            style={{ background: isQualificationZone ? color : "transparent" }}
                          />
                          <Link
                            href={slug ? `/teams/${slug}` : "#"}
                            className="flex items-center gap-2 flex-1 min-w-0 group"
                          >
                            <FlagImg iso2={team.iso2} name={team.name} />
                            <span className={`text-sm leading-tight truncate group-hover:text-[#7E43FF] transition-colors ${isFavorite ? "font-bold text-[#231645]" : "font-medium text-[#231645]"}`}>
                              {team.name}
                            </span>
                            <TeamBadges team={team} />
                          </Link>
                          <span className={VAL}>{s?.played ?? 0}</span>
                          <span className={VAL}>{s?.won ?? 0}</span>
                          <span className={VAL}>{s?.drawn ?? 0}</span>
                          <span className={VAL}>{s?.lost ?? 0}</span>
                          <span className={VAL}>{s?.gf ?? 0}</span>
                          <span className={VAL}>{s?.ga ?? 0}</span>
                          <span className={VAL}>{s ? (s.gd >= 0 ? `+${s.gd}` : s.gd) : 0}</span>
                          <span className={PTS} style={{ color }}>{s?.pts ?? 0}</span>
                        </div>
                      )
                    })
                  })()}
                </div>

                {/* Qualification zone legend */}
                <div className="px-5 py-2.5 border-t border-black/[0.05]" style={{ background: "#fafafa" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-0.5 h-3.5 rounded-full" style={{ background: color }} />
                      <span className="text-[0.65rem] text-[#615E6E]">Advance to Round of 32</span>
                    </div>
                    <span className="text-[0.65rem] font-semibold text-[#615E6E]">
                      ★ {group.favorites[0]} · {group.favorites[1]}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Badge legend */}
      <div className="max-w-2xl mx-auto px-6 mt-12">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#615E6E] mb-3">Badge Guide</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[0.5rem] font-bold px-1 py-0.5 rounded-full text-white bg-[#3b82f6]">HOST</span>
              <span className="text-[#615E6E]">Host nation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.5rem] font-bold px-1 py-0.5 rounded-full text-[#10b981] bg-[#10b981]/10">NEW</span>
              <span className="text-[#615E6E]">World Cup debut</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.5rem] font-bold px-1 py-0.5 rounded-full text-[#ec4899] bg-[#ec4899]/10">PO</span>
              <span className="text-[#615E6E]">Qualified via playoff</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.5rem] font-bold px-1 py-0.5 rounded-full text-[#f59e0b] bg-[#f59e0b]/10">RET</span>
              <span className="text-[#615E6E]">Historic return</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
