import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { matches, slugForMatch, getMatchBySlug } from "@/data/matches"
import { getStadiumBySlug } from "@/data/stadiums"
import { getCityBySlug } from "@/data/cities"
import { teams } from "@/data/teams"
import { groups } from "@/data/groups"
import { getStadiumGuideBySlug } from "@/data/stadiumGuides"
import { getStadiumDetailsBySlug } from "@/data/stadiumDetails"
import MatchDayPanel from "@/components/MatchDayPanel"
import StadiumMap from "@/components/StadiumMap"
import MatchTicketCTA from "@/components/MatchTicketCTA"
import MatchHighlightEmbed from "@/components/MatchHighlightEmbed"
import { alternatesFor } from "@/lib/hreflang"
import { friendlies } from "@/data/friendlies"
import { groupWinnerOdds, championOdds } from "@/data/marketOdds"
import { getResult, hasResult } from "@/lib/matchResults"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return matches.map((m) => ({ slug: slugForMatch(m) }))
}

const teamByName = new Map(teams.map((t) => [t.name, t]))
const teamIso2ByName = new Map<string, string>()
for (const g of groups) {
  for (const t of g.teams) teamIso2ByName.set(t.name, t.iso2)
}

const COUNTRY_CODE: Record<string, string> = {
  USA: "US", Canada: "CA", Mexico: "MX",
}

function formatDateLong(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

function formatDateShort(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

// Build an ISO datetime in the stadium's local timezone (approximation by country)
function buildStartDateTime(date: string, time: string, country: string): string {
  // Without per-stadium timezone, use country-level UTC offset for June/July (DST):
  // USA ET = -04:00, CT = -05:00, PT = -07:00, MT = -06:00 . using ET as default for USA
  // Mexico = -05:00 (CDT for most of country) ... approximate
  // Canada (Toronto/Vancouver) = -04:00 / -07:00
  // We use a neutral fallback if unknown.
  const offset = country === "Mexico" ? "-05:00" : country === "Canada" ? "-04:00" : "-04:00"
  return `${date}T${time}:00${offset}`
}

// Last N friendlies/qualifiers a team has played that we have a result for.
// Sourced from friendlies.ts, which we update through the FIFA window.
function recentFormFor(team: string, limit = 5) {
  const played = friendlies
    .filter((f) =>
      (f.homeTeam === team || f.awayTeam === team) &&
      typeof f.homeScore === "number" &&
      typeof f.awayScore === "number"
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit)
  return played.map((f) => {
    const isHome = f.homeTeam === team
    const opponent = isHome ? f.awayTeam : f.homeTeam
    const teamScore = isHome ? f.homeScore! : f.awayScore!
    const oppScore  = isHome ? f.awayScore! : f.homeScore!
    const result: "W" | "D" | "L" =
      teamScore > oppScore ? "W" : teamScore === oppScore ? "D" : "L"
    return { date: f.date, opponent, teamScore, oppScore, isHome, result }
  })
}

// Broadcasters by country for World Cup 2026. Same across all matches at the
// network level; specific match assignments can shift to subsidiary channels.
const BROADCASTERS: { region: string; flag: string; channels: string; streaming: string }[] = [
  { region: "United States", flag: "🇺🇸", channels: "FOX (English), Telemundo (Spanish)", streaming: "FOX Sports app, Peacock" },
  { region: "Canada",        flag: "🇨🇦", channels: "TSN, CTV, ICI Tou.tv (French)",       streaming: "TSN+, Crave" },
  { region: "Mexico",        flag: "🇲🇽", channels: "TUDN, Canal 5, TV Azteca",            streaming: "ViX, TUDN app" },
  { region: "United Kingdom",flag: "🇬🇧", channels: "BBC One, ITV1",                       streaming: "BBC iPlayer, ITVX" },
  { region: "Australia",     flag: "🇦🇺", channels: "Optus Sport",                         streaming: "Optus Sport app" },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = getMatchBySlug(slug)
  if (!m) return {}

  const stadium = getStadiumBySlug(m.stadiumSlug)
  const city = getCityBySlug(m.citySlug)
  const isTBD = m.homeTeam === "TBD" || m.awayTeam === "TBD"
  const dateLong = formatDateLong(m.date)

  const fixture = isTBD
    ? `${m.round} Match ${m.matchNumber}`
    : `${m.homeTeam} vs ${m.awayTeam}`
  const groupLabel = m.group ? ` - Group ${m.group}` : ""
  const venue = stadium && city ? `${stadium.name}, ${city.name}` : ""

  const title = `${fixture} - ${dateLong} - World Cup 2026`
  const description = isTBD
    ? `World Cup 2026 ${m.round} match #${m.matchNumber} on ${dateLong}. Kickoff ${m.time} local at ${venue}. Stadium info, transit, fan tips.`
    : `${m.homeTeam} vs ${m.awayTeam} on ${dateLong} - World Cup 2026 ${m.round}${groupLabel}. Kickoff ${m.time} local at ${venue}. Match preview, stadium guide, how to get there.`

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: alternatesFor(`/matches/${slug}`),
  }
}

function FlagImg({ name, size = 48 }: { name: string; size?: number }) {
  const iso2 = teamIso2ByName.get(name)
  if (!iso2) {
    return (
      <div
        className="rounded-md bg-[#f5f4fa] border border-black/[0.06] flex items-center justify-center text-[#615E6E] text-xs"
        style={{ width: size, height: Math.round(size * 0.66) }}
      >
        TBD
      </div>
    )
  }
  return (
    <Image
      src={`https://flagcdn.com/w160/${iso2}.png`}
      alt={`${name} flag`}
      width={size}
      height={Math.round(size * 0.66)}
      className="rounded-md object-cover shadow-sm ring-1 ring-black/10"
      style={{ width: size, height: Math.round(size * 0.66) }}
      unoptimized
    />
  )
}

export default async function MatchPage({ params }: Props) {
  const { slug } = await params
  const m = getMatchBySlug(slug)
  if (!m) notFound()

  const stadium = getStadiumBySlug(m.stadiumSlug)
  const city = getCityBySlug(m.citySlug)
  const home = teamByName.get(m.homeTeam)
  const away = teamByName.get(m.awayTeam)
  const isTBD = m.homeTeam === "TBD" || m.awayTeam === "TBD"
  const stadiumGuide = stadium ? getStadiumGuideBySlug(stadium.slug) : undefined
  const stadiumDetails = stadium ? getStadiumDetailsBySlug(stadium.slug) : undefined

  const dateLong = formatDateLong(m.date)
  const fixture = isTBD ? `${m.round} - Match ${m.matchNumber}` : `${m.homeTeam} vs ${m.awayTeam}`

  // Related matches in same group
  const groupMatches = m.group
    ? matches.filter((x) => x.group === m.group && x.id !== m.id).sort((a, b) => a.matchNumber - b.matchNumber)
    : []

  // Other matches at same stadium
  const stadiumMatches = matches
    .filter((x) => x.stadiumSlug === m.stadiumSlug && x.id !== m.id)
    .sort((a, b) => a.matchNumber - b.matchNumber)
    .slice(0, 6)

  // Adjacent matches by number for prev/next
  const allByNumber = [...matches].sort((a, b) => a.matchNumber - b.matchNumber)
  const idx = allByNumber.findIndex((x) => x.id === m.id)
  const prev = idx > 0 ? allByNumber[idx - 1] : null
  const next = idx < allByNumber.length - 1 ? allByNumber[idx + 1] : null

  // Auto-generated match FAQs (for FAQPage schema + on-page accordion)
  const matchFaqs: { question: string; answer: string }[] = []
  if (!isTBD && stadium && city) {
    matchFaqs.push({
      question: `When is ${m.homeTeam} vs ${m.awayTeam} in the 2026 World Cup?`,
      answer: `${m.homeTeam} vs ${m.awayTeam} is on ${dateLong} with kickoff at ${m.time} local time at ${stadium.name} in ${city.name}.`,
    })
    matchFaqs.push({
      question: `Where is ${m.homeTeam} vs ${m.awayTeam} being played?`,
      answer: `The match is at ${stadium.name} in ${city.name}${city.state ? `, ${city.state}` : ""}. Capacity ${stadium.capacity.toLocaleString()}, ${stadium.roof} roof.`,
    })
    matchFaqs.push({
      question: `What round is ${m.homeTeam} vs ${m.awayTeam}?`,
      answer: `It's a ${m.round}${m.group ? ` (Group ${m.group})` : ""} match - match number ${m.matchNumber} of the 2026 FIFA World Cup.`,
    })
    if (stadiumGuide) {
      matchFaqs.push({
        question: `How do I get to ${stadium.name} for ${m.homeTeam} vs ${m.awayTeam}?`,
        answer: `${stadiumGuide.closestTransit[0].mode}: ${stadiumGuide.closestTransit[0].detail}`,
      })
      matchFaqs.push({
        question: `What time should I arrive at ${stadium.name}?`,
        answer: stadiumGuide.arrivalRecommendation,
      })
    }
    if (home && away) {
      matchFaqs.push({
        question: `What is ${m.homeTeam}'s FIFA ranking heading into the World Cup?`,
        answer: `${m.homeTeam} is ranked #${home.fifaRanking} in the FIFA World Rankings, managed by ${home.coach}. Their best World Cup result is ${home.bestResult}${home.titles > 0 ? ` and they have won the World Cup ${home.titles} time${home.titles === 1 ? "" : "s"}` : ""}.`,
      })
      matchFaqs.push({
        question: `What is ${m.awayTeam}'s FIFA ranking heading into the World Cup?`,
        answer: `${m.awayTeam} is ranked #${away.fifaRanking} in the FIFA World Rankings, managed by ${away.coach}. Their best World Cup result is ${away.bestResult}${away.titles > 0 ? ` and they have won the World Cup ${away.titles} time${away.titles === 1 ? "" : "s"}` : ""}.`,
      })
    }
  } else if (stadium && city) {
    matchFaqs.push({
      question: `Where is ${m.round} match ${m.matchNumber} being played?`,
      answer: `Match ${m.matchNumber} (${m.round}) is on ${dateLong} at ${m.time} local time at ${stadium.name} in ${city.name}. The teams will be confirmed once the previous round concludes.`,
    })
    if (stadiumGuide) {
      matchFaqs.push({
        question: `How do I get to ${stadium.name}?`,
        answer: `${stadiumGuide.closestTransit[0].mode}: ${stadiumGuide.closestTransit[0].detail}`,
      })
    }
  }

  // JSON-LD
  const country = stadium?.country ?? "USA"
  const startISO = buildStartDateTime(m.date, m.time, country)
  const endHourNum = (parseInt(m.time.slice(0, 2), 10) + 2) % 24
  const endTime = `${endHourNum.toString().padStart(2, "0")}:00`
  const endISO = buildStartDateTime(m.date, endTime, country)

  const SITE = "https://myworldcupguide.com"
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Schedule", item: `${SITE}/schedule` },
      { "@type": "ListItem", position: 3, name: fixture, item: `${SITE}/matches/${slug}` },
    ],
  }
  const faqJsonLd = matchFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: matchFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: isTBD ? `World Cup 2026 ${m.round} Match ${m.matchNumber}` : `${m.homeTeam} vs ${m.awayTeam} - World Cup 2026`,
    description: isTBD
      ? `${m.round} match #${m.matchNumber} of the 2026 FIFA World Cup, played on ${dateLong}.`
      : `${m.homeTeam} vs ${m.awayTeam} in the 2026 FIFA World Cup ${m.round}${m.group ? ` (Group ${m.group})` : ""}.`,
    startDate: startISO,
    endDate: endISO,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Soccer",
    location: stadium && city
      ? {
          "@type": "Place",
          name: stadium.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: city.name,
            addressRegion: city.state ?? city.country,
            addressCountry: COUNTRY_CODE[city.country] ?? city.country,
          },
        }
      : undefined,
    competitor: isTBD
      ? undefined
      : [
          { "@type": "SportsTeam", name: m.homeTeam },
          { "@type": "SportsTeam", name: m.awayTeam },
        ],
    organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
    url: `/matches/${slug}`,
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      {/* JSON-LD for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/schedule" className="hover:text-[#231645] transition-colors font-medium">Schedule</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold truncate">{fixture}</span>
        </nav>

        {/* Hero card: teams + date/time + venue */}
        <header className="section-panel panel-purple px-6 md:px-10 py-10 mb-8">
          <div className="flex flex-wrap gap-2 mb-5 justify-center">
            <span className="pill" style={{ background: "#7E43FF", color: "#fff", border: "none" }}>
              Match #{m.matchNumber}
            </span>
            <span className="pill">{m.round}</span>
            {m.group && <span className="pill">Group {m.group}</span>}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-3 text-center">
              <FlagImg name={m.homeTeam} size={96} />
              {home ? (
                <Link href={`/teams/${home.slug}`} className="text-xl md:text-2xl font-extrabold text-[#231645] hover:text-[#7E43FF] transition-colors leading-tight">
                  {m.homeTeam}
                </Link>
              ) : (
                <span className="text-xl md:text-2xl font-extrabold text-[#231645] leading-tight">{m.homeTeam}</span>
              )}
              {home && <span className="text-xs text-[#615E6E]">FIFA #{home.fifaRanking}</span>}
            </div>

            {hasResult(m.id) ? (
              (() => {
                const r = getResult(m.id)!
                return (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl md:text-4xl font-extrabold text-[#231645] leading-none">
                      {r.homeScore} <span className="text-[#615E6E] mx-1">-</span> {r.awayScore}
                    </div>
                    {(r.status === "PEN" && r.penaltyHome != null && r.penaltyAway != null) && (
                      <div className="text-xs text-[#615E6E] mt-1">({r.penaltyHome}-{r.penaltyAway} pens)</div>
                    )}
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mt-1">{r.status}</div>
                  </div>
                )
              })()
            ) : (
              <div className="flex flex-col items-center text-[#615E6E] font-bold text-xl">vs</div>
            )}

            <div className="flex flex-col items-center gap-3 text-center">
              <FlagImg name={m.awayTeam} size={96} />
              {away ? (
                <Link href={`/teams/${away.slug}`} className="text-xl md:text-2xl font-extrabold text-[#231645] hover:text-[#7E43FF] transition-colors leading-tight">
                  {m.awayTeam}
                </Link>
              ) : (
                <span className="text-xl md:text-2xl font-extrabold text-[#231645] leading-tight">{m.awayTeam}</span>
              )}
              {away && <span className="text-xs text-[#615E6E]">FIFA #{away.fifaRanking}</span>}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-base md:text-lg font-bold text-[#231645]">{dateLong}</p>
            <p className="text-sm text-[#615E6E]">
              Kickoff <span className="font-semibold text-[#231645]">{m.time}</span> local
              {stadium && city ? <> at {stadium.name}, {city.name}</> : null}
            </p>
          </div>
        </header>

        {/* H1 for SEO (visible) */}
        <h1 className="sr-only">{fixture} - {dateLong} - World Cup 2026 Match {m.matchNumber}</h1>

        {/* Match facts grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Date", value: formatDateShort(m.date) },
            { label: "Kickoff", value: `${m.time} local` },
            { label: "Round", value: m.round },
            { label: m.group ? "Group" : "Match", value: m.group ? m.group : `#${m.matchNumber}` },
          ].map(({ label, value }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-xl font-extrabold text-[#7E43FF] mb-0.5 leading-tight">{value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#231645]">{label}</p>
            </div>
          ))}
        </div>

        {/* Post-match highlights (rendered only after a video has been linked by the daily bot) */}
        {(() => {
          const r = getResult(m.id)
          if (!r?.videoId) return null
          return <MatchHighlightEmbed videoId={r.videoId} title={r.videoTitle ?? `${m.homeTeam} vs ${m.awayTeam} highlights`} channel={r.videoChannel} />
        })()}

        {/* Tickets - multi-vendor search row */}
        {!hasResult(m.id) && <MatchTicketCTA match={m} />}

        {/* Match-day essentials (compact) */}
        {stadiumGuide && stadium && (
          <MatchDayPanel guide={stadiumGuide} variant="compact" stadiumName={stadium.name} />
        )}

        {/* Venue */}
        {stadium && city && (
          <section className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Venue</h2>
            <div className="card p-7 mb-4">
              <p className="text-base font-bold text-[#231645] mb-1">
                <Link href={`/stadiums/${stadium.slug}`} className="hover:text-[#7E43FF] transition-colors">
                  {stadium.name}
                </Link>
              </p>
              <p className="text-sm text-[#615E6E] mb-4">
                <Link href={`/cities/${city.slug}`} className="hover:text-[#231645] transition-colors font-medium">
                  {city.name}
                </Link>
                {city.state ? <>, {city.state}</> : null} - {stadium.capacity.toLocaleString()} capacity - {stadium.roof} roof
              </p>
              <p className="text-sm text-[#615E6E] leading-relaxed">{stadium.description}</p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link href={`/stadiums/${stadium.slug}`} className="btn-outline text-xs">{stadium.name} Guide</Link>
                <Link href={`/cities/${city.slug}`} className="btn-outline text-xs">{city.name} Visitor Guide</Link>
              </div>
            </div>
            {stadiumDetails && (
              <StadiumMap name={stadium.name} address={stadiumDetails.address} coordinates={stadiumDetails.coordinates} />
            )}
          </section>
        )}

        {/* Match preview / context */}
        {!isTBD && home && away && (
          <section className="card p-7 mb-8">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">About This Match</h2>
            <p className="text-[#615E6E] leading-relaxed text-sm mb-3">
              {m.homeTeam} face {m.awayTeam} in the {m.round}{m.group ? ` of Group ${m.group}` : ""} on {dateLong}.
              {" "}{m.homeTeam} are ranked #{home.fifaRanking} in the world and managed by {home.coach};
              {" "}{m.awayTeam} sit at #{away.fifaRanking} under {away.coach}. The match kicks off at {m.time} local time
              {stadium && city ? <> at {stadium.name} in {city.name}.</> : "."}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">{m.homeTeam}</p>
                <p className="text-[#615E6E] text-sm leading-relaxed line-clamp-5">{home.about}</p>
                <Link href={`/teams/${home.slug}`} className="inline-block mt-3 text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors">
                  Read {m.homeTeam} preview →
                </Link>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">{m.awayTeam}</p>
                <p className="text-[#615E6E] text-sm leading-relaxed line-clamp-5">{away.about}</p>
                <Link href={`/teams/${away.slug}`} className="inline-block mt-3 text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors">
                  Read {m.awayTeam} preview →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Recent form (last 5 friendlies/results per team) */}
        {!isTBD && home && away && (() => {
          const homeForm = recentFormFor(m.homeTeam)
          const awayForm = recentFormFor(m.awayTeam)
          if (homeForm.length === 0 && awayForm.length === 0) return null
          return (
            <section className="card p-7 mb-8">
              <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Recent Form</h2>
              <p className="text-sm text-[#615E6E] mb-5">
                Last results for {m.homeTeam} and {m.awayTeam} in pre-tournament friendlies. Updated through the FIFA window.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { team: m.homeTeam, form: homeForm },
                  { team: m.awayTeam, form: awayForm },
                ].map(({ team, form }) => {
                  const streak = form.map((f) => f.result).join(" ")
                  return (
                    <div key={team}>
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E43FF]">{team}</p>
                        {streak && (
                          <span className="inline-flex gap-1 ml-auto">
                            {form.map((f, i) => (
                              <span
                                key={i}
                                className="inline-flex w-5 h-5 rounded text-[10px] font-extrabold text-white items-center justify-center"
                                style={{ background: f.result === "W" ? "#10b981" : f.result === "D" ? "#94a3b8" : "#ef4444" }}
                                title={`${f.result} vs ${f.opponent} (${f.teamScore}-${f.oppScore})`}
                              >
                                {f.result}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                      {form.length === 0 ? (
                        <p className="text-xs text-[#615E6E] italic">No results in window yet.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {form.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#615E6E] w-10">
                                {new Date(f.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              <span className="text-[#231645] flex-1 truncate">
                                <span className="text-[#615E6E]">{f.isHome ? "vs" : "at"}</span> {f.opponent}
                              </span>
                              <span className="tabular-nums font-extrabold text-[#231645]">
                                {f.teamScore}-{f.oppScore}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })()}

        {/* Market odds (Kalshi) . group-stage matches only since group-winner markets are the cleanest signal */}
        {!isTBD && home && away && m.group && (() => {
          const homeOdds = groupWinnerOdds[m.homeTeam]
          const awayOdds = groupWinnerOdds[m.awayTeam]
          const homeChamp = championOdds[m.homeTeam]
          const awayChamp = championOdds[m.awayTeam]
          if (homeOdds === undefined && awayOdds === undefined) return null
          const fav = (homeOdds ?? 0) > (awayOdds ?? 0) ? m.homeTeam : m.awayTeam
          return (
            <section className="card p-7 mb-8">
              <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Prediction Market Odds</h2>
              <p className="text-sm text-[#615E6E] mb-5">
                Live implied probabilities from <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" className="text-[#7E43FF] font-semibold hover:underline">Kalshi</a> prediction markets. {fav} are the market favourite to win Group {m.group}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { team: m.homeTeam, group: homeOdds, champ: homeChamp },
                  { team: m.awayTeam, group: awayOdds, champ: awayChamp },
                ].map(({ team, group, champ }) => (
                  <div key={team} className="rounded-xl bg-[#faf9fe] border border-black/[0.05] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E43FF] mb-3">{team}</p>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-3xl font-extrabold text-[#231645] tabular-nums">
                        {group !== undefined ? `${Math.round(group * 100)}%` : "."}
                      </span>
                      <span className="text-xs text-[#615E6E]">to win Group {m.group}</span>
                    </div>
                    {champ !== undefined && champ >= 0.005 && (
                      <p className="text-xs text-[#615E6E]">
                        Champion outright: <span className="font-extrabold text-[#231645] tabular-nums">{(champ * 100).toFixed(1)}%</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/predictor" className="inline-block mt-5 text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors">
                Build your own bracket with the Kalshi-pick button →
              </Link>
            </section>
          )
        })()}

        {/* Where to watch (broadcasters by country) */}
        {!isTBD && (
          <section className="card p-7 mb-8">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Where to Watch {fixture}</h2>
            <p className="text-sm text-[#615E6E] mb-5">
              FIFA World Cup 2026 broadcasters by region. All host-country networks carry every match. Streaming apps are typically gated by region or by a paid subscription.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BROADCASTERS.map((b) => (
                <div key={b.region} className="rounded-xl bg-[#faf9fe] border border-black/[0.05] p-4 flex gap-3">
                  <span className="text-2xl leading-none flex-shrink-0" aria-hidden>{b.flag}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E43FF]">{b.region}</p>
                    <p className="text-sm font-bold text-[#231645] mt-1 truncate">{b.channels}</p>
                    <p className="text-xs text-[#615E6E] mt-0.5 truncate">{b.streaming}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#615E6E] mt-3 italic">
              Verify the exact channel on your provider&apos;s guide. Channels can shift between siblings (e.g. FOX → FS1) match by match.
            </p>
          </section>
        )}

        {/* Same group - other matches */}
        {groupMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Other Group {m.group} Matches</h2>
            <div className="card overflow-hidden">
              {groupMatches.map((g, i) => (
                <Link
                  key={g.id}
                  href={`/matches/${slugForMatch(g)}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#f5f4fa] transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                >
                  <span className="text-xs font-bold text-[#7E43FF] w-10 flex-shrink-0">#{g.matchNumber}</span>
                  <span className="font-semibold text-[#231645] text-sm flex-1 truncate">
                    {g.homeTeam} <span className="text-[#615E6E] font-normal">vs</span> {g.awayTeam}
                  </span>
                  <span className="text-xs text-[#615E6E] hidden sm:inline">{formatDateShort(g.date)}</span>
                  <span className="text-xs font-semibold text-[#231645] bg-[#f5f4fa] px-2 py-0.5 rounded-full whitespace-nowrap">{g.time}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Other matches at the same stadium */}
        {stadiumMatches.length > 0 && stadium && (
          <section className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">More at {stadium.name}</h2>
            <div className="card overflow-hidden">
              {stadiumMatches.map((sm, i) => (
                <Link
                  key={sm.id}
                  href={`/matches/${slugForMatch(sm)}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#f5f4fa] transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                >
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[#7E43FF] bg-[#7E43FF]/10 px-2 py-0.5 rounded-full whitespace-nowrap">{sm.round}</span>
                  <span className="font-semibold text-[#231645] text-sm flex-1 truncate">
                    {sm.homeTeam} <span className="text-[#615E6E] font-normal">vs</span> {sm.awayTeam}
                  </span>
                  <span className="text-xs text-[#615E6E] hidden sm:inline">{formatDateShort(sm.date)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Match FAQ */}
        {matchFaqs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">{fixture} - FAQ</h2>
            <div className="space-y-3">
              {matchFaqs.map((f, i) => (
                <details key={i} className="card p-5 group">
                  <summary className="font-bold text-[#231645] text-sm cursor-pointer list-none flex items-start justify-between gap-3 group-open:text-[#7E43FF]">
                    <span>{f.question}</span>
                    <span className="text-[#7E43FF] flex-shrink-0 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                  </summary>
                  <p className="text-[#615E6E] text-sm leading-relaxed mt-3 pt-3 border-t border-black/[0.05]">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Prev / Next */}
        <nav className="flex items-stretch justify-between gap-3 pt-6 border-t border-black/[0.06]" aria-label="Match navigation">
          {prev ? (
            <Link href={`/matches/${slugForMatch(prev)}`} className="card p-4 flex-1 group">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">← Previous match</p>
              <p className="text-sm font-bold text-[#231645] mt-1 group-hover:text-[#7E43FF] transition-colors">
                #{prev.matchNumber} {prev.homeTeam === "TBD" ? prev.round : `${prev.homeTeam} vs ${prev.awayTeam}`}
              </p>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link href={`/matches/${slugForMatch(next)}`} className="card p-4 flex-1 group text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">Next match →</p>
              <p className="text-sm font-bold text-[#231645] mt-1 group-hover:text-[#7E43FF] transition-colors">
                #{next.matchNumber} {next.homeTeam === "TBD" ? next.round : `${next.homeTeam} vs ${next.awayTeam}`}
              </p>
            </Link>
          ) : <div className="flex-1" />}
        </nav>
      </div>
    </div>
  )
}
