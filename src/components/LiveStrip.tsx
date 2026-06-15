"use client"

import { useEffect, useMemo, useRef, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { matches, slugForMatch, type Match } from "@/data/matches"
import { getResult, type MatchResult } from "@/lib/matchResults"
import { getKickoff } from "@/lib/matchTime"

// Show matches from yesterday onward (until the bot stamps an FT score). The
// "yesterday" floor handles late-night kickoffs whose local stadium date is
// the day before the next UTC day . e.g. a Guadalajara 8pm match has local
// date June 11 but kicks off at 02:00 UTC on June 12.
function floorDateIso(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

const NAME_ALIASES: Record<string, string> = {
  "USA": "United States", "USMNT": "United States",
  "Korea Republic": "South Korea", "Republic of Korea": "South Korea",
  "Türkiye": "Turkey", "Turkiye": "Turkey",
  "Côte d'Ivoire": "Ivory Coast", "Cote d'Ivoire": "Ivory Coast",
  "Czechia": "Czech Republic", "Cape Verde Islands": "Cape Verde",
  "Curacao": "Curaçao",
}
const canon = (s?: string) => (s ? (NAME_ALIASES[s] ?? s) : "")

function matchEpoch(m: Match): number {
  return new Date(`${m.date}T${m.time}:00Z`).getTime()
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

type LiveData = {
  status: "live" | "halftime"
  homeScore: number
  awayScore: number
  clock?: string                // e.g. "65'", "HT"
}

// Short 3-letter team code . falls back to first 3 letters of the name.
function teamCode(name: string): string {
  const SPECIAL: Record<string, string> = {
    "United States": "USA", "South Korea": "KOR", "South Africa": "RSA",
    "Czech Republic": "CZE", "Bosnia and Herzegovina": "BIH",
    "Saudi Arabia": "KSA", "Ivory Coast": "CIV", "New Zealand": "NZL",
    "Cape Verde": "CPV", "DR Congo": "COD",
  }
  if (SPECIAL[name]) return SPECIAL[name]
  return name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase()
}

function FinishedCard({ m, r }: { m: Match; r: MatchResult }) {
  const k = getKickoff(m)
  const middle = r.status === "PEN" && r.penaltyHome != null
    ? `${r.homeScore}-${r.awayScore} (${r.penaltyHome}-${r.penaltyAway}p)`
    : `${r.homeScore}-${r.awayScore}${r.status === "AET" ? " AET" : ""}`
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      title={`${m.homeTeam} ${r.homeScore}-${r.awayScore} ${m.awayTeam}`}
      className="group block rounded-xl p-3 min-w-[140px] hover:min-w-[230px] flex-shrink-0 text-white hover:-translate-y-0.5 transition-all duration-200 shadow-[0_2px_10px_-4px_rgba(35,22,69,0.35)] overflow-hidden"
      style={{ background: "linear-gradient(135deg, #231645 0%, #4f1ea1 60%, #7E43FF 100%)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/80 px-2 py-0.5 rounded-full bg-white/15">Final</span>
        <span className="text-[10px] text-white/80 tabular-nums">{k.etDateLabel}</span>
      </div>
      {/* Compact (default): team codes on home/away lines, score centered */}
      <div className="group-hover:hidden">
        <div className="text-sm font-bold truncate tabular-nums">{teamCode(m.homeTeam)}</div>
        <div className="text-lg font-extrabold tabular-nums my-0.5 leading-none">{middle}</div>
        <div className="text-sm font-bold truncate tabular-nums">{teamCode(m.awayTeam)}</div>
      </div>
      {/* Expanded (on hover): full team names */}
      <div className="hidden group-hover:block">
        <div className="text-sm font-bold truncate">{m.homeTeam}</div>
        <div className="text-lg font-extrabold tabular-nums my-0.5 leading-none">{middle}</div>
        <div className="text-sm font-bold truncate">{m.awayTeam}</div>
      </div>
    </Link>
  )
}

function LiveCard({ m, live }: { m: Match; live: LiveData }) {
  const k = getKickoff(m)
  const label = live.status === "halftime" ? "HT" : (live.clock ?? "LIVE")
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl p-3 min-w-[230px] flex-shrink-0 text-white hover:-translate-y-0.5 transition-transform shadow-[0_2px_10px_-4px_rgba(220,38,38,0.45)]"
      style={{ background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #ef4444 100%)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {label}
        </span>
        <span className="text-[10px] text-white/80 tabular-nums">{k.etDateLabel}</span>
      </div>
      <div className="text-sm font-bold truncate">{m.homeTeam}</div>
      <div className="text-lg font-extrabold tabular-nums my-0.5 text-white leading-none">{live.homeScore}-{live.awayScore}</div>
      <div className="text-sm font-bold truncate">{m.awayTeam}</div>
    </Link>
  )
}

function UpcomingCard({ m }: { m: Match }) {
  const k = getKickoff(m)
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl p-3 min-w-[230px] flex-shrink-0 text-[#231645] hover:-translate-y-0.5 transition-transform border border-[#7E43FF]/15 shadow-[0_2px_10px_-4px_rgba(126,67,255,0.25)]"
      style={{ background: "linear-gradient(135deg, #f4ecff 0%, #e8dcff 50%, #d6c2ff 100%)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className="text-[9px] font-extrabold uppercase tracking-widest text-white px-2 py-0.5 rounded-full"
          style={{ background: "#7E43FF" }}
        >
          {m.group ? `Group ${m.group}` : m.round}
        </span>
        <span className="text-[10px] text-[#4f1ea1] font-semibold tabular-nums">{k.etDateLabel}</span>
      </div>
      <div className="text-sm font-bold truncate">{m.homeTeam}</div>
      <div className="text-sm font-extrabold my-0.5 text-[#231645] leading-tight tabular-nums">
        {k.etTime} ET
        {!k.isSameAsEt && (
          <span className="text-[10px] font-semibold text-[#615E6E] ml-1.5">({k.localTime} {k.localLabel})</span>
        )}
      </div>
      <div className="text-sm font-bold truncate">{m.awayTeam}</div>
    </Link>
  )
}

type Item =
  | { kind: "done"; m: Match; r: MatchResult }
  | { kind: "next"; m: Match }

export default function LiveStrip() {
  // Compute the static set of cards once. Includes any match whose date is
  // today or later AND has no final result yet . that way in-progress matches
  // (Mexico vs SAF at 1pm ET) still show up before the bot stamps an FT score.
  const items = useMemo<Item[]>(() => {
    const today = floorDateIso()
    const finished: Item[] = []
    const upcoming: Item[] = []
    for (const m of matches) {
      if (m.homeTeam === "TBD" || m.awayTeam === "TBD") continue
      const r = getResult(m.id)
      const isFinal = r && (r.status === "FT" || r.status === "AET" || r.status === "PEN")
      if (isFinal) {
        finished.push({ kind: "done", m, r })
      } else if (m.date >= today) {
        upcoming.push({ kind: "next", m })
      }
    }
    finished.sort((a, b) => matchEpoch(a.m) - matchEpoch(b.m))
    upcoming.sort((a, b) => matchEpoch(a.m) - matchEpoch(b.m))
    return [...finished, ...upcoming.slice(0, 8)]
  }, [])

  // Map of matchId -> LiveData populated by the polling effect.
  const [liveById, setLiveById] = useState<Record<string, LiveData>>({})

  useEffect(() => {
    if (items.length === 0) return
    // Build a lookup of our match ids by (date,homeName,awayName) for ESPN map.
    const byKey = new Map<string, string>()
    for (const it of items) {
      const k = `${it.m.date}|${canon(it.m.homeTeam)}|${canon(it.m.awayTeam)}`
      byKey.set(k, it.m.id)
    }
    let cancelled = false
    async function poll() {
      const today = new Date().toISOString().slice(0, 10).replaceAll("-", "")
      try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${today}`, { cache: "no-store" })
        if (!res.ok) return
        const json = await res.json()
        const live: Record<string, LiveData> = {}
        for (const ev of json.events ?? []) {
          const comp = ev.competitions?.[0]
          if (!comp) continue
          const home = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "home")
          const away = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "away")
          if (!home || !away) continue
          const statusName = comp.status?.type?.name ?? ""
          let liveStatus: LiveData["status"] | null = null
          if (statusName === "STATUS_HALFTIME") liveStatus = "halftime"
          else if (
            statusName === "STATUS_IN_PROGRESS" ||
            statusName === "STATUS_FIRST_HALF" ||
            statusName === "STATUS_SECOND_HALF" ||
            statusName === "STATUS_END_PERIOD" ||
            statusName === "STATUS_OVERTIME" ||
            statusName === "STATUS_END_EXTRA_TIME_PERIOD"
          ) liveStatus = "live"
          if (!liveStatus) continue
          const dateIso = ev.date?.slice(0, 10) ?? ""
          const k = `${dateIso}|${canon(home.team?.displayName)}|${canon(away.team?.displayName)}`
          const id = byKey.get(k)
          if (!id) continue
          live[id] = {
            status: liveStatus,
            homeScore: parseInt(home.score ?? "0", 10),
            awayScore: parseInt(away.score ?? "0", 10),
            clock: comp.status?.displayClock ? `${comp.status.displayClock}'` : undefined,
          }
        }
        if (!cancelled) setLiveById(live)
      } catch {
        // network errors fail silently . next poll will retry
      }
    }
    poll()
    const id = setInterval(poll, 30_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [items])

  // Carousel ref + arrows.
  const railRef = useRef<HTMLDivElement | null>(null)
  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * 240, behavior: "smooth" })
  }

  // Collapse older Final cards into a "+N more" toggle. We always keep the
  // 5 most recent finals visible; everything before that is hidden until
  // the user opts in.
  const [showAllFinals, setShowAllFinals] = useState(false)
  const finalsTotal = items.filter((it) => it.kind === "done").length
  const FINALS_VISIBLE = 5

  // On mount/data change, position the rail so the latest FT card is right
  // at the visible region (instead of the leftmost = oldest FT card). Fans
  // care about what just finished + what's next, not three matches ago.
  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const visibleFinals = Math.min(finalsTotal, FINALS_VISIBLE)
    const cardWidth = 153 // 140 min-width + 12 gap
    el.scrollLeft = Math.max(0, (visibleFinals - 2) * cardWidth)
  }, [finalsTotal])
  const hiddenFinalsCount = Math.max(0, finalsTotal - FINALS_VISIBLE)
  const visibleItems = useMemo(() => {
    if (showAllFinals || hiddenFinalsCount === 0) return items
    // Hide the EARLIEST finals (oldest first), keep the most recent ones near
    // the live/upcoming cards so the rail flows oldest → newest → next up.
    const finalsToHide = hiddenFinalsCount
    let skipped = 0
    return items.filter((it) => {
      if (it.kind !== "done") return true
      if (skipped < finalsToHide) { skipped++; return false }
      return true
    })
  }, [items, showAllFinals, hiddenFinalsCount])

  if (items.length === 0) return null

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 pt-4">
      <div className="relative">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 -translate-x-full z-20 w-9 h-9 rounded-full bg-white shadow-[0_4px_14px_rgba(35,22,69,0.28)] border border-black/[0.06] items-center justify-center text-[#231645] hover:text-[#7E43FF] hover:scale-105 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 translate-x-full z-20 w-9 h-9 rounded-full bg-white shadow-[0_4px_14px_rgba(35,22,69,0.28)] border border-black/[0.06] items-center justify-center text-[#231645] hover:text-[#7E43FF] hover:scale-105 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div ref={railRef} className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 snap-x">
          {hiddenFinalsCount > 0 && (
            <button
              onClick={() => setShowAllFinals((v) => !v)}
              className="snap-start flex-shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-[#231645] bg-white border border-black/[0.08] hover:bg-[#faf9fe] transition-colors min-w-[110px]"
            >
              {showAllFinals ? "Hide older" : `+${hiddenFinalsCount} earlier`}
            </button>
          )}
          {visibleItems.map((it) => {
            const live = liveById[it.m.id]
            if (live) {
              return (
                <div key={`l-${it.m.id}`} className="snap-start">
                  <LiveCard m={it.m} live={live} />
                </div>
              )
            }
            return it.kind === "done" ? (
              <div key={`d-${it.m.id}`} className="snap-start">
                <FinishedCard m={it.m} r={it.r} />
              </div>
            ) : (
              <div key={`n-${it.m.id}`} className="snap-start">
                <UpcomingCard m={it.m} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
