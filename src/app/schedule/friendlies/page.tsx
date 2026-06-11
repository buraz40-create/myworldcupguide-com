import type { Metadata } from "next"
import Link from "next/link"
import { alternatesFor } from "@/lib/hreflang"
import { friendlies, friendliesByDate, type Friendly } from "@/data/friendlies"
import { teams } from "@/data/teams"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Pre-Tournament Friendlies: Full Schedule",
  description:
    "All international friendlies leading into the 2026 FIFA World Cup. Every match from late May through June 10, kickoff times, both World Cup qualifiers and other nations. Updated daily.",
  keywords: [
    "World Cup 2026 friendlies",
    "international friendlies June 2026",
    "World Cup 2026 warm-up matches",
    "USA vs Senegal friendly",
    "England New Zealand friendly",
    "Germany Finland friendly 2026",
    "Brazil Panama friendly",
    "pre-World Cup friendly schedule",
  ],
  alternates: alternatesFor(`${SITE}/schedule/friendlies/`),
  openGraph: {
    title: "World Cup 2026 Pre-Tournament Friendlies",
    description: "Every international friendly leading into the 2026 World Cup, with kickoff times.",
    url: `${SITE}/schedule/friendlies/`,
    type: "website",
  },
}

// Country → iso2 lookup for flag-icons. Includes both 2026 WC qualified teams
// (sourced from teams.ts) and the non-qualified opponents that appear in
// friendlies (manually mapped).
const ISO2: Record<string, string> = {
  // WC 2026 teams (must match teams.ts naming)
  ...Object.fromEntries(teams.map((t) => [t.name, t.iso2.toLowerCase()])),
  // Non-WC opponents that appear in friendlies
  "India": "in", "Russia": "ru", "Ireland": "ie", "Gambia": "gm", "Andorra": "ad",
  "Nicaragua": "ni", "North Macedonia": "mk", "Iceland": "is", "Singapore": "sg",
  "Mongolia": "mn", "Kosovo": "xk", "Serbia": "rs", "Poland": "pl", "Ukraine": "ua",
  "Finland": "fi", "Malta": "mt", "Bulgaria": "bg", "Montenegro": "me", "Sweden": "se",
  "Costa Rica": "cr", "Belgium": "be", "Madagascar": "mg", "Georgia": "ge",
  "Romania": "ro", "Wales": "gb-wls", "Ghana": "gh", "Philippines": "ph", "Guam": "gu",
  "Kyrgyzstan": "kg", "Kenya": "ke", "Gibraltar": "gi", "British Virgin Islands": "vg",
  "Denmark": "dk", "Albania": "al", "Israel": "il", "Nigeria": "ng",
  "Algeria": "dz", "Luxembourg": "lu", "Italy": "it", "El Salvador": "sv",
  "Dominican Republic": "do", "Cambodia": "kh", "Bhutan": "bt", "Slovenia": "si",
  "Cyprus": "cy", "Northern Ireland": "gb-nir", "Guinea": "gn", "Liechtenstein": "li",
  "Greece": "gr", "Guatemala": "gt", "Hong Kong": "hk", "Thailand": "th", "Kuwait": "kw",
  "Indonesia": "id", "Oman": "om", "Belarus": "by", "Syria": "sy", "Bahrain": "bh",
  "Slovakia": "sk", "San Marino": "sm", "Bangladesh": "bd", "Burkina Faso": "bf",
  "Moldova": "md", "Hungary": "hu", "Azerbaijan": "az", "Bolivia": "bo", "Honduras": "hn",
  "Aruba": "aw", "Venezuela": "ve", "Cayman Islands": "ky", "Armenia": "am",
  "Kazakhstan": "kz", "Trinidad and Tobago": "tt", "Equatorial Guinea": "gq",
  "Comoros": "km", "Myanmar": "mm", "Chile": "cl", "Peru": "pe", "Tunisia": "tn",
  "Türkiye": "tr",
}

function flagClass(team: string): string {
  const iso2 = ISO2[team]
  return iso2 ? `fi fi-${iso2}` : ""
}

const WC_TEAMS = new Set(teams.map((t) => t.name))
function isWcTeam(name: string): boolean {
  return WC_TEAMS.has(name)
}

function formatDate(d: string): string {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })
}

// 24h → 12h display (e.g. "14:30" → "2:30 PM")
function formatTime(t?: string): string {
  if (!t) return "TBD"
  const [hh, mm] = t.split(":")
  const h = parseInt(hh, 10)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${mm} ${ampm}`
}

export default function FriendliesPage() {
  const grouped = friendliesByDate()
  const totalMatches = friendlies.length
  const wcVsWc = friendlies.filter((f) => f.bothWcTeams).length

  // JSON-LD ItemList of all friendly matches.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "2026 FIFA World Cup Pre-Tournament Friendlies",
    description: "International friendly matches in the FIFA window leading up to the 2026 World Cup (late May through June 10, 2026).",
    numberOfItems: totalMatches,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: friendlies.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SportsEvent",
        name: `${f.homeTeam} vs ${f.awayTeam}`,
        startDate: f.time ? `${f.date}T${f.time}:00-04:00` : f.date,
        sport: "Soccer",
        competitor: [
          { "@type": "SportsTeam", name: f.homeTeam },
          { "@type": "SportsTeam", name: f.awayTeam },
        ],
        eventStatus: "https://schema.org/EventScheduled",
      },
    })),
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645]">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/schedule" className="hover:text-[#231645]">Schedule</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Friendlies</span>
        </nav>
        <div className="pill inline-flex mb-3">Pre-Tournament Friendlies</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">
          World Cup 2026 Pre-Tournament Friendlies
        </h1>
        <p className="text-base text-[#615E6E] leading-relaxed max-w-3xl">
          Every international friendly during the FIFA window leading up to kickoff on June 11, 2026. Times shown in US Eastern Time (ET). Includes warm-up matches for World Cup qualifiers plus other international fixtures in the same window.
        </p>
      </div>

      {/* Stats bar */}
      <div className="max-w-3xl mx-auto px-6 mb-8">
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-black/[0.05]">
            <Stat label="Total matches" value={String(totalMatches)} />
            <Stat label="Days covered" value={String(grouped.length)} />
            <Stat label="WC team vs WC team" value={String(wcVsWc)} />
          </div>
        </div>
      </div>

      {/* Date-grouped list */}
      <div className="max-w-5xl mx-auto px-6">
        {grouped.map(([date, matches]) => (
          <div key={date} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-extrabold text-[#231645]">{formatDate(date)}</h2>
              <span className="text-xs font-bold text-[#615E6E] bg-[#f5f4fa] px-2.5 py-0.5 rounded-full">
                {matches.length} match{matches.length !== 1 ? "es" : ""}
              </span>
              <div className="flex-1 h-px bg-black/[0.06]" />
            </div>
            <div className="space-y-2">
              {matches.map((m) => (
                <MatchRow key={m.id} m={m} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="max-w-3xl mx-auto px-6 mt-12 text-sm text-[#615E6E] leading-relaxed">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-3">How this list works</h2>
        <p className="mb-3">
          The FIFA international match window runs from approximately late May through June 10, 2026, which is the
          last window for friendlies before the World Cup kicks off on June 11. Times can shift as broadcasters
          confirm slots; we display the most recent times we&apos;ve seen in US Eastern.
        </p>
        <p className="mb-3">
          Matches marked &quot;TBD&quot; either don&apos;t have a confirmed kickoff yet or are weekend
          double-headers where the federation hasn&apos;t locked a slot. We update as kickoffs are confirmed.
        </p>
        <h2 className="text-2xl font-extrabold text-[#231645] mb-3 mt-8">Related</h2>
        <ul className="space-y-2">
          <li><Link href="/schedule" className="text-[#7E43FF] font-semibold hover:underline">Full World Cup 2026 schedule (104 matches) →</Link></li>
          <li><Link href="/teams" className="text-[#7E43FF] font-semibold hover:underline">All 48 qualified teams →</Link></li>
          <li><Link href="/predictor" className="text-[#7E43FF] font-semibold hover:underline">Tournament predictor →</Link></li>
        </ul>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center py-4 px-2">
      <span className="text-2xl font-extrabold text-[#231645] tabular-nums">{value}</span>
      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#615E6E] mt-0.5 text-center">{label}</span>
    </div>
  )
}

function TeamCell({ name, align }: { name: string; align: "left" | "right" }) {
  const cls = flagClass(name)
  const wc = isWcTeam(name)
  const slug = teams.find((t) => t.name === name)?.slug
  const inner = (
    <span className={`inline-flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
      {cls ? (
        <span className={cls} style={{ fontSize: "1.2em", flexShrink: 0 }} aria-hidden />
      ) : (
        <span className="inline-block w-5 h-3.5 bg-[#f5f4fa] rounded-sm flex-shrink-0" aria-hidden />
      )}
      <span className={`text-sm font-semibold truncate ${wc ? "text-[#231645]" : "text-[#615E6E]"}`}>{name}</span>
    </span>
  )
  if (wc && slug) {
    return (
      <Link href={`/teams/${slug}/`} className="hover:text-[#7E43FF] transition-colors">
        {inner}
      </Link>
    )
  }
  return inner
}

function MatchRow({ m }: { m: Friendly }) {
  const played = typeof m.homeScore === "number" && typeof m.awayScore === "number"
  return (
    <div
      className="card flex items-center gap-3 px-4 py-3"
      style={{ borderLeft: m.bothWcTeams ? "3px solid #7E43FF" : "3px solid #e5e3ee" }}
    >
      <span className="text-base font-black text-[#231645] tabular-nums w-20 flex-shrink-0">
        {played ? "FT" : formatTime(m.time)}
      </span>
      <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-3 flex-1 min-w-0">
        <div className="flex justify-end text-right min-w-0"><TeamCell name={m.homeTeam} align="right" /></div>
        <div className="flex justify-center">
          {played ? (
            <span className="text-base font-black text-[#231645] tabular-nums bg-[#231645]/[0.06] rounded-md px-2.5 py-1 whitespace-nowrap">
              {m.homeScore} <span className="text-[#615E6E] font-bold">·</span> {m.awayScore}
            </span>
          ) : (
            <span className="text-[0.6rem] font-extrabold text-[#615E6E] bg-[#f5f4fa] rounded-full px-2 py-0.5 uppercase tracking-widest">
              vs
            </span>
          )}
        </div>
        <div className="flex justify-start min-w-0"><TeamCell name={m.awayTeam} align="left" /></div>
      </div>
      {/* Fixed-width slot so the score column stays aligned whether the WC×WC badge is shown or not. */}
      <div className="w-[60px] flex-shrink-0 flex justify-end">
        {m.bothWcTeams && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#7E43FF] bg-[#7E43FF]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            WC × WC
          </span>
        )}
      </div>
    </div>
  )
}
