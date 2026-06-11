import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { cities } from "@/data/cities"
import { stadiums } from "@/data/stadiums"
import QuickAnswers, { quickAnswersJsonLd, type QA } from "@/components/QuickAnswers"
import TripPlanner from "@/components/TripPlanner"
import { alternatesFor } from "@/lib/hreflang"

const CITIES_QA: QA[] = [
  { question: "How many host cities does the 2026 World Cup have?", answer: "16 cities across three countries: 11 in the USA, 3 in Mexico, and 2 in Canada. Each city hosts between 2 and 13 matches." },
  { question: "Which city hosts the most World Cup 2026 matches?", answer: "Both New York / New Jersey (MetLife Stadium) and Dallas (AT&T Stadium) host 10 matches each - the most of any host city. The Final is at MetLife on July 19, 2026." },
  { question: "Which city hosts the World Cup 2026 Opening Match?", answer: "Mexico City hosts the Opening Match on June 11, 2026 at Estadio Azteca - host nation Mexico vs South Africa. Azteca is the only stadium to have hosted three World Cups (1970, 1986, 2026)." },
  { question: "Which is the easiest host city for international visitors?", answer: [
    "All host cities are well-served by international airports. The most efficient airport-to-stadium transit is in Seattle (Sea-Tac to Lumen Field via Link Light Rail in 35 min) and Los Angeles (LAX to SoFi Stadium in 15-25 min). See the ",
    { text: "best airports guide", href: "/blog/best-airports-for-world-cup-2026/" },
    " for the full breakdown.",
  ] },
]

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Host Cities - The Complete Guide to All 16 Cities",
  description:
    "The complete guide to every 2026 FIFA World Cup host city. All 16 cities across the USA, Canada and Mexico - matches, stadiums, climate, transit, hotels, multi-city trip planning, and how to pick the right city for your World Cup trip.",
  keywords: [
    "World Cup 2026 host cities",
    "World Cup host cities",
    "World Cup cities",
    "World Cup 2026 cities",
    "2026 FIFA World Cup host cities",
    "World Cup Atlanta",
    "World Cup Seattle",
    "World Cup Los Angeles",
    "World Cup Dallas",
    "World Cup Kansas City",
    "World Cup Houston",
    "World Cup Boston",
    "World Cup Philadelphia",
  ],
  alternates: alternatesFor(`${SITE}/cities`),
  openGraph: {
    title: "World Cup 2026 Host Cities - The Complete Guide to All 16 Cities",
    description:
      "The complete guide to every 2026 FIFA World Cup host city. Matches, stadiums, climate, transit, hotels, and multi-city trip planning.",
    url: `${SITE}/cities`,
    type: "website",
  },
}

// Region groupings - FIFA's 2026 schedule organization
const REGIONS: { name: string; description: string; slugs: string[] }[] = [
  {
    name: "Western",
    description: "Pacific time zone matches - early evening kickoffs feel more like afternoon if you're in the Eastern US.",
    slugs: ["vancouver", "guadalajara", "seattle", "san-francisco-bay-area", "los-angeles"],
  },
  {
    name: "Central",
    description: "Mountain and Central time zones, plus Mexico City. The geographic center of gravity for the tournament.",
    slugs: ["monterrey", "mexico-city", "kansas-city", "dallas", "houston", "atlanta"],
  },
  {
    name: "Eastern",
    description: "Eastern time zone matches - close together by US standards, easy to combine multiple cities by train or short flights.",
    slugs: ["toronto", "boston", "new-york-new-jersey", "philadelphia", "miami"],
  },
]

// Closest multi-city pairings - sub-3-hour drives or short flights
const PAIRINGS: { cities: [string, string]; distance: string; note: string }[] = [
  { cities: ["new-york-new-jersey", "philadelphia"], distance: "~1h 40min drive", note: "Shortest gap of any pairing. Amtrak in 80 min. Easy double-header." },
  { cities: ["boston", "new-york-new-jersey"], distance: "~3.5h drive · 4h Amtrak", note: "Northeast Corridor train links the two effortlessly." },
  { cities: ["seattle", "vancouver"], distance: "~3h drive · 4h train", note: "International border (US/CA), but well-trafficked." },
  { cities: ["dallas", "houston"], distance: "~3.5h drive · 1h flight", note: "Texas double-header. Both stadiums have AC roofs." },
  { cities: ["los-angeles", "san-francisco-bay-area"], distance: "~6h drive · 1h 30m flight", note: "Pacific cluster - frequent flights or scenic Pacific Coast Highway drive." },
  { cities: ["mexico-city", "guadalajara"], distance: "~7h drive · 1h flight", note: "Mexico's two biggest cities. Cheap domestic flights make this easy." },
]

const citiesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "FIFA World Cup 2026 Host Cities",
  description: "All 16 host cities for the 2026 FIFA World Cup across the USA, Canada, and Mexico.",
}

const countryGroups = [
  { flag: "🇺🇸", label: "United States", key: "USA" as const },
  { flag: "🇲🇽", label: "Mexico", key: "Mexico" as const },
  { flag: "🇨🇦", label: "Canada", key: "Canada" as const },
]

const stadiumImageMap = new Map(stadiums.map((s) => [s.slug, s.image]))

export default function CitiesPage() {
  const itemListJsonLd = {
    ...citiesJsonLd,
    numberOfItems: cities.length,
    itemListElement: cities.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/cities/${c.slug}`,
      name: c.name,
    })),
  }

  const faqJsonLd = quickAnswersJsonLd(CITIES_QA)

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="text-center px-6 mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">
          World Cup 2026 Host Cities
        </h1>
        <p className="text-[#615E6E] text-base max-w-2xl mx-auto leading-relaxed">
          The complete guide to every 2026 FIFA World Cup host city. 16 cities, three countries,
          39 days, 104 matches - here&apos;s how to think about your trip and pick the right city.
        </p>
      </div>

      <TripPlanner />

      {/* Stats strip */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "16", label: "Host Cities", sub: "USA · Mexico · Canada" },
            { value: "3", label: "Countries", sub: "First 3-host World Cup" },
            { value: "104", label: "Matches", sub: "Across 39 days" },
            { value: "5,300+", label: "Kilometers", sub: "Coast-to-coast span" },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-3xl font-extrabold text-[#231645] leading-none">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF] mt-2">{s.label}</p>
              <p className="text-[10px] text-[#615E6E] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <QuickAnswers heading="World Cup 2026 host cities - quick answers" items={CITIES_QA} variant="compact" />

      {/* Long-form intro */}
      <section className="max-w-3xl mx-auto px-6 mt-12 mb-14 space-y-5">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#231645]">A first-of-its-kind tournament</h2>
        <p className="text-[#615E6E] leading-relaxed text-base">
          The 2026 FIFA World Cup is the first hosted across three nations - the USA, Canada, and Mexico -
          and the first to use a 48-team, 12-group format. The tournament spans 16 cities and 16 stadiums,
          from <Link href="/cities/vancouver" className="text-[#7E43FF] font-semibold hover:underline">Vancouver</Link> on
          the Pacific to <Link href="/cities/miami" className="text-[#7E43FF] font-semibold hover:underline">Miami</Link> on
          the Atlantic, with <Link href="/cities/mexico-city" className="text-[#7E43FF] font-semibold hover:underline">Mexico City</Link> hosting
          the Opening Match at Estadio Azteca and <Link href="/cities/new-york-new-jersey" className="text-[#7E43FF] font-semibold hover:underline">New York / New Jersey</Link> hosting
          the Final at MetLife Stadium.
        </p>
        <p className="text-[#615E6E] leading-relaxed text-base">
          Every host city brings its own character to the tournament. The American venues lean heavily on
          NFL stadiums - oversized, weather-controlled, well-served by interstates and rideshare more than rail.
          Mexico's three host cities each carry decades of football culture: Estadio Azteca alone has hosted
          three World Cups (1970, 1986, 2026). Toronto and Vancouver round out Canada's first World Cup hosting
          duties since 1991 - both cities offer the most efficient airport-to-stadium transit of any venue in
          the tournament.
        </p>
        <p className="text-[#615E6E] leading-relaxed text-base">
          Below: stats for every city at a glance, the regional groupings to plan around, our suggested
          multi-city itineraries for fans following a team or wanting to see two stadiums, and full per-city
          guides covering transport, hotels by price tier, fan zones, food, safety notes, and FAQs.
        </p>
      </section>

      {/* Region overview */}
      <section className="max-w-5xl mx-auto px-6 mb-14">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Geographic clusters</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">The three regions</h2>
          <p className="text-[#615E6E] text-sm max-w-2xl mx-auto leading-relaxed">
            FIFA organized the 2026 schedule in geographic clusters to reduce team travel between matches.
            Most group-stage matches stay within a region - useful info if you&apos;re following one team across
            multiple games.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REGIONS.map((r) => (
            <div key={r.name} className="card p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">{r.name} Region</p>
              <p className="text-[#615E6E] text-xs leading-relaxed mb-4">{r.description}</p>
              <ul className="space-y-1.5">
                {r.slugs.map((slug) => {
                  const c = cities.find((x) => x.slug === slug)
                  if (!c) return null
                  return (
                    <li key={slug}>
                      <Link href={`/cities/${slug}`} className="text-sm font-semibold text-[#231645] hover:text-[#7E43FF] transition-colors flex justify-between gap-2">
                        <span>{c.name}</span>
                        <span className="text-[#615E6E] text-xs whitespace-nowrap">{c.games} matches</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* At-a-glance comparison table */}
      <section className="max-w-5xl mx-auto px-6 mb-14">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">All cities at a glance</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645]">Compare every host city</h2>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#f8f7fd]">
                  <th className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E]">City</th>
                  <th className="text-left px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] hidden sm:table-cell">Stadium</th>
                  <th className="text-center px-3 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E]">Matches</th>
                  <th className="text-right px-3 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] hidden md:table-cell">Capacity</th>
                  <th className="text-left px-3 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] hidden md:table-cell">June Weather</th>
                </tr>
              </thead>
              <tbody>
                {[...cities].sort((a, b) => b.games - a.games).map((c, i) => {
                  const flag = c.country === "USA" ? "🇺🇸" : c.country === "Mexico" ? "🇲🇽" : "🇨🇦"
                  return (
                    <tr key={c.slug} className="border-b border-black/[0.04] hover:bg-[#f8f7fd]/40 transition-colors" style={{ borderBottomWidth: i === cities.length - 1 ? 0 : 1 }}>
                      <td className="px-4 py-3.5">
                        <Link href={`/cities/${c.slug}`} className="font-bold text-[#231645] hover:text-[#7E43FF] transition-colors flex items-center gap-2">
                          <span aria-hidden>{flag}</span>
                          <span>{c.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-[#615E6E] hidden sm:table-cell">{c.stadium}</td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-block min-w-[28px] px-2 py-0.5 rounded-full text-xs font-extrabold" style={{ background: "#7E43FF15", color: "#7E43FF" }}>
                          {c.games}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right text-[#615E6E] tabular-nums hidden md:table-cell">{c.capacity.toLocaleString()}</td>
                      <td className="px-3 py-3.5 text-[#615E6E] text-xs hidden md:table-cell">{c.weatherJune.split(",")[0]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How to choose your host city */}
      <section className="max-w-5xl mx-auto px-6 mb-14">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Decision guide</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">How to choose your host city</h2>
          <p className="text-[#615E6E] text-sm max-w-2xl mx-auto leading-relaxed">
            With 16 candidates, picking where to fly to matters. Here are the four lenses we use to think about it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">By weather</p>
            <h3 className="font-bold text-[#231645] text-base mb-2">Cool + comfortable</h3>
            <p className="text-[#615E6E] text-sm leading-relaxed mb-2">
              Want to skip June heat? <Link href="/cities/seattle" className="text-[#7E43FF] font-semibold hover:underline">Seattle</Link>,{" "}
              <Link href="/cities/vancouver" className="text-[#7E43FF] font-semibold hover:underline">Vancouver</Link>,{" "}
              <Link href="/cities/boston" className="text-[#7E43FF] font-semibold hover:underline">Boston</Link>,{" "}
              <Link href="/cities/toronto" className="text-[#7E43FF] font-semibold hover:underline">Toronto</Link>, and{" "}
              <Link href="/cities/san-francisco-bay-area" className="text-[#7E43FF] font-semibold hover:underline">SF Bay Area</Link> stay 55-78°F (13-26°C).
              Avoid Houston, Dallas, Monterrey and Miami (90-100°F / 32-38°C).
            </p>
            <Link href="/blog/world-cup-2026-weather-guide" className="text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors">
              Full weather guide →
            </Link>
          </div>

          <div className="card p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">By transit</p>
            <h3 className="font-bold text-[#231645] text-base mb-2">Airport-to-stadium ease</h3>
            <p className="text-[#615E6E] text-sm leading-relaxed mb-2">
              Easiest: <Link href="/cities/los-angeles" className="text-[#7E43FF] font-semibold hover:underline">LA</Link> (5 km),{" "}
              <Link href="/cities/seattle" className="text-[#7E43FF] font-semibold hover:underline">Seattle</Link> (35-min Light Rail),{" "}
              <Link href="/cities/atlanta" className="text-[#7E43FF] font-semibold hover:underline">Atlanta</Link> (20-min MARTA),{" "}
              <Link href="/cities/toronto" className="text-[#7E43FF] font-semibold hover:underline">Toronto</Link> (UP Express).
              Hardest: <Link href="/cities/boston" className="text-[#7E43FF] font-semibold hover:underline">Boston</Link> (45 km, no rail),{" "}
              <Link href="/cities/dallas" className="text-[#7E43FF] font-semibold hover:underline">Dallas</Link>,{" "}
              <Link href="/cities/kansas-city" className="text-[#7E43FF] font-semibold hover:underline">Kansas City</Link>.
            </p>
            <Link href="/blog/best-airports-for-world-cup-2026" className="text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors">
              Best airports guide →
            </Link>
          </div>

          <div className="card p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">By matches</p>
            <h3 className="font-bold text-[#231645] text-base mb-2">Most matches in one city</h3>
            <p className="text-[#615E6E] text-sm leading-relaxed">
              <Link href="/cities/new-york-new-jersey" className="text-[#7E43FF] font-semibold hover:underline">New York / New Jersey</Link> and{" "}
              <Link href="/cities/dallas" className="text-[#7E43FF] font-semibold hover:underline">Dallas</Link> each host 10 matches - the most.{" "}
              <Link href="/cities/atlanta" className="text-[#7E43FF] font-semibold hover:underline">Atlanta</Link> and{" "}
              <Link href="/cities/houston" className="text-[#7E43FF] font-semibold hover:underline">Houston</Link> host 9 each.{" "}
              <Link href="/cities/guadalajara" className="text-[#7E43FF] font-semibold hover:underline">Guadalajara</Link> hosts only 2,{" "}
              <Link href="/cities/monterrey" className="text-[#7E43FF] font-semibold hover:underline">Monterrey</Link> 4. If you&apos;re basing in one
              city for the tournament, pick a high-match host.
            </p>
          </div>

          <div className="card p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">By atmosphere</p>
            <h3 className="font-bold text-[#231645] text-base mb-2">Where the soul of the tournament is</h3>
            <p className="text-[#615E6E] text-sm leading-relaxed">
              <Link href="/cities/mexico-city" className="text-[#7E43FF] font-semibold hover:underline">Mexico City</Link>: the Opening Match
              at Estadio Azteca, fan-fest at the Zócalo, deep football culture.{" "}
              <Link href="/cities/new-york-new-jersey" className="text-[#7E43FF] font-semibold hover:underline">New York / New Jersey</Link>:
              the Final, biggest closing party.{" "}
              <Link href="/cities/miami" className="text-[#7E43FF] font-semibold hover:underline">Miami</Link>: 3rd Place + Latin American
              fan crowds.{" "}
              <Link href="/cities/toronto" className="text-[#7E43FF] font-semibold hover:underline">Toronto</Link> &amp;{" "}
              <Link href="/cities/vancouver" className="text-[#7E43FF] font-semibold hover:underline">Vancouver</Link>: Canada&apos;s first World Cup matches in 35 years.
            </p>
          </div>
        </div>
      </section>

      {/* Multi-city pairings */}
      <section className="max-w-5xl mx-auto px-6 mb-14">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Trip planning</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-3">Closest multi-city pairings</h2>
          <p className="text-[#615E6E] text-sm max-w-2xl mx-auto leading-relaxed">
            Want to see two World Cup matches at different stadiums? These are the easiest city pairs to combine -
            short drives, frequent trains, or one-hour domestic flights.
          </p>
        </div>

        <div className="space-y-2.5">
          {PAIRINGS.map((p) => {
            const a = cities.find((c) => c.slug === p.cities[0])
            const b = cities.find((c) => c.slug === p.cities[1])
            if (!a || !b) return null
            return (
              <div key={`${p.cities[0]}-${p.cities[1]}`} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 sm:flex-1 min-w-0">
                  <Link href={`/cities/${a.slug}`} className="font-extrabold text-[#231645] text-sm hover:text-[#7E43FF] transition-colors truncate">
                    {a.name}
                  </Link>
                  <span className="text-[#615E6E]">↔</span>
                  <Link href={`/cities/${b.slug}`} className="font-extrabold text-[#231645] text-sm hover:text-[#7E43FF] transition-colors truncate">
                    {b.name}
                  </Link>
                </div>
                <span className="text-xs font-bold text-[#7E43FF] bg-[#7E43FF]/10 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                  {p.distance}
                </span>
                <p className="text-[#615E6E] text-xs sm:flex-1 sm:max-w-md leading-relaxed">{p.note}</p>
              </div>
            )
          })}
        </div>
      </section>

      <div id="cities-grid" className="max-w-6xl mx-auto px-6 mt-10 scroll-mt-24">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">All 16 cities</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645]">Browse by country</h2>
        </div>
        {countryGroups.map(({ flag, label, key }) => {
          const list = cities.filter((c) => c.country === key)
          return (
            <div key={key} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{flag}</span>
                <h2 className="text-2xl font-extrabold text-[#231645]">{label}</h2>
                <span className="text-sm text-[#615E6E] font-medium">({list.length} cities)</span>
                <div className="flex-1 h-px bg-black/[0.06]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {list.map((city) => {
                  const img = stadiumImageMap.get(city.stadiumSlug) ?? city.images[0]
                  return (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}`}
                      className="card overflow-hidden flex flex-col group"
                    >
                      {/* Photo */}
                      <div className="relative w-full h-44 overflow-hidden bg-[#f5f4fa]">
                        {img ? (
                          <Image
                            src={img}
                            alt={city.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🏙️</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className="absolute bottom-3 right-3 text-white text-xs font-bold bg-black/40 rounded-full px-2.5 py-1">
                          {city.games} matches
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-extrabold text-[#231645] mb-0.5 group-hover:text-[#7E43FF] transition-colors">
                          {city.name}
                        </h3>
                        <p className="text-sm font-semibold text-[#7E43FF] mb-2">
                          {city.stadium} · {city.capacity.toLocaleString()}
                        </p>
                        <p className="text-[#615E6E] text-sm line-clamp-2 flex-1">{city.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-[#615E6E]">{city.timezone}</span>
                          <span className="text-[#615E6E] opacity-30">·</span>
                          <span className="text-xs text-[#615E6E]">{city.weatherJune.split(",")[0]}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Related guides - blog deep links */}
      <section className="max-w-5xl mx-auto px-6 mt-16">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-2">Deeper reading</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645]">More planning guides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: "/tickets", label: "Tickets", title: "World Cup 2026 Tickets Guide", body: "Sale phases, FIFA ID, hospitality, and how to avoid scams." },
            { href: "/blog/world-cup-2026-visa-guide", label: "Visa", title: "Visa Guide: USA, Canada, Mexico", body: "ESTA, eTA, FMM rules and how to plan multi-country trips." },
            { href: "/blog/best-airports-for-world-cup-2026", label: "Airports", title: "Best Airports to Fly Into", body: "Closest airport for each stadium with transit times." },
            { href: "/blog/world-cup-2026-weather-guide", label: "Weather", title: "Weather in Every Host City", body: "Climate forecast and what to pack city by city." },
            { href: "/blog/world-cup-2026-currency-money-guide", label: "Money", title: "Currency, Tipping &amp; Tax", body: "USD, CAD, MXN. Tipping norms, sales tax, cashless rules." },
            { href: "/blog/world-cup-2026-fan-zones", label: "Fan Zones", title: "Where to Watch Without a Ticket", body: "Official Fan Festivals plus pubs in every host city." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="card p-5 block group hover:border-[#7E43FF]/40 transition-all hover:-translate-y-0.5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">{item.label}</p>
              <h3 className="font-extrabold text-[#231645] text-base mb-1 leading-tight group-hover:text-[#7E43FF] transition-colors" dangerouslySetInnerHTML={{ __html: item.title }} />
              <p className="text-[#615E6E] text-xs leading-relaxed">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
