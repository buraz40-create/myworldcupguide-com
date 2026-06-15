import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { matches, slugForMatch } from "@/data/matches"
import { getKickoff } from "@/lib/matchTime"
import { getResult } from "@/lib/matchResults"
import { getStadiumBySlug } from "@/data/stadiums"
import { getCityBySlug } from "@/data/cities"
import { teams } from "@/data/teams"
import { groupWinnerOdds } from "@/data/marketOdds"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

type Props = { params: Promise<{ date: string }> }

// One static page per unique match-day in the 31-day tournament.
export async function generateStaticParams() {
  const dates = [...new Set(matches.map((m) => m.date))]
  return dates.map((date) => ({ date }))
}

const teamIso2 = new Map(teams.map((t) => [t.name, t.iso2]))

function fmtLong(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

function fmtShort(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

function dayOfTournament(date: string) {
  // 2026-06-11 = Day 1
  const start = new Date("2026-06-11T12:00:00Z").getTime()
  const here = new Date(date + "T12:00:00Z").getTime()
  return Math.round((here - start) / 86_400_000) + 1
}

function roundLabel(round: string) {
  if (round === "Group Stage") return "Group Stage"
  if (round === "Round of 32") return "Round of 32"
  if (round === "Round of 16") return "Round of 16"
  return round
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params
  const dayMatches = matches.filter((m) => m.date === date)
  if (!dayMatches.length) return {}
  const long = fmtLong(date)
  const rounds = [...new Set(dayMatches.map((m) => m.round))]
  const fixtures = dayMatches.slice(0, 4).map((m) => `${m.homeTeam} vs ${m.awayTeam}`).join(", ")
  const more = dayMatches.length > 4 ? ` and ${dayMatches.length - 4} more` : ""
  return {
    title: `World Cup 2026 Matches on ${long} - Schedule, Kickoff Times`,
    description:
      `${dayMatches.length} World Cup 2026 ${rounds.join("/")} match${dayMatches.length === 1 ? "" : "es"} on ${long}: ${fixtures}${more}. Full kickoff times, venues, broadcasters, and live prediction-market odds.`,
    keywords: [
      `World Cup 2026 ${long}`,
      `World Cup matches ${date}`,
      `World Cup ${rounds[0]} ${date}`,
      `what matches are on ${date} World Cup`,
    ],
    alternates: alternatesFor(`${SITE}/schedule/${date}/`),
    openGraph: {
      title: `World Cup 2026 Matches on ${long}`,
      description: `${dayMatches.length} ${rounds.join("/")} match${dayMatches.length === 1 ? "" : "es"} on ${long}.`,
      url: `${SITE}/schedule/${date}/`,
      type: "website",
    },
  }
}

export default async function MatchDayPage({ params }: Props) {
  const { date } = await params
  const dayMatches = matches
    .filter((m) => m.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))
  if (!dayMatches.length) notFound()

  const long = fmtLong(date)
  const day = dayOfTournament(date)
  const rounds = [...new Set(dayMatches.map((m) => m.round))]
  const allDates = [...new Set(matches.map((m) => m.date))].sort()
  const idx = allDates.indexOf(date)
  const prevDate = idx > 0 ? allDates[idx - 1] : null
  const nextDate = idx < allDates.length - 1 ? allDates[idx + 1] : null

  // JSON-LD: ItemList of SportsEvent for the day
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `World Cup 2026 matches on ${long}`,
        numberOfItems: dayMatches.length,
        itemListElement: dayMatches.map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SportsEvent",
            name: `${m.homeTeam} vs ${m.awayTeam}`,
            startDate: `${m.date}T${m.time}:00-04:00`,
            sport: "Soccer",
            competitor: [
              { "@type": "SportsTeam", name: m.homeTeam },
              { "@type": "SportsTeam", name: m.awayTeam },
            ],
            location: {
              "@type": "Place",
              name: getStadiumBySlug(m.stadiumSlug)?.name ?? m.stadiumSlug,
              address: getCityBySlug(m.citySlug)?.name ?? m.citySlug,
            },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Schedule", item: `${SITE}/schedule/` },
          { "@type": "ListItem", position: 3, name: long, item: `${SITE}/schedule/${date}/` },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645]">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/schedule" className="hover:text-[#231645]">Schedule</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">{fmtShort(date)}</span>
        </nav>

        {/* Hero */}
        <header className="rounded-3xl p-8 md:p-10 mb-8 text-white" style={{ background: "linear-gradient(135deg,#231645,#5b22b8)" }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-2">Day {day} of the 2026 World Cup · {rounds.join(" / ")}</p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">{long}</h1>
          <p className="text-white/90 leading-relaxed max-w-3xl">
            {dayMatches.length} World Cup 2026 {rounds.join(" / ").toLowerCase()} match{dayMatches.length === 1 ? "" : "es"} on this date.
            {" "}Kickoff times shown in local stadium time. Tap any match for the full preview, broadcasters and venue guidance.
          </p>
        </header>

        {/* Day stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Stat label="Matches" value={String(dayMatches.length)} sub="this date" />
          <Stat label="Tournament day" value={`#${day}`} sub="of 39" />
          <Stat label="Rounds" value={String(rounds.length)} sub={rounds[0]} />
          <Stat label="Venues" value={String(new Set(dayMatches.map((m) => m.stadiumSlug)).size)} sub="stadiums" />
        </section>

        {/* Match list */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Matches</h2>
          <p className="text-sm text-[#615E6E] mb-5">All {dayMatches.length} fixture{dayMatches.length === 1 ? "" : "s"} on {long}.</p>
          <div className="space-y-3">
            {dayMatches.map((m) => {
              const isTBD = m.homeTeam === "TBD" || m.awayTeam === "TBD"
              const venue = getStadiumBySlug(m.stadiumSlug)
              const city = getCityBySlug(m.citySlug)
              const fav = m.group
                ? ((groupWinnerOdds[m.homeTeam] ?? 0) > (groupWinnerOdds[m.awayTeam] ?? 0) ? m.homeTeam : m.awayTeam)
                : null
              const homeIso = teamIso2.get(m.homeTeam)
              const awayIso = teamIso2.get(m.awayTeam)
              return (
                <Link key={m.id} href={`/matches/${slugForMatch(m)}/`} className="card p-5 hover:-translate-y-0.5 transition-transform block">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-extrabold text-[#7E43FF] bg-[#f1ecff] rounded px-2 py-1 tabular-nums">M{m.matchNumber}</span>
                    <span className="text-xs font-bold text-[#615E6E]">{roundLabel(m.round)}{m.group ? ` · Group ${m.group}` : ""}</span>
                    {(() => {
                      const k = getKickoff(m)
                      return (
                        <span className="ml-auto text-sm font-extrabold text-[#231645] tabular-nums whitespace-nowrap">
                          {k.etTime} <span className="text-[#7E43FF]">ET</span>
                          {!k.isSameAsEt && <span className="text-[10px] font-semibold text-[#615E6E] ml-1.5">({k.localTime} {k.localLabel})</span>}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 justify-end text-right min-w-0">
                      <span className="text-base font-extrabold text-[#231645] truncate">{m.homeTeam}</span>
                      {homeIso && <span className={`fi fi-${homeIso}`} style={{ fontSize: "1.4em", flexShrink: 0 }} aria-hidden />}
                    </div>
                    <div className="flex justify-center">
                      {(() => {
                        const r = getResult(m.id)
                        const isFinal = r && (r.status === "FT" || r.status === "AET" || r.status === "PEN")
                        return isFinal ? (
                          <span className="text-sm font-extrabold text-white bg-[#231645] rounded-full px-2.5 py-0.5 tabular-nums whitespace-nowrap">
                            {r.homeScore}-{r.awayScore}{r.status === "AET" ? " AET" : ""}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-[#615E6E] bg-[#f5f4fa] rounded-full px-2 py-0.5 uppercase tracking-widest">vs</span>
                        )
                      })()}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      {awayIso && <span className={`fi fi-${awayIso}`} style={{ fontSize: "1.4em", flexShrink: 0 }} aria-hidden />}
                      <span className="text-base font-extrabold text-[#231645] truncate">{m.awayTeam}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#615E6E]">
                    <span>📍 {venue?.name ?? m.stadiumSlug} · {city?.name ?? m.citySlug}</span>
                    {fav && !isTBD && groupWinnerOdds[fav] !== undefined && (
                      <span className="text-[#7E43FF] font-semibold">
                        Kalshi favourite: {fav} ({Math.round((groupWinnerOdds[fav] ?? 0) * 100)}% Group {m.group})
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Day navigation */}
        <nav className="flex items-stretch justify-between gap-3 pt-6 border-t border-black/[0.06]" aria-label="Day navigation">
          {prevDate ? (
            <Link href={`/schedule/${prevDate}/`} className="card p-4 flex-1 max-w-[48%] hover:-translate-y-0.5 transition-transform">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E]">← Previous match day</p>
              <p className="text-sm font-extrabold text-[#231645] mt-1">{fmtShort(prevDate)}</p>
            </Link>
          ) : <span className="flex-1" />}
          {nextDate ? (
            <Link href={`/schedule/${nextDate}/`} className="card p-4 flex-1 max-w-[48%] hover:-translate-y-0.5 transition-transform text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E]">Next match day →</p>
              <p className="text-sm font-extrabold text-[#231645] mt-1">{fmtShort(nextDate)}</p>
            </Link>
          ) : <span className="flex-1" />}
        </nav>

        {/* Related */}
        <section className="mt-10 pt-6 border-t border-black/[0.06]">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Plan around match day</h2>
          <ul className="space-y-2">
            <li><Link href="/schedule" className="text-[#7E43FF] font-semibold hover:underline">Full 104-match World Cup 2026 schedule →</Link></li>
            <li><Link href="/tickets" className="text-[#7E43FF] font-semibold hover:underline">Tickets, FIFA ID and how to buy →</Link></li>
            <li><Link href="/predictor" className="text-[#7E43FF] font-semibold hover:underline">Build your bracket and lock in your picks →</Link></li>
          </ul>
        </section>

      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-5 text-center">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-[#231645] tabular-nums leading-none">{value}</p>
      <p className="text-[10px] text-[#615E6E] mt-1.5">{sub}</p>
    </div>
  )
}
