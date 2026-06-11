"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { matches, slugForMatch, type Match } from "@/data/matches"
import { getResult, type MatchResult } from "@/lib/matchResults"

// Build-time NOW for the initial finished/upcoming split. Real wall-clock on
// the client only affects the live poller, not which cards appear.
const BUILD_NOW = new Date(process.env.BUILD_TIME ?? Date.now()).getTime()

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

function FinishedCard({ m, r }: { m: Match; r: MatchResult }) {
  const score = r.status === "PEN" && r.penaltyHome != null
    ? `${r.homeScore}-${r.awayScore} (${r.penaltyHome}-${r.penaltyAway} p)`
    : `${r.homeScore}-${r.awayScore}${r.status === "AET" ? " (AET)" : ""}`
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl p-3 min-w-[210px] flex-shrink-0 text-white hover:-translate-y-0.5 transition-transform shadow-[0_2px_10px_-4px_rgba(35,22,69,0.35)]"
      style={{ background: "linear-gradient(135deg, #231645 0%, #4f1ea1 60%, #7E43FF 100%)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/70">Final</span>
        <span className="text-[10px] text-white/70 tabular-nums">{formatDate(m.date)}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold truncate">{m.homeTeam}</span>
        <span className="text-sm font-extrabold tabular-nums whitespace-nowrap">{score}</span>
      </div>
      <div className="text-sm font-semibold truncate">{m.awayTeam}</div>
    </Link>
  )
}

function LiveCard({ m, live }: { m: Match; live: LiveData }) {
  const label = live.status === "halftime" ? "HT" : (live.clock ?? "LIVE")
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl p-3 min-w-[210px] flex-shrink-0 text-white hover:-translate-y-0.5 transition-transform shadow-[0_2px_10px_-4px_rgba(220,38,38,0.45)]"
      style={{ background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #ef4444 100%)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {label}
        </span>
        <span className="text-[10px] text-white/80 tabular-nums">{formatDate(m.date)}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold truncate">{m.homeTeam}</span>
        <span className="text-sm font-extrabold tabular-nums whitespace-nowrap">{live.homeScore}-{live.awayScore}</span>
      </div>
      <div className="text-sm font-semibold truncate">{m.awayTeam}</div>
    </Link>
  )
}

function UpcomingCard({ m }: { m: Match }) {
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl p-3 min-w-[210px] flex-shrink-0 text-[#231645] hover:-translate-y-0.5 transition-transform border border-[#7E43FF]/15 shadow-[0_2px_10px_-4px_rgba(126,67,255,0.25)]"
      style={{ background: "linear-gradient(135deg, #f4ecff 0%, #e8dcff 50%, #d6c2ff 100%)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className="text-[9px] font-extrabold uppercase tracking-widest text-white px-2 py-0.5 rounded-full"
          style={{ background: "#7E43FF" }}
        >
          {m.group ? `Group ${m.group}` : m.round}
        </span>
        <span className="text-[10px] text-[#4f1ea1] font-semibold tabular-nums">{formatDate(m.date)} · {m.time}</span>
      </div>
      <div className="text-sm font-bold truncate">{m.homeTeam}</div>
      <div className="text-[10px] text-[#615E6E] my-0.5 font-bold">vs</div>
      <div className="text-sm font-bold truncate">{m.awayTeam}</div>
    </Link>
  )
}

type Item =
  | { kind: "done"; m: Match; r: MatchResult }
  | { kind: "next"; m: Match }

export default function LiveStrip() {
  // Compute the static set of cards once, from build-time data.
  const items = useMemo<Item[]>(() => {
    const finished: Item[] = []
    const upcoming: Item[] = []
    for (const m of matches) {
      if (m.homeTeam === "TBD" || m.awayTeam === "TBD") continue
      const r = getResult(m.id)
      if (r && (r.status === "FT" || r.status === "AET" || r.status === "PEN")) {
        finished.push({ kind: "done", m, r })
      } else if (matchEpoch(m) >= BUILD_NOW) {
        upcoming.push({ kind: "next", m })
      }
    }
    finished.sort((a, b) => matchEpoch(b.m) - matchEpoch(a.m))
    upcoming.sort((a, b) => matchEpoch(a.m) - matchEpoch(b.m))
    return [...finished.slice(0, 4), ...upcoming.slice(0, 8)]
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
          if (statusName === "STATUS_IN_PROGRESS") liveStatus = "live"
          else if (statusName === "STATUS_HALFTIME") liveStatus = "halftime"
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

  // Carousel ref + arrows
  const railRef = useRef<HTMLDivElement | null>(null)
  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * 240, behavior: "smooth" })
  }

  if (items.length === 0) return null

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 pt-4">
      <div className="relative">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(35,22,69,0.18)] border border-black/[0.06] items-center justify-center text-[#231645] hover:text-[#7E43FF] hover:scale-105 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(35,22,69,0.18)] border border-black/[0.06] items-center justify-center text-[#231645] hover:text-[#7E43FF] hover:scale-105 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div ref={railRef} className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 snap-x">
          {items.map((it) => {
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
