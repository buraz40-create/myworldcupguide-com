"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

export type CompareRow = {
  slug: string
  name: string
  cityName: string
  citySlug: string
  country: "USA" | "Canada" | "Mexico"
  capacity: number
  surface: string
  roof: "Open" | "Retractable" | "Closed"
  opened: number
  wcMatches: number
  rounds: string         // pre-joined for display
  topTransit: string     // first item from closestTransit
  fifaUrl?: string
}

type SortKey =
  | "name"
  | "cityName"
  | "country"
  | "capacity"
  | "surface"
  | "roof"
  | "opened"
  | "wcMatches"
type SortDir = "asc" | "desc"

const COUNTRY_FLAG: Record<string, string> = { USA: "🇺🇸", Canada: "🇨🇦", Mexico: "🇲🇽" }

export default function StadiumCompareTable({ rows }: { rows: CompareRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("capacity")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [country, setCountry] = useState<"All" | "USA" | "Canada" | "Mexico">("All")
  const [roof, setRoof] = useState<"All" | "Open" | "Retractable" | "Closed">("All")

  const filteredSorted = useMemo(() => {
    let xs = rows
    if (country !== "All") xs = xs.filter((r) => r.country === country)
    if (roof !== "All") xs = xs.filter((r) => r.roof === roof)
    const dir = sortDir === "asc" ? 1 : -1
    return [...xs].sort((a, b) => {
      const av = a[sortKey] as number | string
      const bv = b[sortKey] as number | string
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [rows, sortKey, sortDir, country, roof])

  function changeSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir(key === "capacity" || key === "wcMatches" || key === "opened" ? "desc" : "asc")
    }
  }

  function SortBtn({ k, label, right = false }: { k: SortKey; label: string; right?: boolean }) {
    const active = sortKey === k
    return (
      <button
        onClick={() => changeSort(k)}
        className={`inline-flex items-center gap-1 ${right ? "flex-row-reverse" : ""}`}
        style={{ color: active ? "#231645" : "#615E6E" }}
      >
        <span className="font-bold uppercase tracking-widest text-[10px]">{label}</span>
        <span className="text-[9px]">{active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 px-1">
        <FilterGroup label="Country">
          {(["All", "USA", "Canada", "Mexico"] as const).map((c) => (
            <FilterBtn key={c} active={country === c} onClick={() => setCountry(c)}>
              {c === "All" ? "All" : `${COUNTRY_FLAG[c]} ${c}`}
            </FilterBtn>
          ))}
        </FilterGroup>
        <FilterGroup label="Roof">
          {(["All", "Open", "Retractable", "Closed"] as const).map((r) => (
            <FilterBtn key={r} active={roof === r} onClick={() => setRoof(r)}>{r}</FilterBtn>
          ))}
        </FilterGroup>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8f7fd] border-b border-black/[0.06]">
              <th className="text-left px-4 py-3"><SortBtn k="name" label="Stadium" /></th>
              <th className="text-left px-3 py-3"><SortBtn k="cityName" label="City" /></th>
              <th className="text-left px-3 py-3"><SortBtn k="country" label="Country" /></th>
              <th className="text-right px-3 py-3"><SortBtn k="capacity" label="Capacity" right /></th>
              <th className="text-left px-3 py-3"><SortBtn k="surface" label="Surface" /></th>
              <th className="text-left px-3 py-3"><SortBtn k="roof" label="Roof" /></th>
              <th className="text-right px-3 py-3"><SortBtn k="opened" label="Opened" right /></th>
              <th className="text-right px-3 py-3"><SortBtn k="wcMatches" label="WC Matches" right /></th>
              <th className="text-left px-3 py-3 min-w-[260px]"><span className="font-bold uppercase tracking-widest text-[10px] text-[#615E6E]">Closest transit</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((r) => (
              <tr key={r.slug} className="border-b border-black/[0.04] hover:bg-[#f8f7fd]/60">
                <td className="px-4 py-3">
                  <Link href={`/stadiums/${r.slug}/`} className="font-semibold text-[#231645] hover:text-[#7E43FF] transition-colors">
                    {r.name}
                  </Link>
                  <div className="text-[10px] text-[#615E6E] mt-0.5">{r.rounds}</div>
                </td>
                <td className="px-3 py-3 text-[#615E6E]">
                  <Link href={`/cities/${r.citySlug}/`} className="hover:text-[#231645]">{r.cityName}</Link>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">{COUNTRY_FLAG[r.country]} {r.country}</td>
                <td className="px-3 py-3 text-right tabular-nums font-bold">{r.capacity.toLocaleString()}</td>
                <td className="px-3 py-3 text-[#615E6E]">{r.surface}</td>
                <td className="px-3 py-3"><RoofBadge value={r.roof} /></td>
                <td className="px-3 py-3 text-right tabular-nums">{r.opened}</td>
                <td className="px-3 py-3 text-right tabular-nums">{r.wcMatches}</td>
                <td className="px-3 py-3 text-xs text-[#615E6E]">{r.topTransit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[#615E6E]">
        Showing {filteredSorted.length} of {rows.length} venues. Click any column header to sort.
      </p>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">{label}</span>
      <div className="flex gap-1">{children}</div>
    </div>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all border"
      style={
        active
          ? { background: "#231645", color: "#fff", borderColor: "#231645" }
          : { background: "#fff", color: "#615E6E", borderColor: "rgba(0,0,0,0.08)" }
      }
    >
      {children}
    </button>
  )
}

function RoofBadge({ value }: { value: "Open" | "Retractable" | "Closed" }) {
  const style: Record<typeof value, { bg: string; fg: string }> = {
    Open:        { bg: "#3b82f615", fg: "#1d4ed8" },
    Retractable: { bg: "#f59e0b15", fg: "#b45309" },
    Closed:      { bg: "#10b98115", fg: "#047857" },
  }
  const s = style[value]
  return (
    <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}>
      {value}
    </span>
  )
}
