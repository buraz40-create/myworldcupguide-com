import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { stadiums, getStadiumBySlug } from "@/data/stadiums"
import { getCityBySlug } from "@/data/cities"
import { getStadiumGuideBySlug } from "@/data/stadiumGuides"
import { getStadiumDetailsBySlug } from "@/data/stadiumDetails"
import { matches, slugForMatch } from "@/data/matches"
import MatchDayPanel from "@/components/MatchDayPanel"
import StadiumMap from "@/components/StadiumMap"
import StadiumSeatingChart from "@/components/StadiumSeatingChart"
import { alternatesFor } from "@/lib/hreflang"
import YouTubeEmbed from "@/components/YouTubeEmbed"
import { getStadiumVideo } from "@/lib/contentVideos"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return stadiums.map((s) => ({ slug: s.slug }))
}

const SITE = "https://myworldcupguide.com"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const stadium = getStadiumBySlug(slug)
  if (!stadium) return {}
  const title = `${stadium.name} World Cup 2026 - Matches, Capacity & Tickets`
  const description = `${stadium.name} in ${stadium.cityName} hosts ${stadium.wcMatches} 2026 FIFA World Cup matches. Capacity ${stadium.capacity.toLocaleString()}, ${stadium.roof} roof. Schedule, ticket info and venue details.`
  return {
    title,
    description,
    keywords: [
      `${stadium.name} World Cup`,
      `${stadium.name} World Cup 2026`,
      `${stadium.name} World Cup tickets`,
      `${stadium.name} World Cup games`,
      `World Cup ${stadium.name}`,
      `${stadium.cityName} World Cup`,
      "World Cup 2026 stadiums",
      "World Cup 2026 venues",
    ],
    alternates: alternatesFor(`${SITE}/stadiums/${stadium.slug}`),
    openGraph: {
      title,
      description,
      url: `${SITE}/stadiums/${stadium.slug}`,
      type: "website",
      images: stadium.image ? [{ url: stadium.image.startsWith("http") ? stadium.image : `${SITE}${stadium.image}` }] : undefined,
    },
  }
}

export default async function StadiumPage({ params }: Props) {
  const { slug } = await params
  const stadium = getStadiumBySlug(slug)
  if (!stadium) notFound()

  const city = getCityBySlug(stadium.citySlug)
  const guide = getStadiumGuideBySlug(stadium.slug)
  const details = getStadiumDetailsBySlug(stadium.slug)
  const flag = stadium.country === "USA" ? "🇺🇸" : stadium.country === "Mexico" ? "🇲🇽" : "🇨🇦"

  // All matches at this venue, in chronological order
  const stadiumMatches = matches
    .filter((m) => m.stadiumSlug === stadium.slug)
    .sort((a, b) => a.matchNumber - b.matchNumber)
  const formatMatchDate = (d: string) =>
    new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

  const stadiumJsonLd: { "@context": string; "@graph": Record<string, unknown>[] } = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "StadiumOrArena",
        name: stadium.name,
        description: stadium.description,
        url: `${SITE}/stadiums/${stadium.slug}`,
        maximumAttendeeCapacity: stadium.capacity,
        address: {
          "@type": "PostalAddress",
          addressLocality: stadium.cityName,
          addressCountry: stadium.country === "USA" ? "US" : stadium.country === "Mexico" ? "MX" : "CA",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Stadiums", item: `${SITE}/stadiums` },
          { "@type": "ListItem", position: 3, name: stadium.name, item: `${SITE}/stadiums/${stadium.slug}` },
        ],
      },
    ],
  }

  if (guide && guide.faqs.length > 0) {
    stadiumJsonLd["@graph"].push({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stadiumJsonLd) }}
      />
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/stadiums" className="hover:text-[#231645] transition-colors font-medium">Stadiums</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">{stadium.name}</span>
        </nav>

        {/* Hero image */}
        {stadium.image && (
          <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-8 bg-[#f5f4fa]">
            <Image
              src={stadium.image}
              alt={stadium.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white/80 text-sm font-semibold mb-1">{flag} {stadium.cityName} · {stadium.country}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">{stadium.name}</h1>
            </div>
          </div>
        )}

        {/* Title (if no image) */}
        {!stadium.image && (
          <div className="mb-8">
            <p className="text-[#7E43FF] font-semibold text-sm mb-1">{flag} {stadium.cityName}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645]">{stadium.name}</h1>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Capacity", value: stadium.capacity.toLocaleString() },
            { label: "WC Matches", value: stadium.wcMatches.toString() },
            { label: "Roof", value: stadium.roof },
            { label: "Opened", value: stadium.opened.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-2xl font-extrabold text-[#7E43FF] mb-0.5 leading-tight">{value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#231645] mb-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* About */}
        <section className="card p-8 mb-8">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">About {stadium.name}</h2>
          <p className="text-[#615E6E] leading-relaxed text-base">{stadium.description}</p>
          {details && (
            <p className="text-[#615E6E] leading-relaxed text-base mt-3 pt-3 border-t border-black/[0.05]">
              <span className="font-bold text-[#231645]">Notable:</span> {details.signature}
            </p>
          )}
        </section>

        {/* Map + Address */}
        {details && (
          <section className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Location &amp; how to find it</h2>
            <StadiumMap name={stadium.name} address={details.address} coordinates={details.coordinates} />
          </section>
        )}

        {/* Seating layout */}
        <section className="mb-8">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-2">Seating layout &amp; ticket categories</h2>
          <p className="text-[#615E6E] text-sm mb-5">
            FIFA prices every match in four categories. Here&apos;s where each typically sits at {stadium.name}.
          </p>
          <StadiumSeatingChart
            stadiumName={stadium.name}
            stadiumSlug={stadium.slug}
            officialSeatingUrl={details?.officialSeatingUrl}
          />
        </section>

        {/* All World Cup matches at this venue */}
        {stadiumMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">
              {stadiumMatches.length} World Cup matches at {stadium.name}
            </h2>
            <p className="text-[#615E6E] text-sm mb-4">
              Every 2026 FIFA World Cup match scheduled at this venue, in chronological order.
            </p>
            <div className="card overflow-hidden">
              {stadiumMatches.map((m, i) => {
                const isTBD = m.homeTeam === "TBD" || m.awayTeam === "TBD"
                return (
                  <Link
                    key={m.id}
                    href={`/matches/${slugForMatch(m)}/`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f8f7fd] transition-colors"
                    style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7E43FF] bg-[#7E43FF]/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      {m.round}
                    </span>
                    <span className="font-semibold text-[#231645] text-sm flex-1 truncate min-w-0">
                      {isTBD ? `Match ${m.matchNumber}` : <>{m.homeTeam} <span className="text-[#615E6E] font-normal">vs</span> {m.awayTeam}</>}
                    </span>
                    <span className="text-xs text-[#615E6E] hidden sm:inline whitespace-nowrap">{formatMatchDate(m.date)}</span>
                    <span className="text-xs font-bold text-[#231645] bg-[#f5f4fa] px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      {m.time} local
                    </span>
                    <span className="text-[#7E43FF] font-bold flex-shrink-0">→</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Home team + WC rounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-[#615E6E] mb-1">Home Team</p>
            <p className="text-xl font-extrabold text-[#231645]">{stadium.homeTeam}</p>
            <p className="text-sm text-[#615E6E] mt-1">{stadium.surface}</p>
          </div>

          <div className="card p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-[#615E6E] mb-3">WC 2026 Rounds Hosted</p>
            <div className="flex flex-wrap gap-2">
              {stadium.wcRounds.map((r) => (
                <span
                  key={r}
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "#7E43FF15", color: "#7E43FF", border: "1px solid #7E43FF30" }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Match-day essentials (full panel) */}
        {guide && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">Match-day essentials</h2>
            <p className="text-[#615E6E] text-sm mb-5">
              Everything you need to walk into {stadium.name} for a 2026 World Cup match - bags, gates, transit, parking, and what's allowed inside.
            </p>
            <MatchDayPanel guide={guide} variant="full" />
          </section>
        )}

        {/* Food & drink inside */}
        {details && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">Food &amp; drink inside the stadium</h2>
            <p className="text-[#615E6E] text-sm mb-5">
              What you can eat, drink, and try - plus the venue&apos;s signature dishes worth seeking out.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Concessions</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.concessions}</p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Beer &amp; drinks</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.craftBeer}</p>
              </div>
              <div className="card p-5 md:col-span-2 border-l-4 border-[#7E43FF]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Don&apos;t miss</p>
                <p className="text-[#231645] text-sm leading-relaxed font-medium">{details.signature}</p>
              </div>
            </div>
          </section>
        )}

        {/* Accessibility */}
        {details && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">Accessibility</h2>
            <p className="text-[#615E6E] text-sm mb-5">
              Wheelchair access, sensory accommodations, and other support services. Request these via FIFA.com when buying your ticket.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Wheelchair</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.accessibility.wheelchair}</p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Sensory</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.accessibility.sensory}</p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Other support</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.accessibility.other}</p>
              </div>
            </div>
          </section>
        )}

        {/* Family */}
        {details && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">Bringing kids and families</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Nursing &amp; family rooms</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.family.nursingRoom}</p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Children &amp; infants</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.family.childTickets}</p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Strollers</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.family.strollerPolicy}</p>
              </div>
            </div>
          </section>
        )}

        {/* Practical info: photo, lost & found, first aid, smoking, tour */}
        {details && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Practical info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Photography</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.photography}</p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Lost &amp; found</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.lostAndFound}</p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">First aid</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.firstAid}</p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Smoking &amp; vaping</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.smokingArea}</p>
              </div>
              <div className="card p-5 md:col-span-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Stadium tours</p>
                <p className="text-[#615E6E] text-sm leading-relaxed">{details.stadiumTour}</p>
              </div>
            </div>
          </section>
        )}

        {/* First-time visitor tips */}
        {details && details.firstTimeTips.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-2">First-time visitor tips</h2>
            <p className="text-[#615E6E] text-sm mb-5">
              Insider notes specific to {stadium.name} - the things that make match day smoother.
            </p>
            <div className="space-y-2.5">
              {details.firstTimeTips.map((tip, i) => (
                <div key={i} className="card p-5 flex gap-4 items-start">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm"
                    style={{ background: "linear-gradient(135deg, #231645, #7E43FF)" }}
                    aria-hidden
                  >
                    {i + 1}
                  </div>
                  <p className="text-[#615E6E] text-sm leading-relaxed flex-1 pt-1">{tip}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fun facts */}
        <section className="mb-8">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Stadium Facts</h2>
          <div className="space-y-3">
            {stadium.funFacts.map((fact, i) => (
              <div key={i} className="card p-5 flex gap-4 items-start">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #231645, #7E43FF)" }}
                >
                  {i + 1}
                </span>
                <p className="text-[#615E6E] leading-relaxed text-sm">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        {guide && guide.faqs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-4">{stadium.name} FAQ</h2>
            <div className="space-y-3">
              {guide.faqs.map((f, i) => (
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

        {/* City guide link */}
        {city && (
          <section className="card p-7 mb-8">
            <h2 className="text-xl font-extrabold text-[#231645] mb-2">Planning a Visit?</h2>
            <p className="text-[#615E6E] text-sm mb-4">
              Read the full {city.name} city guide for transport routes, neighbourhoods, and visitor tips.
            </p>
            <Link href={`/cities/${city.slug}`} className="btn-primary text-sm">
              {city.name} Visitor Guide →
            </Link>
          </section>
        )}

        {(() => {
          const v = getStadiumVideo(stadium.slug)
          return v ? (
            <YouTubeEmbed videoId={v.videoId} title={v.title} channel={v.channel} heading={`Inside ${stadium.name}`} />
          ) : null
        })()}

        <div className="pt-6 border-t border-black/[0.06]">
          <Link
            href="/stadiums"
            className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold"
          >
            ← Back to All Stadiums
          </Link>
        </div>

      </div>
    </div>
  )
}
