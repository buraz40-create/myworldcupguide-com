import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { teams } from "@/data/teams"
import { matches, slugForMatch } from "@/data/matches"
import { cities, getCityBySlug } from "@/data/cities"
import { getStadiumBySlug } from "@/data/stadiums"
import { getBaseCamp } from "@/data/baseCamps"
import { groupWinnerOdds, championOdds } from "@/data/marketOdds"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return teams.map((t) => ({ slug: t.slug }))
}

function teamBySlug(slug: string) {
  return teams.find((t) => t.slug === slug)
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const t = teamBySlug(slug)
  if (!t) return {}
  const groupMatches = matches.filter(
    (m) => m.round === "Group Stage" && (m.homeTeam === t.name || m.awayTeam === t.name),
  )
  const cityNames = [...new Set(groupMatches.map((m) => getCityBySlug(m.citySlug)?.name).filter(Boolean))].join(", ")
  return {
    title: `${t.name} World Cup 2026 Fan Guide: Matches, Cities, Base Camp`,
    description:
      `Everything ${t.name} fans need for the 2026 World Cup. All three group matches, host cities (${cityNames}), team base camp, ticket info, broadcasters, and Kalshi market odds. Updated through the tournament.`,
    keywords: [
      `${t.name} World Cup 2026 fan guide`,
      `${t.name} World Cup 2026 schedule`,
      `where to watch ${t.name} World Cup 2026`,
      `${t.name} 2026 base camp`,
      `${t.name} tickets World Cup 2026`,
    ],
    alternates: alternatesFor(`${SITE}/teams/${t.slug}/fan-guide/`),
    openGraph: {
      title: `${t.name} World Cup 2026 Fan Guide`,
      description: `${t.name}'s full World Cup 2026 schedule, host cities, base camp, broadcasters, and live market odds.`,
      url: `${SITE}/teams/${t.slug}/fan-guide/`,
      type: "website",
    },
  }
}

const BROADCASTERS = [
  { region: "United States", channels: "FOX, Telemundo", streaming: "FOX Sports app, Peacock" },
  { region: "Canada",        channels: "TSN, CTV",       streaming: "TSN+, Crave" },
  { region: "Mexico",        channels: "TUDN, Canal 5",  streaming: "ViX, TUDN" },
  { region: "United Kingdom",channels: "BBC, ITV",       streaming: "BBC iPlayer, ITVX" },
  { region: "Australia",     channels: "Optus Sport",    streaming: "Optus Sport" },
]

export default async function TeamFanGuidePage({ params }: Props) {
  const { slug } = await params
  const t = teamBySlug(slug)
  if (!t) notFound()

  const groupMatches = matches
    .filter((m) => m.round === "Group Stage" && (m.homeTeam === t.name || m.awayTeam === t.name))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  // Unique host cities this team will visit (de-duped by citySlug)
  const visitedCitySlugs = [...new Set(groupMatches.map((m) => m.citySlug))]
  const visitedCities = visitedCitySlugs
    .map((s) => cities.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => !!c)

  const baseCamp = getBaseCamp(t.name)
  const groupOdds = groupWinnerOdds[t.name]
  const champOdds = championOdds[t.name]

  // JSON-LD: TouristTrip (the fan's trip following this team) + SportsTeam
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name: `${t.name} World Cup 2026 fan trip`,
        description:
          `Following ${t.name} through the 2026 FIFA World Cup group stage. ${groupMatches.length} matches across ${visitedCities.length} host ${visitedCities.length === 1 ? "city" : "cities"}.`,
        itinerary: groupMatches.map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "TouristAttraction",
            name: `${m.homeTeam} vs ${m.awayTeam}`,
            address: getCityBySlug(m.citySlug)?.name ?? "",
          },
        })),
      },
      {
        "@type": "SportsTeam",
        name: t.name,
        sport: "Soccer",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Teams", item: `${SITE}/teams/` },
          { "@type": "ListItem", position: 3, name: t.name, item: `${SITE}/teams/${t.slug}/` },
          { "@type": "ListItem", position: 4, name: "Fan Guide", item: `${SITE}/teams/${t.slug}/fan-guide/` },
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
          <Link href="/teams" className="hover:text-[#231645]">Teams</Link>
          <span className="opacity-40">/</span>
          <Link href={`/teams/${t.slug}`} className="hover:text-[#231645]">{t.name}</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Fan Guide</span>
        </nav>

        {/* Hero */}
        <header className="rounded-3xl p-8 md:p-10 mb-10 text-white" style={{ background: "linear-gradient(135deg,#231645,#5b22b8)" }}>
          <div className="flex items-center gap-4 mb-4">
            <Image src={`https://flagcdn.com/w160/${t.iso2}.png`} alt={`${t.name} flag`} width={80} height={54} className="rounded-md shadow-lg" unoptimized />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60">World Cup 2026 · Group {t.group}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{t.name} Fan Guide</h1>
            </div>
          </div>
          <p className="text-white/90 leading-relaxed max-w-3xl">
            Everything you need to follow {t.name} at the 2026 FIFA World Cup. Three group matches across {visitedCities.length} host {visitedCities.length === 1 ? "city" : "cities"}, the team base camp, broadcasters in your region, and live prediction-market odds. {t.confederation} · FIFA Rank #{t.fifaRanking} · Coached by {t.coach}.
          </p>
        </header>

        {/* Quick stats strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Stat label="Group" value={t.group} sub="Group stage" />
          <Stat label="Matches" value={String(groupMatches.length)} sub={`${visitedCities.length} ${visitedCities.length === 1 ? "city" : "cities"}`} />
          <Stat label="FIFA Rank" value={`#${t.fifaRanking}`} sub={t.confederation} />
          <Stat label="WC Appearances" value={String(t.worldCupAppearances)} sub={`Best: ${t.bestResult}`} />
        </section>

        {/* Match schedule */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Match Schedule</h2>
          <p className="text-sm text-[#615E6E] mb-5">{t.name}&apos;s three group-stage matches. Each link opens the match preview with kickoff details, venue info and travel guidance.</p>
          <div className="space-y-3">
            {groupMatches.map((m) => {
              const isHome = m.homeTeam === t.name
              const opponent = isHome ? m.awayTeam : m.homeTeam
              const venue = getStadiumBySlug(m.stadiumSlug)
              const city = getCityBySlug(m.citySlug)
              return (
                <Link key={m.id} href={`/matches/${slugForMatch(m)}/`} className="card p-5 flex flex-col md:flex-row md:items-center gap-3 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center gap-3 md:w-64 flex-shrink-0">
                    <span className="text-[10px] font-extrabold text-[#7E43FF] bg-[#f1ecff] rounded px-2 py-1 tabular-nums">M{m.matchNumber}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-[#231645] truncate">vs {opponent}</p>
                      <p className="text-xs text-[#615E6E]">{isHome ? "Home" : "Away"} · Group {m.group}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#231645] font-semibold">{formatDate(m.date)} · {m.time} local</p>
                    <p className="text-xs text-[#615E6E] truncate">{venue?.name ?? m.stadiumSlug} · {city?.name ?? m.citySlug}</p>
                  </div>
                  <span className="text-[#7E43FF] font-bold text-sm flex-shrink-0">Preview →</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Host cities visited */}
        {visitedCities.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Cities You&apos;ll Visit</h2>
            <p className="text-sm text-[#615E6E] mb-5">{t.name} play across {visitedCities.length} host {visitedCities.length === 1 ? "city" : "cities"} in the group stage. Open each city guide for hotels, airport transit and food picks.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {visitedCities.map((c) => {
                const matchesInCity = groupMatches.filter((m) => m.citySlug === c.slug).length
                return (
                  <Link key={c.slug} href={`/cities/${c.slug}/`} className="card p-5 hover:-translate-y-0.5 transition-transform">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">{c.country ?? "Host city"}</p>
                    <p className="text-lg font-extrabold text-[#231645] mb-1">{c.name}</p>
                    <p className="text-xs text-[#615E6E]">{matchesInCity} {t.name} {matchesInCity === 1 ? "match" : "matches"} here</p>
                    <p className="text-[#7E43FF] font-bold text-sm mt-3">City guide →</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Base camp */}
        {baseCamp && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Team Base Camp</h2>
            <p className="text-sm text-[#615E6E] mb-5">Where {t.name} train between matches. Fans sometimes catch open sessions and meet-and-greets. Check the federation&apos;s social channels closer to the tournament.</p>
            <div className="card p-7 flex flex-col md:flex-row gap-5">
              {baseCamp.image && (
                <div className="md:w-72 flex-shrink-0 rounded-xl overflow-hidden bg-[#faf9fe] aspect-[16/10] relative">
                  <Image src={baseCamp.image} alt={`${t.name} base camp at ${baseCamp.city}`} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">{baseCamp.country}</p>
                <h3 className="text-xl font-extrabold text-[#231645] mb-1">{baseCamp.city}, {baseCamp.region}</h3>
                {baseCamp.facility && <p className="text-xs text-[#615E6E] mb-3">{baseCamp.facility}</p>}
                <p className="text-sm text-[#231645] leading-relaxed">{baseCamp.blurb}</p>
              </div>
            </div>
          </section>
        )}

        {/* Market odds */}
        {(groupOdds !== undefined || champOdds !== undefined) && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Prediction Market Odds</h2>
            <p className="text-sm text-[#615E6E] mb-5">Live implied probabilities from <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" className="text-[#7E43FF] font-semibold hover:underline">Kalshi</a> real-money prediction markets.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupOdds !== undefined && (
                <div className="card p-6">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">To win Group {t.group}</p>
                  <p className="text-4xl font-extrabold text-[#231645] tabular-nums leading-none mb-2">{Math.round(groupOdds * 100)}%</p>
                  <p className="text-xs text-[#615E6E]">Kalshi market price</p>
                </div>
              )}
              {champOdds !== undefined && champOdds >= 0.005 && (
                <div className="card p-6">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">To win the World Cup</p>
                  <p className="text-4xl font-extrabold text-[#231645] tabular-nums leading-none mb-2">{(champOdds * 100).toFixed(1)}%</p>
                  <p className="text-xs text-[#615E6E]">Champion outright probability</p>
                </div>
              )}
            </div>
            <Link href="/predictor" className="inline-block mt-5 text-sm font-bold text-[#7E43FF] hover:text-[#231645] transition-colors">
              Predict {t.name}&apos;s tournament run →
            </Link>
          </section>
        )}

        {/* Where to watch */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Where to Watch {t.name}</h2>
          <p className="text-sm text-[#615E6E] mb-5">FIFA World Cup 2026 broadcasters in major markets. Every {t.name} match airs on the host-country networks listed below.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BROADCASTERS.map((b) => (
              <div key={b.region} className="card p-4">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E43FF]">{b.region}</p>
                <p className="text-sm font-bold text-[#231645] mt-1">{b.channels}</p>
                <p className="text-xs text-[#615E6E] mt-0.5">Streaming: {b.streaming}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About + key players */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">About {t.name}</h2>
          <p className="text-sm text-[#615E6E] mb-5">Snapshot of {t.name}&apos;s 2026 squad and outlook.</p>
          <div className="card p-7">
            <p className="text-sm text-[#231645] leading-relaxed mb-5">{t.about}</p>
            {t.keyPlayers.length > 0 && (
              <>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Key players</p>
                <div className="flex flex-wrap gap-2">
                  {t.keyPlayers.map((p) => (
                    <span key={p} className="text-xs font-bold bg-[#f5f4fa] text-[#231645] rounded-full px-3 py-1.5">{p}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Tickets CTA */}
        <section className="mb-10">
          <Link href="/tickets" className="block rounded-2xl px-6 py-5 transition-transform hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg,#231645,#7E43FF)" }}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl" aria-hidden>🎟️</div>
              <div className="flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Get to a {t.name} match</p>
                <p className="text-white font-extrabold text-lg leading-tight">Tickets, FIFA ID, hospitality and resale</p>
                <p className="text-white/85 text-sm leading-relaxed mt-0.5">Sale phases, prices, scam warnings and the only legitimate secondary market.</p>
              </div>
              <span className="text-white text-xl font-bold flex-shrink-0">→</span>
            </div>
          </Link>
        </section>

        {/* Related */}
        <section className="pt-8 border-t border-black/[0.06]">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Keep planning</h2>
          <ul className="space-y-2">
            <li><Link href={`/teams/${t.slug}/`} className="text-[#7E43FF] font-semibold hover:underline">{t.name} team page (squad, history, players) →</Link></li>
            <li><Link href={`/groups/${t.group.toLowerCase()}/`} className="text-[#7E43FF] font-semibold hover:underline">Group {t.group} standings and fixtures →</Link></li>
            <li><Link href="/schedule" className="text-[#7E43FF] font-semibold hover:underline">Full World Cup 2026 schedule →</Link></li>
            <li><Link href="/kits" className="text-[#7E43FF] font-semibold hover:underline">Rate the {t.name} kit →</Link></li>
            <li><Link href="/predictor" className="text-[#7E43FF] font-semibold hover:underline">Build your own tournament bracket →</Link></li>
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
