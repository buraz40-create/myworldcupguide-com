import type { Match } from "@/data/matches"

// UTC offsets (in hours) for June/July 2026 for each WC 2026 host city.
// USA and Canada are on DST in June (so ET=UTC-4, CT=UTC-5, PT=UTC-7).
// Mexico abolished DST in 2022 - all Mexican host cities are CST UTC-6 year-round.
const CITY_OFFSET: Record<string, number> = {
  // USA Eastern
  "new-york-new-jersey": -4,
  "miami": -4,
  "boston": -4,
  "philadelphia": -4,
  "atlanta": -4,
  // USA Central
  "dallas": -5,
  "kansas-city": -5,
  "houston": -5,
  // USA Pacific
  "los-angeles": -7,
  "san-francisco-bay-area": -7,
  "seattle": -7,
  // Mexico (no DST)
  "guadalajara": -6,
  "mexico-city": -6,
  "monterrey": -6,
  // Canada
  "toronto": -4,
  "vancouver": -7,
}

// Short label for the local-time city (matches the offset above).
const CITY_LOCAL_LABEL: Record<string, string> = {
  "new-york-new-jersey": "ET", "miami": "ET", "boston": "ET",
  "philadelphia": "ET", "atlanta": "ET", "toronto": "ET",
  "dallas": "CT", "kansas-city": "CT", "houston": "CT",
  "los-angeles": "PT", "san-francisco-bay-area": "PT",
  "seattle": "PT", "vancouver": "PT",
  "guadalajara": "CST", "mexico-city": "CST", "monterrey": "CST",
}

const ET_OFFSET = -4 // June/July 2026

function fmt12(h: number, mm: number): string {
  const am = h < 12
  let hh = h % 12
  if (hh === 0) hh = 12
  const minute = mm.toString().padStart(2, "0")
  return `${hh}:${minute} ${am ? "AM" : "PM"}`
}

// Returns "Thu, Jun 11" using ET-local calendar date for the kickoff.
function formatEtDate(epochMs: number): string {
  // Add ET_OFFSET hours by treating UTC date adjusted by offset.
  const shifted = new Date(epochMs + ET_OFFSET * 3600 * 1000)
  return shifted.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  })
}

export type KickoffDisplay = {
  etDateLabel: string       // "Thu, Jun 11"
  etTime: string            // "10:00 PM"
  localTime: string         // "8:00 PM"
  localLabel: string        // "CST" / "ET" / etc
  isSameAsEt: boolean       // hide redundant local pill if stadium IS in ET
}

export function getKickoff(m: Match): KickoffDisplay {
  const cityOffset = CITY_OFFSET[m.citySlug] ?? ET_OFFSET
  const localLabel = CITY_LOCAL_LABEL[m.citySlug] ?? "local"
  const [hh, mm] = m.time.split(":").map((n) => parseInt(n, 10))
  // Build the absolute UTC moment by subtracting the local offset.
  // localOffset is e.g. -6 (CST). Local 20:00 = UTC 26:00 (next day 02:00).
  // UTC = local - offset (offset is negative for Western hemispheres).
  const localMs = Date.UTC(
    parseInt(m.date.slice(0, 4), 10),
    parseInt(m.date.slice(5, 7), 10) - 1,
    parseInt(m.date.slice(8, 10), 10),
    hh, mm,
  )
  const utcMs = localMs - cityOffset * 3600 * 1000
  // ET time: add ET_OFFSET hours
  const etDate = new Date(utcMs + ET_OFFSET * 3600 * 1000)
  const etHours = etDate.getUTCHours()
  const etMinutes = etDate.getUTCMinutes()
  return {
    etDateLabel: formatEtDate(utcMs),
    etTime: fmt12(etHours, etMinutes),
    localTime: fmt12(hh, mm),
    localLabel,
    isSameAsEt: cityOffset === ET_OFFSET,
  }
}
