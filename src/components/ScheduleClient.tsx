"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { matches, slugForMatch, type Match } from "@/data/matches"
import { getKickoff } from "@/lib/matchTime"
import { getResult } from "@/lib/matchResults"
import { stadiums } from "@/data/stadiums"
import { cities } from "@/data/cities"
import { groups } from "@/data/groups"
import { teams } from "@/data/teams"
import QuickAnswers, { type QA } from "@/components/QuickAnswers"

const stadiumMap = new Map(stadiums.map((s) => [s.slug, s]))
const cityMap = new Map(cities.map((c) => [c.slug, c]))
const teamSlugMap = new Map(teams.map((t) => [t.name, t.slug]))

const teamIso2Map = new Map<string, string>()
for (const g of groups) {
  for (const t of g.teams) teamIso2Map.set(t.name, t.iso2)
}

function FlagImg({ team, size = "md" }: { team: string; size?: "sm" | "md" | "lg" }) {
  const iso2 = teamIso2Map.get(team)
  const dims = size === "lg" ? { w: 40, h: 27, src: "w80" } : size === "sm" ? { w: 24, h: 16, src: "w40" } : { w: 32, h: 22, src: "w80" }
  if (!iso2) {
    return (
      <span
        className="inline-block rounded-sm bg-[#f5f4fa] flex-shrink-0"
        style={{ width: dims.w, height: dims.h }}
        aria-hidden
      />
    )
  }
  return (
    <Image
      src={`https://flagcdn.com/${dims.src}/${iso2}.png`}
      alt={team}
      width={dims.w}
      height={dims.h}
      className="rounded-sm object-cover flex-shrink-0 shadow-sm ring-1 ring-black/5"
      style={{ width: dims.w, height: dims.h }}
      unoptimized
    />
  )
}

function TeamSide({ name, align }: { name: string; align: "left" | "right" }) {
  const slug = teamSlugMap.get(name)
  const content = (
    <>
      {align === "right" && (
        <span className="font-bold text-[#231645] text-base truncate group-hover/team:text-[#7E43FF] transition-colors">
          {name}
        </span>
      )}
      <FlagImg team={name} size="lg" />
      {align === "left" && (
        <span className="font-bold text-[#231645] text-base truncate group-hover/team:text-[#7E43FF] transition-colors">
          {name}
        </span>
      )}
    </>
  )
  // Outer cell handles alignment; inner Link wraps ONLY the flag+name content
  // so empty space in the cell falls through to the row-level stretched link.
  const outerClass = `flex min-w-0 ${align === "right" ? "justify-end" : "justify-start"}`
  const innerClass = "group/team inline-flex items-center gap-3 max-w-full"
  if (slug) {
    return (
      <div className={outerClass}>
        <Link href={`/teams/${slug}`} className={`${innerClass} relative z-10`}>
          {content}
        </Link>
      </div>
    )
  }
  return (
    <div className={outerClass}>
      <div className={innerClass}>{content}</div>
    </div>
  )
}

const ROUND_TABS = [
  "All Rounds",
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarterfinal",
  "Semi-final",
  "3rd Place",
  "Final",
] as const
type RoundTab = typeof ROUND_TABS[number]

const COUNTRY_TABS = ["All Countries", "USA", "Canada", "Mexico"] as const
type CountryTab = typeof COUNTRY_TABS[number]

const roundColors: Record<string, { bg: string; text: string; border: string }> = {
  "Group Stage":  { bg: "#7E43FF15", text: "#7E43FF", border: "#7E43FF" },
  "Round of 32":  { bg: "#3b82f615", text: "#3b82f6", border: "#3b82f6" },
  "Round of 16":  { bg: "#10b98115", text: "#10b981", border: "#10b981" },
  "Quarterfinal": { bg: "#f59e0b15", text: "#f59e0b", border: "#f59e0b" },
  "Semi-final":   { bg: "#ef444415", text: "#ef4444", border: "#ef4444" },
  "3rd Place":    { bg: "#64748b15", text: "#64748b", border: "#64748b" },
  "Final":        { bg: "#eab30820", text: "#a16207", border: "#eab308" },
}

const stats = [
  { value: "104", label: "Matches" },
  { value: "72",  label: "Group Stage" },
  { value: "32",  label: "Knockouts" },
  { value: "16",  label: "Venues" },
  { value: "48",  label: "Teams" },
  { value: "39",  label: "Days" },
]

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })
}

function groupByDate(list: Match[]): [string, Match[]][] {
  const map = new Map<string, Match[]>()
  for (const m of list) {
    if (!map.has(m.date)) map.set(m.date, [])
    map.get(m.date)!.push(m)
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
}

type ScheduleClientProps = { quickAnswers?: QA[] }

export default function ScheduleClient({ quickAnswers }: ScheduleClientProps = {}) {
  const [activeRound, setActiveRound] = useState<RoundTab>("All Rounds")
  const [activeCountry, setActiveCountry] = useState<CountryTab>("All Countries")

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (activeRound !== "All Rounds" && m.round !== activeRound) return false
      if (activeCountry !== "All Countries") {
        const stadium = stadiumMap.get(m.stadiumSlug)
        if (!stadium || stadium.country !== activeCountry) return false
      }
      return true
    })
  }, [activeRound, activeCountry])

  const groupedByDate = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">

      {/* Header */}
      <div className="text-center px-6 mb-8">
        <div className="pill inline-flex mb-5">Match Schedule</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-2">
          FIFA World Cup 2026 - Full Schedule
        </h1>
        <p className="text-[#615E6E] text-sm mb-4">
          All 104 matches · June 11 – July 19, 2026 · USA, Canada &amp; Mexico
        </p>
        <Link
          href="/schedule/friendlies/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all"
          style={{ background: "#231645", color: "#fff" }}
        >
          See pre-tournament friendlies →
        </Link>
      </div>

      {quickAnswers && quickAnswers.length > 0 && (
        <QuickAnswers heading="World Cup 2026 schedule - quick answers" items={quickAnswers} variant="compact" />
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

      {/* Round filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 px-6 mb-3">
        {ROUND_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveRound(tab)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={
              activeRound === tab
                ? { background: "#231645", color: "#ffffff" }
                : { background: "#f5f4fa", color: "#615E6E" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Country filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 px-6 mb-8">
        {COUNTRY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveCountry(tab)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all border"
            style={
              activeCountry === tab
                ? { background: "#7E43FF", color: "#ffffff", borderColor: "#7E43FF" }
                : { background: "#ffffff", color: "#615E6E", borderColor: "rgba(35,22,69,0.1)" }
            }
          >
            {tab === "USA" ? "🇺🇸 USA" : tab === "Canada" ? "🇨🇦 Canada" : tab === "Mexico" ? "🇲🇽 Mexico" : tab}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="max-w-5xl mx-auto px-6 mb-4">
        <p className="text-sm text-[#615E6E]">
          Showing <span className="font-bold text-[#231645]">{filtered.length}</span> match{filtered.length !== 1 ? "es" : ""}
          {activeRound !== "All Rounds" && ` · ${activeRound}`}
          {activeCountry !== "All Countries" && ` · ${activeCountry}`}
        </p>
      </div>

      {/* Matches grouped by date */}
      <div className="max-w-5xl mx-auto px-6">
        {groupedByDate.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-[#615E6E]">No matches match your filters.</p>
          </div>
        )}

        {groupedByDate.map(([date, dateMatches]) => (
          <div key={date} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-extrabold text-[#231645]">{formatDate(date)}</h2>
              <span className="text-xs font-bold text-[#615E6E] bg-[#f5f4fa] px-2.5 py-0.5 rounded-full">
                {dateMatches.length} match{dateMatches.length !== 1 ? "es" : ""}
              </span>
              <div className="flex-1 h-px bg-black/[0.06]" />
            </div>

            <div className="space-y-2.5">
              {dateMatches.map((m) => {
                const rc = roundColors[m.round] ?? roundColors["Group Stage"]
                const stadium = stadiumMap.get(m.stadiumSlug)
                const city = cityMap.get(m.citySlug)
                const isKnockout = m.round !== "Group Stage"

                return (
                  <div
                    key={m.id}
                    className="relative card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(126,67,255,0.1)] group/match"
                    style={{ borderLeft: `4px solid ${rc.border}` }}
                  >
                    {/* Stretched click target: whole row goes to match detail */}
                    <Link
                      href={`/matches/${slugForMatch(m)}`}
                      aria-label={
                        isKnockout
                          ? `View ${m.round} match ${m.matchNumber} details`
                          : `View ${m.homeTeam} vs ${m.awayTeam} match details`
                      }
                      className="absolute inset-0"
                    />

                    {/* Match number label (group stage only . knockouts show it prominently in the middle) */}
                    {!isKnockout && (
                      <span className="absolute top-2 right-3 text-[0.55rem] font-bold text-[#615E6E]/60 tabular-nums z-10 pointer-events-none">
                        #{m.matchNumber}
                      </span>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4">

                      {/* LEFT - time + round */}
                      {(() => {
                        const k = getKickoff(m)
                        return (
                          <div className="flex lg:flex-col items-center lg:items-start gap-3 lg:gap-1.5 flex-shrink-0 lg:w-32">
                            <div className="flex flex-col items-start">
                              <span className="text-xl font-black text-[#231645] tabular-nums leading-none">{k.etTime} <span className="text-xs font-bold text-[#7E43FF]">ET</span></span>
                              {!k.isSameAsEt && (
                                <span className="text-[10px] text-[#615E6E] font-semibold tabular-nums mt-0.5">{k.localTime} {k.localLabel}</span>
                              )}
                            </div>
                            <span
                              className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap"
                              style={{ background: rc.bg, color: rc.text }}
                            >
                              {m.group ? `Group ${m.group}` : m.round}
                            </span>
                          </div>
                        )
                      })()}

                      {/* MIDDLE - teams */}
                      <div className="min-w-0">
                        {m.homeTeam === "TBD" || m.awayTeam === "TBD" ? (
                          <div className="flex items-center justify-center gap-4 py-2">
                            <span className="flex-1 text-right text-sm font-semibold text-[#615E6E]/70 italic truncate">
                              Winner advances
                            </span>
                            <span className="flex flex-col items-center gap-1 flex-shrink-0">
                              <span
                                className="text-xl md:text-2xl font-black text-[#231645] tabular-nums leading-none tracking-tight"
                              >
                                Match {m.matchNumber}
                              </span>
                              <span
                                className="text-[0.6rem] font-extrabold text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                                style={{ background: rc.border }}
                              >
                                {m.round}
                              </span>
                            </span>
                            <span className="flex-1 text-left text-sm font-semibold text-[#615E6E]/70 italic truncate">
                              To be determined
                            </span>
                          </div>
                        ) : (
                          (() => {
                            const r = getResult(m.id)
                            const isFinal = r && (r.status === "FT" || r.status === "AET" || r.status === "PEN")
                            return (
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <TeamSide name={m.homeTeam} align="right" />
                                {isFinal ? (
                                  <span
                                    className="text-base font-extrabold text-white bg-[#231645] rounded-full px-3 py-1 tabular-nums flex-shrink-0"
                                    title={`${r.status === "PEN" ? `${r.penaltyHome}-${r.penaltyAway} pens` : r.status}`}
                                  >
                                    {r.homeScore}-{r.awayScore}{r.status === "AET" ? " AET" : r.status === "PEN" ? ` (${r.penaltyHome}-${r.penaltyAway}p)` : ""}
                                  </span>
                                ) : (
                                  <span className="text-[0.65rem] font-extrabold text-[#615E6E] bg-[#f5f4fa] rounded-full px-2.5 py-1 uppercase tracking-widest flex-shrink-0">
                                    vs
                                  </span>
                                )}
                                <TeamSide name={m.awayTeam} align="left" />
                              </div>
                            )
                          })()
                        )}
                      </div>

                      {/* RIGHT - venue */}
                      <div className="flex flex-col items-start lg:items-end text-xs flex-shrink-0 lg:w-52 lg:text-right">
                        {stadium && (
                          <Link
                            href={`/stadiums/${stadium.slug}`}
                            className="relative z-10 inline-flex items-center gap-1.5 text-[#7E43FF] hover:text-[#231645] transition-colors font-bold"
                          >
                            <span className="opacity-60">🏟</span>
                            <span className="hover:underline">{stadium.name}</span>
                          </Link>
                        )}
                        {city && (
                          <Link
                            href={`/cities/${city.slug}`}
                            className="relative z-10 text-[0.7rem] text-[#615E6E] hover:text-[#231645] transition-colors mt-0.5"
                          >
                            {city.name}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Round legend */}
      <div className="max-w-3xl mx-auto px-6 mt-12">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#615E6E] mb-3">Round Colors</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(roundColors).map(([round, rc]) => (
              <span
                key={round}
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: rc.bg, color: rc.text }}
              >
                {round}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Key dates */}
      <div className="max-w-3xl mx-auto px-6 mt-6">
        <div className="card p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#615E6E] mb-3">Key Dates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><span className="font-bold text-[#231645]">June 11</span> - Opening Match (Mexico City)</div>
            <div><span className="font-bold text-[#231645]">June 27</span> - Group Stage Ends</div>
            <div><span className="font-bold text-[#231645]">June 28 – July 3</span> - Round of 32</div>
            <div><span className="font-bold text-[#231645]">July 4–7</span> - Round of 16</div>
            <div><span className="font-bold text-[#231645]">July 9–11</span> - Quarterfinals</div>
            <div><span className="font-bold text-[#231645]">July 14–15</span> - Semi-finals</div>
            <div><span className="font-bold text-[#231645]">July 18</span> - 3rd Place (Miami)</div>
            <div><span className="font-bold text-[#231645]">July 19</span> - THE FINAL (MetLife)</div>
          </div>
        </div>
      </div>

    </div>
  )
}
