import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { stadiums } from "@/data/stadiums"
import QuickAnswers, { quickAnswersJsonLd, type QA } from "@/components/QuickAnswers"
import { alternatesFor } from "@/lib/hreflang"

const STADIUMS_QA: QA[] = [
  { question: "How many stadiums are used in the 2026 World Cup?", answer: "16 stadiums across the USA (11), Mexico (3), and Canada (2). All matches from the Round of 32 onward are played in the USA." },
  { question: "Which stadium is hosting the 2026 World Cup Final?", answer: "MetLife Stadium in New York / New Jersey hosts the Final on July 19, 2026. With 82,500 capacity it is the largest US World Cup venue." },
  { question: "Which is the oldest 2026 World Cup stadium?", answer: "Estadio Azteca in Mexico City, opened in 1966. It is the only stadium to have hosted three FIFA World Cups (1970, 1986, 2026), and hosts the 2026 Opening Match." },
  { question: "Which is the smallest 2026 World Cup stadium?", answer: "BMO Field in Toronto, with a standard capacity of about 30,000 - being expanded for the World Cup. The smallest of any 2026 World Cup venue." },
  { question: "Which 2026 World Cup stadiums have a roof?", answer: "AT&T Stadium (Dallas), NRG Stadium (Houston), Mercedes-Benz Stadium (Atlanta), SoFi Stadium (LA), Lumen Field (Seattle, partial), Hard Rock Stadium (Miami, canopy), and BC Place (Vancouver) - retractable or fixed roofs offer protection from heat and rain." },
]

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Stadiums - All 16 Venues, Capacity & Matches",
  description:
    "All 16 World Cup 2026 stadiums and venues across the USA, Canada and Mexico. Capacity, roof type, location, match counts and full info for every 2026 FIFA World Cup venue.",
  keywords: [
    "World Cup 2026 stadiums",
    "2026 World Cup stadiums",
    "World Cup stadiums",
    "World Cup venues",
    "World Cup 2026 venues",
    "World Cup 2026 final stadium",
    "MetLife Stadium World Cup",
    "SoFi Stadium World Cup",
    "Estadio Azteca",
    "Gillette Stadium World Cup",
    "Levi's Stadium World Cup",
  ],
  alternates: alternatesFor(`${SITE}/stadiums`),
  openGraph: {
    title: "World Cup 2026 Stadiums - All 16 Venues, Capacity & Matches",
    description:
      "All 16 World Cup 2026 stadiums across USA, Canada and Mexico. Capacity, location, match counts and full info.",
    url: `${SITE}/stadiums`,
    type: "website",
  },
}

const stadiumsJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "FIFA World Cup 2026 Stadiums",
}

const countryGroups = [
  { flag: "🇺🇸", label: "United States", key: "USA" as const },
  { flag: "🇲🇽", label: "Mexico", key: "Mexico" as const },
  { flag: "🇨🇦", label: "Canada", key: "Canada" as const },
]

const stats = [
  { value: "16", label: "Stadiums" },
  { value: "3", label: "Host Nations" },
  { value: "104", label: "Matches" },
  { value: "16", label: "Host Cities" },
]

export default function StadiumsPage() {
  const faqJsonLd = quickAnswersJsonLd(STADIUMS_QA)
  const itemListJsonLd = {
    ...stadiumsJsonLd,
    numberOfItems: stadiums.length,
    itemListElement: stadiums.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/stadiums/${s.slug}`,
      name: s.name,
    })),
  }

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

      {/* Header */}
      <div className="text-center px-6 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-2">
          World Cup 2026 Stadiums
        </h1>
        <p className="text-[#615E6E] text-sm mb-4">
          16 venues across USA, Canada &amp; Mexico · June 11 – July 19, 2026
        </p>
        <Link
          href="/stadiums/compare/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all"
          style={{ background: "#231645", color: "#fff" }}
        >
          Compare all 16 side-by-side →
        </Link>
      </div>

      <QuickAnswers heading="World Cup 2026 stadiums - quick answers" items={STADIUMS_QA} variant="compact" />

      {/* Stats bar */}
      <div className="mt-12" />
      <div className="max-w-2xl mx-auto px-6 mb-12">
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-4 divide-x divide-black/[0.05]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-4 px-2">
                <span className="text-2xl font-extrabold text-[#231645]">{s.value}</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#615E6E] mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stadiums grouped by country */}
      <div className="max-w-6xl mx-auto px-6">
        {countryGroups.map(({ flag, label, key }) => {
          const list = stadiums.filter((s) => s.country === key)
          return (
            <div key={key} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{flag}</span>
                <h2 className="text-2xl font-extrabold text-[#231645]">{label}</h2>
                <span className="text-sm text-[#615E6E] font-medium">({list.length} venues)</span>
                <div className="flex-1 h-px bg-black/[0.06]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {list.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/stadiums/${s.slug}`}
                    className="card overflow-hidden flex flex-col group"
                  >
                    {/* Stadium photo */}
                    <div className="relative w-full h-48 overflow-hidden bg-[#f5f4fa]">
                      {s.image ? (
                        <Image
                          src={s.image}
                          alt={s.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🏟️</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className="text-white text-xs font-bold bg-black/40 rounded-full px-2.5 py-1">
                          {s.wcMatches} WC matches
                        </span>
                        <span className="text-white text-xs font-semibold bg-black/40 rounded-full px-2.5 py-1">
                          {s.capacity.toLocaleString()} cap.
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-extrabold text-[#231645] mb-0.5 group-hover:text-[#7E43FF] transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-sm font-semibold text-[#7E43FF] mb-2">{s.cityName}</p>
                      <p className="text-sm text-[#615E6E] line-clamp-2 mb-3 flex-1">{s.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.wcRounds.map((r) => (
                          <span
                            key={r}
                            className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                            style={{ background: "#7E43FF15", color: "#7E43FF" }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
