"use client"

import { useMemo, useState } from "react"
import {
  affordability,
  byAffordability,
  groupTripCost,
  monthsOfSalary,
  flagClass,
  confederations,
  HOTEL_PER_NIGHT,
  GROUP_HOTEL_NIGHTS,
  GROUP_TICKETS,
  type AffordabilityRow,
  type Confederation,
} from "@/data/affordability"

const usd = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US")

const months = (n: number) => n.toFixed(2) + "×"

// Color scale: green (cheap) → amber → red (expensive), by months of salary.
function affordabilityColor(m: number): string {
  if (m < 1) return "#10b981"
  if (m < 2) return "#84cc16"
  if (m < 4) return "#eab308"
  if (m < 8) return "#f59e0b"
  if (m < 15) return "#ef4444"
  return "#b91c1c"
}

type View = "table" | "cards"
type SortKey = "months" | "salary" | "trip"

export default function AffordabilityClient() {
  const [view, setView] = useState<View>("table")
  const [conf, setConf] = useState<Confederation | "all">("all")
  const [sort, setSort] = useState<SortKey>("months")

  const ranked = useMemo(() => byAffordability(), [])
  // Rank (1 = most affordable) is fixed across the full field, independent of filters.
  const rankOf = useMemo(() => {
    const m = new Map<string, number>()
    ranked.forEach((r, i) => m.set(r.iso3, i + 1))
    return m
  }, [ranked])

  const maxMonths = useMemo(
    () => Math.max(...affordability.map(monthsOfSalary)),
    [],
  )

  const rows = useMemo(() => {
    let r = [...affordability]
    if (conf !== "all") r = r.filter((x) => x.confederation === conf)
    r.sort((a, b) => {
      if (sort === "salary") return b.monthlySalary - a.monthlySalary
      if (sort === "trip") return groupTripCost(a) - groupTripCost(b)
      return monthsOfSalary(a) - monthsOfSalary(b)
    })
    return r
  }, [conf, sort])

  // Headline stats (full field, unfiltered).
  const stats = useMemo(() => {
    const cheapest = ranked[0]
    const priciest = ranked[ranked.length - 1]
    const avgSalary =
      affordability.reduce((s, r) => s + r.monthlySalary, 0) / affordability.length
    const avgTrip =
      affordability.reduce((s, r) => s + groupTripCost(r), 0) / affordability.length
    const avgMonths =
      affordability.reduce((s, r) => s + monthsOfSalary(r), 0) / affordability.length
    return { cheapest, priciest, avgSalary, avgTrip, avgMonths }
  }, [ranked])

  return (
    <div>
      {/* ── Headline stats ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Nations ranked" value="48" sub="every World Cup team" />
        <StatCard
          label="Most affordable"
          value={stats.cheapest.team}
          sub={`${months(monthsOfSalary(stats.cheapest))} a month's pay`}
          flag={stats.cheapest.iso3}
          accent="#10b981"
        />
        <StatCard
          label="Least affordable"
          value={stats.priciest.team}
          sub={`${months(monthsOfSalary(stats.priciest))} a month's pay`}
          flag={stats.priciest.iso3}
          accent="#ef4444"
        />
        <StatCard
          label="Average group trip"
          value={usd(stats.avgTrip)}
          sub={`${stats.avgMonths.toFixed(1)}× the average monthly wage`}
        />
      </section>

      {/* ── Controls ── */}
      <div className="flex flex-col gap-4 mb-6">
        {/* View toggle + sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-[#f5f4fa] p-1">
            {(["table", "cards"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${
                  view === v ? "bg-white text-[#231645] shadow-sm" : "text-[#615E6E]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-[#615E6E]">
            <span className="font-semibold">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-[#231645]"
            >
              <option value="months">Months of salary</option>
              <option value="trip">Trip cost (low to high)</option>
              <option value="salary">Monthly salary (high to low)</option>
            </select>
          </label>
        </div>

        {/* Confederation filter */}
        <div className="flex flex-wrap gap-2">
          <FilterPill active={conf === "all"} onClick={() => setConf("all")}>
            All
          </FilterPill>
          {confederations.map((c) => (
            <FilterPill key={c} active={conf === c} onClick={() => setConf(c)}>
              {c}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* ── Data ── */}
      {view === "table" ? (
        <Table rows={rows} rankOf={rankOf} maxMonths={maxMonths} />
      ) : (
        <Cards rows={rows} rankOf={rankOf} />
      )}

      {/* ── Methodology ── */}
      <Methodology />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  flag,
  accent,
}: {
  label: string
  value: string
  sub: string
  flag?: string
  accent?: string
}) {
  return (
    <div className="card p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {flag && <span className={flagClass(flag)} style={{ fontSize: "1.3em" }} aria-hidden />}
        <p
          className="text-xl font-extrabold leading-tight"
          style={{ color: accent ?? "#231645" }}
        >
          {value}
        </p>
      </div>
      <p className="text-xs text-[#615E6E] mt-1 leading-snug">{sub}</p>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
        active
          ? "bg-[#7E43FF] text-white"
          : "bg-[#f5f4fa] text-[#615E6E] hover:bg-[#ece9f7]"
      }`}
    >
      {children}
    </button>
  )
}

function Table({
  rows,
  rankOf,
  maxMonths,
}: {
  rows: AffordabilityRow[]
  rankOf: Map<string, number>
  maxMonths: number
}) {
  return (
    <div className="card p-0 overflow-x-auto mb-12">
      <table className="w-full text-sm border-collapse min-w-[680px]">
        <thead>
          <tr className="text-left text-[#615E6E] border-b border-black/[0.08]">
            <th scope="col" className="py-3 px-3 font-bold text-xs uppercase tracking-wider">#</th>
            <th scope="col" className="py-3 px-3 font-bold text-xs uppercase tracking-wider">Nation</th>
            <th scope="col" className="py-3 px-3 font-bold text-xs uppercase tracking-wider text-right">Monthly salary</th>
            <th scope="col" className="py-3 px-3 font-bold text-xs uppercase tracking-wider text-right">Flight</th>
            <th scope="col" className="py-3 px-3 font-bold text-xs uppercase tracking-wider text-right">Ticket / game</th>
            <th scope="col" className="py-3 px-3 font-bold text-xs uppercase tracking-wider text-right">Group trip</th>
            <th scope="col" className="py-3 px-3 font-bold text-xs uppercase tracking-wider text-right">Months of pay</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const m = monthsOfSalary(r)
            const color = affordabilityColor(m)
            return (
              <tr key={r.iso3} className="border-b border-black/[0.04] hover:bg-[#faf9fe]">
                <td className="py-3 px-3 tabular-nums font-bold text-[#615E6E]">{rankOf.get(r.iso3)}</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-2">
                    <span className={flagClass(r.iso3)} style={{ fontSize: "1.2em", flexShrink: 0 }} aria-hidden />
                    <span className="font-semibold text-[#231645]">{r.team}</span>
                    <span className="text-[10px] font-bold text-[#615E6E] bg-[#f5f4fa] rounded px-1.5 py-0.5">{r.confederation}</span>
                  </span>
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-[#231645] font-semibold">{usd(r.monthlySalary)}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#615E6E]">{usd(r.returnFlight)}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#615E6E]">{usd(r.ticketPerGame)}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#231645] font-semibold">{usd(groupTripCost(r))}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden sm:block w-20 h-2 rounded-full bg-[#f5f4fa] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, (m / maxMonths) * 100)}%`, background: color }}
                      />
                    </div>
                    <span className="tabular-nums font-extrabold w-14 text-right" style={{ color }}>
                      {months(m)}
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Cards({
  rows,
  rankOf,
}: {
  rows: AffordabilityRow[]
  rankOf: Map<string, number>
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
      {rows.map((r) => {
        const m = monthsOfSalary(r)
        const color = affordabilityColor(m)
        const trip = groupTripCost(r)
        return (
          <div key={r.iso3} className="card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} aria-hidden />
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2 min-w-0">
                <span className={flagClass(r.iso3)} style={{ fontSize: "1.4em", flexShrink: 0 }} aria-hidden />
                <span className="font-extrabold text-[#231645] truncate">{r.team}</span>
              </span>
              <span className="text-[10px] font-bold text-[#615E6E] bg-[#f5f4fa] rounded px-1.5 py-0.5 flex-shrink-0">
                #{rankOf.get(r.iso3)}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-3xl font-extrabold leading-none" style={{ color }}>{months(m)}</span>
              <span className="text-xs text-[#615E6E] font-semibold">a month&apos;s pay</span>
            </div>

            <div className="space-y-1.5 text-sm">
              <Line label="Monthly salary" value={usd(r.monthlySalary)} />
              <Line label="Return flight" value={usd(r.returnFlight)} />
              <Line label={`${GROUP_TICKETS} tickets`} value={usd(GROUP_TICKETS * r.ticketPerGame)} />
              <Line label={`${GROUP_HOTEL_NIGHTS} hotel nights`} value={usd(GROUP_HOTEL_NIGHTS * HOTEL_PER_NIGHT)} />
              <div className="flex justify-between pt-1.5 mt-1.5 border-t border-black/[0.06]">
                <span className="font-bold text-[#231645]">Group trip total</span>
                <span className="font-extrabold text-[#231645] tabular-nums">{usd(trip)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#615E6E]">{label}</span>
      <span className="tabular-nums text-[#231645] font-medium">{value}</span>
    </div>
  )
}

function Methodology() {
  return (
    <section className="rounded-2xl p-6 md:p-8" style={{ background: "#faf9fe", border: "1px solid rgba(126,67,255,0.15)" }}>
      <h2 className="text-xl font-extrabold text-[#231645] mb-3">How we calculate this</h2>
      <p className="text-sm text-[#615E6E] leading-relaxed mb-4">
        The index estimates the cost of one fan following their team through all three group-stage
        matches: a single return flight to a North American hub, three match tickets, and six hotel
        nights. We divide that total by the country&apos;s average net monthly salary to get
        &quot;months of pay.&quot; A score of <span className="font-bold text-[#231645]">1.00×</span>{" "}
        means the trip costs one month&apos;s wages.
      </p>
      <ul className="space-y-2 text-sm text-[#615E6E] leading-relaxed">
        <li><span className="font-bold text-[#231645]">Salaries</span> are average net monthly figures in USD (Numbeo-class data, e.g. Switzerland ~$7,587, USA ~$4,326, Egypt ~$165).</li>
        <li><span className="font-bold text-[#231645]">Flights</span> are typical return economy fares to a US, Canada or Mexico hub from each region.</li>
        <li><span className="font-bold text-[#231645]">Tickets</span> use an expected resale-market average per group match, higher for host nations and big global draws.</li>
        <li><span className="font-bold text-[#231645]">Hotels</span> apply a flat tournament-average rate of {usd(HOTEL_PER_NIGHT)}/night across every nation, so the ranking reflects salary, airfare and ticket demand rather than guessing each team&apos;s host cities.</li>
      </ul>
      <p className="text-xs text-[#615E6E] leading-relaxed mt-4 italic">
        These are estimates for relative comparison between nations, not a precise trip quote. Your
        actual costs depend on booking timing, match cities, and how deep your team runs.
      </p>
    </section>
  )
}
