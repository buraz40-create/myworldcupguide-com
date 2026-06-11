"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { matches as ALL_MATCHES, slugForMatch, type Match } from "@/data/matches"
import { cities } from "@/data/cities"

const cityMap = new Map(cities.map((c) => [c.slug, c]))

// Live ticket data shape . written by /tickets-fetch.php on a cron, sourced
// from SeatSidekick's open /api/matches endpoint. Match number is the join key.
type TicketStat = {
  seats: number
  priceMin: number | null
  priceMed: number | null
  priceMax: number | null
}
type TicketsData = {
  updated: string
  currency: string
  totalSeats: number
  totalMatches: number
  matchesWithSeats: number
  sourceScannedAt: string | null
  matches: Record<string, TicketStat>
}

function formatPrice(n: number, currency = "CAD"): string {
  const symbol = currency === "CAD" ? "C$" : currency === "USD" ? "$" : currency + " "
  return symbol + Math.round(n).toLocaleString("en-US")
}

function relativeAge(iso: string): string {
  const sec = (Date.now() - new Date(iso).getTime()) / 1000
  if (sec < 60)    return "just now"
  if (sec < 3600)  return `${Math.round(sec / 60)}m ago`
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`
  return `${Math.round(sec / 86400)}d ago`
}

type Stage = "all" | "Group Stage" | "knockouts" | "Final"
type Host = "all" | "USA" | "Mexico" | "Canada"
type SortKey = "match" | "date"

function isKnockout(round: Match["round"]): boolean {
  return round !== "Group Stage" && round !== "Final"
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

function formatRoundBadge(round: Match["round"]): string {
  switch (round) {
    case "Group Stage":  return "GROUP"
    case "Round of 32":  return "R32"
    case "Round of 16":  return "R16"
    case "Quarterfinal": return "QF"
    case "Semi-final":   return "SF"
    case "3rd Place":    return "3RD"
    case "Final":        return "FINAL"
  }
}

// Build a "buy tickets" affiliate URL for a specific match.
// FIFA's official portal is the legitimate primary source.
// Resale links go through Viagogo's search by team names . these convert to
// affiliate-tracked URLs the moment Viagogo/StubHub IDs are plugged in.
function fifaTicketsUrl(): string {
  return "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026/tickets"
}

function viagogoSearchUrl(m: Match): string {
  const home = m.homeTeam === "TBD" ? "" : m.homeTeam
  const away = m.awayTeam === "TBD" ? "" : m.awayTeam
  const city = cityMap.get(m.citySlug)?.name ?? ""
  const term = home && away ? `${home} vs ${away}` : `2026 World Cup ${city}`
  return `https://www.viagogo.com/?searchTerm=${encodeURIComponent(term)}`
}

export default function MatchTickets() {
  const [search, setSearch] = useState("")
  const [stage, setStage] = useState<Stage>("all")
  const [host, setHost] = useState<Host>("all")
  const [sortBy, setSortBy] = useState<SortKey>("match")
  const [tickets, setTickets] = useState<TicketsData | null>(null)

  useEffect(() => {
    fetch("/data/tickets.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: TicketsData | null) => setTickets(d))
      .catch(() => setTickets(null))
  }, [])

  const filtered = useMemo(() => {
    let list: Match[] = ALL_MATCHES

    if (stage === "Group Stage") list = list.filter((m) => m.round === "Group Stage")
    else if (stage === "knockouts") list = list.filter((m) => isKnockout(m.round))
    else if (stage === "Final") list = list.filter((m) => m.round === "Final")

    if (host !== "all") {
      list = list.filter((m) => cityMap.get(m.citySlug)?.country === host)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((m) => {
        const cityName = cityMap.get(m.citySlug)?.name.toLowerCase() ?? ""
        return (
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          cityName.includes(q)
        )
      })
    }

    if (sortBy === "match") {
      list = [...list].sort((a, b) => a.matchNumber - b.matchNumber)
    } else if (sortBy === "date") {
      list = [...list].sort((a, b) => a.date.localeCompare(b.date) || a.matchNumber - b.matchNumber)
    }

    return list
  }, [search, stage, host, sortBy])

  return (
    <section
      className="rounded-3xl mb-14 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6f4ff 0%, #ede7ff 60%, #ddd0ff 100%)",
        border: "1px solid rgba(126,67,255,0.18)",
      }}
      aria-label="World Cup 2026 match ticket tracker"
    >
      {/* Hero */}
      <div className="px-6 md:px-10 pt-8 md:pt-12 pb-6 text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-3">
          2026 FIFA World Cup · Match Tracker
        </p>
        <h2 className="text-3xl md:text-5xl font-extrabold text-[#231645] leading-tight mb-3">
          Every match. <span className="text-[#7E43FF]">One page.</span>
        </h2>
        <p className="text-[#615E6E] text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          All 104 World Cup matches, sortable and filterable by city, stage, and team.
          Buy direct from FIFA or compare resale prices via trusted partners.
        </p>

        {/* Stat row . when tickets data is loaded, lead with live seat count */}
        {tickets && tickets.totalSeats > 0 ? (
          <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto mt-7">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#7E43FF] leading-none">
                {tickets.totalSeats.toLocaleString("en-US")}
              </p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] mt-1">Resale Seats</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#7E43FF] leading-none">104</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] mt-1">Matches</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#7E43FF] leading-none">{tickets.matchesWithSeats}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] mt-1">With Inventory</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mt-7">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#7E43FF] leading-none">104</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] mt-1">Matches</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#7E43FF] leading-none">16</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] mt-1">Cities</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#7E43FF] leading-none">3</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] mt-1">Countries</p>
            </div>
          </div>
        )}

        {tickets && (
          <p className="text-[10px] text-[#615E6E] mt-4 leading-relaxed">
            Live resale inventory updated {relativeAge(tickets.updated)} · Prices in {tickets.currency} · Data via SeatSidekick
          </p>
        )}

        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          <a
            href={fifaTicketsUrl()}
            target="_blank"
            rel="noopener"
            className="btn-primary text-sm whitespace-nowrap"
          >
            Buy on FIFA.com →
          </a>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-y border-black/[0.06] px-4 md:px-6 py-4">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or cities…"
            className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] bg-[#fbfaff] text-sm text-[#231645] placeholder:text-[#615E6E] focus:outline-none focus:border-[#7E43FF] focus:ring-2 focus:ring-[#7E43FF]/20"
          />

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <FilterGroup
              label="Sort"
              options={[
                { v: "match", l: "Match" },
                { v: "date",  l: "Date" },
              ]}
              value={sortBy}
              onChange={(v) => setSortBy(v as SortKey)}
            />
            <FilterGroup
              label="Stage"
              options={[
                { v: "all",         l: "All" },
                { v: "Group Stage", l: "Group" },
                { v: "knockouts",   l: "Knockouts" },
                { v: "Final",       l: "Final" },
              ]}
              value={stage}
              onChange={(v) => setStage(v as Stage)}
            />
            <FilterGroup
              label="Host"
              options={[
                { v: "all",    l: "All" },
                { v: "USA",    l: "USA" },
                { v: "Mexico", l: "Mexico" },
                { v: "Canada", l: "Canada" },
              ]}
              value={host}
              onChange={(v) => setHost(v as Host)}
            />
          </div>
        </div>
      </div>

      {/* Match list */}
      <div className="bg-white">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[#615E6E] py-12">
            No matches found. Try clearing filters or checking your search.
          </p>
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {filtered.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                stat={tickets?.matches[String(m.matchNumber)]}
                currency={tickets?.currency ?? "CAD"}
              />
            ))}
          </ul>
        )}
        <div className="px-4 md:px-6 py-3 text-[10px] text-[#615E6E] border-t border-black/[0.04] flex items-center justify-between flex-wrap gap-2">
          <span>Showing {filtered.length} of {ALL_MATCHES.length} matches</span>
          <span>Tickets sell only via FIFA.com. Resale buyers, watch out for scams.</span>
        </div>
      </div>
    </section>
  )
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { v: T; l: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-extrabold uppercase tracking-widest text-[#615E6E] text-[10px]">{label}:</span>
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            value === o.v
              ? "bg-[#7E43FF] text-white"
              : "bg-[#f8f7fd] text-[#615E6E] hover:bg-[#e9e3ff] hover:text-[#231645]"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  )
}

function MatchRow({
  match: m,
  stat,
  currency,
}: {
  match: Match
  stat?: TicketStat
  currency: string
}) {
  const city = cityMap.get(m.citySlug)
  const matchSlug = slugForMatch(m)
  const detailHref = `/matches/${matchSlug}/#tickets`
  const teams = m.homeTeam === "TBD" ? "TBD vs TBD" : `${m.homeTeam} vs ${m.awayTeam}`
  const hasInventory = stat && stat.seats > 0

  return (
    <li className="px-4 md:px-6 py-3 flex items-center gap-3 hover:bg-[#fbfaff] transition-colors">
      {/* Match number */}
      <span className="font-extrabold text-[#7E43FF] text-xs w-10 flex-shrink-0">
        M{String(m.matchNumber).padStart(2, "0")}
      </span>

      {/* Teams + meta */}
      <Link href={detailHref} className="flex-1 min-w-0 group">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-[#231645] text-sm group-hover:text-[#7E43FF] transition-colors truncate">
            {teams}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] bg-[#f8f7fd] px-2 py-0.5 rounded">
            {formatRoundBadge(m.round)}
            {m.group ? ` · ${m.group}` : ""}
          </span>
        </div>
        <p className="text-[11px] text-[#615E6E] mt-0.5">
          {city?.name ?? m.citySlug} · {formatShortDate(m.date)} · {m.time}
        </p>
      </Link>

      {/* Live ticket data column (renders only when fetched) */}
      {stat && (
        <div className="hidden sm:flex flex-col items-end text-right flex-shrink-0 mr-1 min-w-[110px]">
          {hasInventory && stat.priceMin ? (
            <>
              <p className="text-xs font-extrabold text-[#231645] leading-none">
                from {formatPrice(stat.priceMin, currency)}
              </p>
              <p className="text-[10px] text-[#615E6E] mt-1">
                {stat.seats.toLocaleString("en-US")} {stat.seats === 1 ? "seat" : "seats"}
              </p>
            </>
          ) : (
            <p className="text-[10px] text-[#615E6E] italic">No resale inventory yet</p>
          )}
        </div>
      )}

      {/* CTA . opens match detail page where 5 vendor options live */}
      <Link
        href={detailHref}
        className="text-xs font-extrabold text-white bg-[#7E43FF] hover:bg-[#6a30e6] transition-colors px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
      >
        Tickets →
      </Link>
    </li>
  )
}
