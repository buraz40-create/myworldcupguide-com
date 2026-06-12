import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cities, getCityBySlug } from "@/data/cities"
import { stadiums } from "@/data/stadiums"
import { getMatchesByCity } from "@/data/matches"
import { getCityGuideBySlug } from "@/data/cityGuides"
import { getStadiumDetailsBySlug } from "@/data/stadiumDetails"
import ImageSlideshow from "@/components/ImageSlideshow"
import StadiumMap from "@/components/StadiumMap"
import HotelSearchCTA from "@/components/HotelSearchCTA"
import TourSearchCTA from "@/components/TourSearchCTA"
import { alternatesFor } from "@/lib/hreflang"
import YouTubeEmbed from "@/components/YouTubeEmbed"
import { getCityVideo } from "@/lib/contentVideos"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return cities.map((c) => ({ slug: c.slug }))
}

const SITE = "https://myworldcupguide.com"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const city = getCityBySlug(slug)
  if (!city) return {}
  const title = `${city.name} World Cup 2026 - Schedule, Tickets & Visitor Guide`
  const description = `${city.name} hosts ${city.games} 2026 FIFA World Cup matches at ${city.stadium}. Match schedule, kickoff times, ticket info, transport, hotels and the best things to do in ${city.name} during the World Cup.`
  return {
    title,
    description,
    keywords: [
      `${city.name} World Cup`,
      `World Cup ${city.name}`,
      `${city.name} World Cup 2026`,
      `${city.name} World Cup tickets`,
      `${city.name} World Cup games`,
      `${city.stadium} World Cup`,
      "World Cup 2026 host cities",
      "World Cup 2026 schedule",
    ],
    alternates: alternatesFor(`${SITE}/cities/${city.slug}`),
    openGraph: {
      title,
      description,
      url: `${SITE}/cities/${city.slug}`,
      type: "website",
      images: city.images[0] ? [{ url: city.images[0].startsWith("http") ? city.images[0] : `${SITE}${city.images[0]}` }] : undefined,
    },
  }
}

const roundColors: Record<string, { bg: string; text: string }> = {
  "Group Stage":  { bg: "#7E43FF15", text: "#7E43FF" },
  "Round of 32":  { bg: "#3b82f615", text: "#3b82f6" },
  "Round of 16":  { bg: "#10b98115", text: "#10b981" },
  "Quarterfinal": { bg: "#f59e0b15", text: "#f59e0b" },
  "Semi-final":   { bg: "#ef444415", text: "#ef4444" },
  "3rd Place":    { bg: "#64748b15", text: "#64748b" },
  "Final":        { bg: "#eab30815", text: "#d97706" },
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

const transportIcons = ["🚆", "🚇", "🚗", "🛵"]

export default async function CityPage({ params }: Props) {
  const { slug } = await params
  const city = getCityBySlug(slug)
  if (!city) notFound()

  const stadium = stadiums.find((s) => s.slug === city.stadiumSlug)
  const cityMatches = getMatchesByCity(city.slug)
  const guide = getCityGuideBySlug(city.slug)
  const flag = city.country === "USA" ? "🇺🇸" : city.country === "Mexico" ? "🇲🇽" : "🇨🇦"

  const groupMatches = cityMatches.filter((m) => m.round === "Group Stage")
  const knockoutMatches = cityMatches.filter((m) => m.round !== "Group Stage")

  const cityJsonLd: { "@context": string; "@graph": Record<string, unknown>[] } = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristDestination",
        name: city.name,
        description: city.description,
        url: `${SITE}/cities/${city.slug}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: city.state ?? city.country,
          addressCountry: city.country === "USA" ? "US" : city.country === "Mexico" ? "MX" : "CA",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Host Cities", item: `${SITE}/cities` },
          { "@type": "ListItem", position: 3, name: city.name, item: `${SITE}/cities/${city.slug}` },
        ],
      },
    ],
  }

  // Add FAQPage schema if we have FAQs for this city
  if (guide && guide.faqs.length > 0) {
    cityJsonLd["@graph"].push({
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    })
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd) }}
      />
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/cities" className="hover:text-[#231645] transition-colors font-medium">Cities</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">{city.name}</span>
        </nav>

        {/* Slideshow */}
        <ImageSlideshow images={city.images} alt={city.name} />

        {/* Title + badges */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="pill">{flag} {city.country}</span>
            <span className="pill" style={{ background: "#7E43FF", color: "#fff", border: "none" }}>
              {city.games} Matches
            </span>
            <span className="pill">{city.timezone}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">{city.name}</h1>
          <p className="text-[#615E6E] text-lg leading-relaxed">{city.description}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Matches", value: city.games.toString() },
            { label: "Capacity",      value: city.capacity.toLocaleString() },
            { label: "Roof",          value: stadium?.roof ?? "-" },
            { label: "June Weather",  value: city.weatherJune.split(",")[0] },
          ].map(({ label, value }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-xl font-extrabold text-[#7E43FF] mb-0.5 leading-tight">{value}</p>
              <p className="text-xs text-[#615E6E] uppercase tracking-widest font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Match Schedule */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">
            Match Schedule - {city.stadium}
          </h2>

          {groupMatches.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#615E6E] mb-3">Group Stage</p>
              <div className="card overflow-hidden">
                {groupMatches.map((m, i) => {
                  const rc = roundColors[m.round] ?? roundColors["Group Stage"]
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-4"
                      style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span
                          className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide whitespace-nowrap"
                          style={{ background: rc.bg, color: rc.text }}
                        >
                          {m.group ? `Group ${m.group}` : m.round}
                        </span>
                        <span className="font-bold text-[#231645] text-sm truncate">
                          {m.homeTeam} <span className="text-[#615E6E] font-normal">vs</span> {m.awayTeam}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-[#615E6E]">{formatDate(m.date)}</span>
                        <span className="text-xs font-bold text-[#231645] bg-[#f5f4fa] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {m.time} local
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {knockoutMatches.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#615E6E] mb-3">Knockout Rounds</p>
              <div className="card overflow-hidden">
                {knockoutMatches.map((m, i) => {
                  const rc = roundColors[m.round] ?? roundColors["Group Stage"]
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-4"
                      style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span
                          className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide whitespace-nowrap"
                          style={{ background: rc.bg, color: rc.text }}
                        >
                          {m.round}
                        </span>
                        <span className="font-semibold text-[#615E6E] text-sm italic">To be determined</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-[#615E6E]">{formatDate(m.date)}</span>
                        <span className="text-xs font-bold text-[#231645] bg-[#f5f4fa] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {m.time} local
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* Getting to City - airports */}
        {guide && guide.airports.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">
              Getting to {city.name}
            </h2>
            <p className="text-[#615E6E] text-sm mb-5">
              Airports near {city.stadium} and how to get from each to the venue.
            </p>
            <div className="space-y-3">
              {guide.airports.map((a) => (
                <div key={a.code} className="card p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-extrabold text-[#231645] text-base">{a.code} - {a.name}</p>
                    <span className="text-xs font-semibold text-[#7E43FF] bg-[#7E43FF]/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {a.distanceToStadium}
                    </span>
                  </div>
                  <p className="text-[#615E6E] text-sm leading-relaxed">{a.routeToStadium}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stadium */}
        {stadium && (() => {
          const stadiumDetails = getStadiumDetailsBySlug(stadium.slug)
          return (
            <section className="mb-10">
              <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Stadium</h2>
              <div className="card p-7 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-[#231645]">{stadium.name}</h3>
                  <Link href={`/stadiums/${stadium.slug}`} className="text-sm text-[#7E43FF] hover:opacity-70 font-medium whitespace-nowrap">
                    Full guide →
                  </Link>
                </div>
                <p className="text-[#615E6E] mb-5 leading-relaxed text-sm">{stadium.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Capacity", value: stadium.capacity.toLocaleString() },
                    { label: "Surface",  value: stadium.surface },
                    { label: "Roof",     value: stadium.roof },
                    { label: "Opened",   value: stadium.opened.toString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl px-4 py-3" style={{ background: "#f8f7fd" }}>
                      <p className="text-[#615E6E] text-xs uppercase tracking-widest font-medium mb-1">{label}</p>
                      <p className="font-semibold text-[#231645] text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {stadiumDetails && (
                <StadiumMap name={stadium.name} address={stadiumDetails.address} coordinates={stadiumDetails.coordinates} />
              )}
            </section>
          )
        })()}

        {/* Getting Around */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Getting Around {city.name}</h2>
          <div className="space-y-3 mb-3">
            {city.transport.map((t, i) => (
              <div key={i} className="card p-5 flex gap-4 items-start">
                <span className="text-xl flex-shrink-0 mt-0.5">{transportIcons[i % 4]}</span>
                <div>
                  <p className="font-bold text-[#231645] text-sm mb-0.5">{t.mode}</p>
                  <p className="text-[#615E6E] text-sm leading-relaxed">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5 border-l-4 border-[#7E43FF]">
            <p className="text-xs font-bold uppercase tracking-widest text-[#615E6E] mb-1">To the Stadium</p>
            <p className="text-[#615E6E] text-sm leading-relaxed">{city.gettingThere}</p>
          </div>
        </section>

        {/* Where to Stay (rich tiers) */}
        {guide && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">
              Where to Stay in {city.name}
            </h2>
            <p className="text-[#615E6E] text-sm mb-5">
              Three price tiers across {city.name}. Book early - World Cup tournament dates push prices 2-5x higher than normal.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                { tier: "Budget",  data: guide.hotelTiers.budget,  color: "#10b981" },
                { tier: "Mid",     data: guide.hotelTiers.mid,     color: "#7E43FF" },
                { tier: "Luxury",  data: guide.hotelTiers.luxury,  color: "#f59e0b" },
              ] as const).map(({ tier, data, color }) => (
                <div key={tier} className="card p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[0.65rem] font-extrabold uppercase tracking-widest" style={{ color }}>
                      {tier}
                    </p>
                    <span className="text-xs font-bold text-[#231645]">{data.nightlyUSD}</span>
                  </div>
                  <p className="font-bold text-[#231645] text-sm mb-1.5 leading-snug">{data.area}</p>
                  <p className="text-[#615E6E] text-xs leading-relaxed">{data.why}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {city.stayAreas.slice(0, 4).map((area, i) => (
                <div key={i} className="rounded-xl px-4 py-3" style={{ background: "#f8f7fd" }}>
                  <p className="font-bold text-[#231645] text-xs mb-0.5">{area.name}</p>
                  <p className="text-[#615E6E] text-xs leading-relaxed">{area.why}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <HotelSearchCTA cityName={city.name} />
            </div>
          </section>
        )}

        {/* Fan Zones / Where to Watch */}
        {guide && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">
              Fan Zones &amp; Where to Watch in {city.name}
            </h2>
            <p className="text-[#615E6E] text-sm leading-relaxed mb-4">{guide.fanZones.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-3">Official Fan Zones</p>
                <ul className="space-y-2">
                  {guide.fanZones.locations.map((loc) => (
                    <li key={loc} className="text-[#231645] text-sm flex gap-2">
                      <span className="text-[#7E43FF] flex-shrink-0">•</span>
                      <span>{loc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-3">Football Pubs</p>
                <ul className="space-y-2">
                  {guide.whereToWatchOtherGames.map((bar) => (
                    <li key={bar} className="text-[#615E6E] text-sm flex gap-2">
                      <span className="text-[#7E43FF] flex-shrink-0">•</span>
                      <span>{bar}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5">
              <TourSearchCTA cityName={city.name} />
            </div>
          </section>
        )}

        {/* Where to Eat */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Where to Eat in {city.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {city.mustEat.map((item, i) => {
              const dashIdx = item.indexOf(" - ")
              const name = dashIdx > -1 ? item.slice(0, dashIdx) : item
              const desc = dashIdx > -1 ? item.slice(dashIdx + 3) : ""
              return (
                <div key={i} className="card p-5 flex gap-3 items-start">
                  <span className="text-lg flex-shrink-0">🍽️</span>
                  <div>
                    <p className="font-bold text-[#231645] text-sm leading-snug">{name}</p>
                    {desc && <p className="text-[#615E6E] text-xs mt-0.5 leading-relaxed">{desc}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Money & Tipping */}
        {guide && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">
              Money, Tipping &amp; Tax in {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Currency</p>
                <p className="font-bold text-[#231645] text-sm mb-2">{guide.currency.code} ({guide.currency.symbol})</p>
                <p className="text-[#615E6E] text-xs leading-relaxed">{guide.currency.cardAccepted}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Tipping</p>
                <p className="text-[#615E6E] text-xs leading-relaxed">{guide.currency.tippingNorm}</p>
              </div>
              <div className="card p-5 md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Tax notes</p>
                <p className="text-[#615E6E] text-xs leading-relaxed">{guide.currency.taxNotes}</p>
              </div>
            </div>
          </section>
        )}

        {/* Language & Phrases */}
        {guide && guide.language.phrases.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">
              Language in {city.name}
            </h2>
            <p className="text-[#615E6E] text-sm mb-4">
              Primary language: <span className="font-bold text-[#231645]">{guide.language.primary}</span>. A few phrases that go a long way:
            </p>
            <div className="card overflow-hidden">
              {guide.language.phrases.map((p, i) => (
                <div
                  key={p.phrase}
                  className="flex gap-4 px-5 py-3"
                  style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                >
                  <p className="font-bold text-[#231645] text-sm flex-1 min-w-0">{p.phrase}</p>
                  <p className="text-[#615E6E] text-sm flex-1 text-right">{p.meaning}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* What to Pack */}
        {guide && guide.packingList.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">
              What to Pack for {city.name}
            </h2>
            <p className="text-[#615E6E] text-sm mb-4">
              {city.weatherJune}
            </p>
            <div className="card p-5">
              <ul className="space-y-2">
                {guide.packingList.map((item) => (
                  <li key={item} className="text-[#615E6E] text-sm flex gap-2 leading-relaxed">
                    <span className="text-[#7E43FF] flex-shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Connectivity & Emergency */}
        {guide && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">
              Connectivity &amp; Emergency Numbers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Phone &amp; WiFi</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{guide.connectivity}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Emergency</p>
                <p className="font-extrabold text-[#231645] text-3xl mb-1">{guide.emergencyNumber}</p>
                <p className="text-[#615E6E] text-xs">Police, fire, medical</p>
              </div>
            </div>
          </section>
        )}

        {/* Safety */}
        {guide && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">
              Is {city.name} Safe? - Safety Notes for World Cup Visitors
            </h2>
            <div className="card p-5 border-l-4 border-[#7E43FF] mb-3">
              <p className="text-[#615E6E] text-sm leading-relaxed">{guide.safetyNotes}</p>
            </div>
            {guide.neighborhoodsToAvoid.length > 0 && (
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#ef4444] mb-2">Areas to avoid</p>
                <ul className="space-y-1">
                  {guide.neighborhoodsToAvoid.map((n) => (
                    <li key={n} className="text-[#615E6E] text-sm flex gap-2">
                      <span className="text-[#ef4444] flex-shrink-0">×</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Visitor Tips (existing quick tips) */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Quick Tips</h2>
          <div className="space-y-3">
            {city.visitorTips.map((tip, i) => (
              <div key={i} className="card p-5 flex gap-4 items-start">
                <span className="text-[#7E43FF] font-bold flex-shrink-0 mt-0.5">✓</span>
                <p className="text-[#615E6E] text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stadium Facts */}
        {stadium && stadium.funFacts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">{stadium.name} Facts</h2>
            <div className="space-y-2">
              {stadium.funFacts.map((fact, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-[#7E43FF] font-bold flex-shrink-0 mt-0.5">★</span>
                  <p className="text-[#615E6E] text-sm leading-relaxed">{fact}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {guide && guide.faqs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">
              {city.name} World Cup FAQ
            </h2>
            <div className="space-y-3">
              {guide.faqs.map((f, i) => (
                <details key={i} className="card p-5 group">
                  <summary className="font-bold text-[#231645] text-sm cursor-pointer list-none flex items-start justify-between gap-3">
                    <span>{f.question}</span>
                    <span className="text-[#7E43FF] flex-shrink-0 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                  </summary>
                  <p className="text-[#615E6E] text-sm leading-relaxed mt-3">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {(() => {
          const v = getCityVideo(city.slug)
          return v ? (
            <YouTubeEmbed videoId={v.videoId} title={v.title} channel={v.channel} heading={`Visitor's view of ${city.name}`} />
          ) : null
        })()}

        <div className="pt-6 border-t border-black/[0.06]">
          <Link href="/cities" className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold">
            ← All host cities
          </Link>
        </div>

      </div>
    </div>
  )
}
