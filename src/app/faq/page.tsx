import type { Metadata } from "next"
import Link from "next/link"
import { ticketsFaqs } from "@/data/ticketsFaqs"
import { cityGuides } from "@/data/cityGuides"
import { stadiumGuides } from "@/data/stadiumGuides"
import { cities } from "@/data/cities"
import { stadiums } from "@/data/stadiums"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

const cityName = new Map(cities.map((c) => [c.slug, c.name]))
const stadiumName = new Map(stadiums.map((s) => [s.slug, s.name]))

// Aggregate every FAQ across the site
const allCityFaqs = cityGuides.flatMap((g) =>
  g.faqs.map((f) => ({ ...f, source: "city" as const, slug: g.slug, label: cityName.get(g.slug) ?? g.slug }))
)
const allStadiumFaqs = stadiumGuides.flatMap((g) =>
  g.faqs.map((f) => ({ ...f, source: "stadium" as const, slug: g.slug, label: stadiumName.get(g.slug) ?? g.slug }))
)
const allTicketsFaqs = ticketsFaqs.map((f) => ({ ...f, source: "tickets" as const, slug: "tickets", label: "Tickets" }))

const TOTAL_FAQS = allCityFaqs.length + allStadiumFaqs.length + allTicketsFaqs.length

export const metadata: Metadata = {
  title: `World Cup 2026 FAQ - ${TOTAL_FAQS}+ Questions Answered`,
  description: `Every common question about the 2026 FIFA World Cup, answered. Tickets and prices, host cities, stadiums, transport, FIFA ID, hospitality, scams to avoid, and venue-specific match-day info.`,
  keywords: [
    "World Cup 2026 FAQ",
    "World Cup FAQ",
    "FIFA World Cup 2026 questions",
    "World Cup 2026 help",
    "FIFA World Cup 2026 FAQ",
    "How does the World Cup work",
    "World Cup tickets FAQ",
    "World Cup travel FAQ",
  ],
  alternates: alternatesFor(`${SITE}/faq/`),
  openGraph: {
    title: `World Cup 2026 FAQ - ${TOTAL_FAQS}+ Questions Answered`,
    description: "Tickets, cities, stadiums, travel, hospitality - every common 2026 FIFA World Cup question.",
    url: `${SITE}/faq/`,
    type: "website",
  },
}

export default function FaqPage() {
  // Group city FAQs by city, stadium FAQs by stadium
  const cityGroups = cityGuides
    .map((g) => ({ slug: g.slug, label: cityName.get(g.slug) ?? g.slug, faqs: g.faqs }))
    .filter((c) => c.faqs.length > 0)

  const stadiumGroups = stadiumGuides
    .map((g) => ({ slug: g.slug, label: stadiumName.get(g.slug) ?? g.slug, faqs: g.faqs }))
    .filter((s) => s.faqs.length > 0)

  const allFaqsForSchema = [
    ...allTicketsFaqs.map((f) => ({ question: f.question, answer: f.answer })),
    ...allCityFaqs.map((f) => ({ question: f.question, answer: f.answer })),
    ...allStadiumFaqs.map((f) => ({ question: f.question, answer: f.answer })),
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: `World Cup 2026 FAQ - ${TOTAL_FAQS}+ Questions Answered`,
        url: `${SITE}/faq/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE}/faq/` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: allFaqsForSchema.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-24 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">FAQ</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="pill" style={{ background: "#7E43FF", color: "#fff", border: "none" }}>
              {TOTAL_FAQS} answers
            </span>
            <span className="pill">Updated April 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3 leading-tight">
            World Cup 2026 FAQ
          </h1>
          <p className="text-[#615E6E] text-lg leading-relaxed">
            Every common question about the 2026 FIFA World Cup, in one place. Tickets, host cities, stadiums,
            transport, hospitality, safety, and the practical details for getting to a match. Click any question
            to expand the answer.
          </p>
        </header>

        {/* Table of contents */}
        <nav className="card p-6 mb-10" aria-label="FAQ sections">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-3">Jump to</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm">
            <a href="#tickets" className="text-[#231645] hover:text-[#7E43FF] font-semibold transition-colors">Tickets ({allTicketsFaqs.length})</a>
            <a href="#cities" className="text-[#231645] hover:text-[#7E43FF] font-semibold transition-colors">Cities ({allCityFaqs.length})</a>
            <a href="#stadiums" className="text-[#231645] hover:text-[#7E43FF] font-semibold transition-colors">Stadiums ({allStadiumFaqs.length})</a>
          </div>
        </nav>

        {/* TICKETS */}
        <section id="tickets" className="mb-12 scroll-mt-8">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-extrabold text-[#231645]">Tickets &amp; buying</h2>
            <span className="text-xs font-bold text-[#7E43FF] bg-[#7E43FF]/10 px-2.5 py-1 rounded-full">{allTicketsFaqs.length}</span>
            <div className="flex-1 h-px bg-black/[0.06]" />
            <Link href="/tickets/" className="text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors whitespace-nowrap">
              Full guide →
            </Link>
          </div>
          <div className="space-y-2.5">
            {allTicketsFaqs.map((f, i) => (
              <details key={`t-${i}`} className="card p-5 group">
                <summary className="font-bold text-[#231645] text-sm cursor-pointer list-none flex items-start justify-between gap-3 group-open:text-[#7E43FF]">
                  <span>{f.question}</span>
                  <span className="text-[#7E43FF] flex-shrink-0 group-open:rotate-45 transition-transform text-lg leading-none font-light">+</span>
                </summary>
                <p className="text-[#615E6E] text-sm leading-relaxed mt-3 pt-3 border-t border-black/[0.05]">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CITIES */}
        <section id="cities" className="mb-12 scroll-mt-8">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-extrabold text-[#231645]">Host cities</h2>
            <span className="text-xs font-bold text-[#7E43FF] bg-[#7E43FF]/10 px-2.5 py-1 rounded-full">{allCityFaqs.length}</span>
            <div className="flex-1 h-px bg-black/[0.06]" />
            <Link href="/cities/" className="text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors whitespace-nowrap">
              All cities →
            </Link>
          </div>

          {cityGroups.map((c) => (
            <div key={c.slug} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-bold text-[#231645]">{c.label}</h3>
                <span className="text-[10px] font-bold text-[#615E6E]/60">{c.faqs.length} questions</span>
                <div className="flex-1 h-px bg-black/[0.04]" />
                <Link href={`/cities/${c.slug}/`} className="text-[11px] font-semibold text-[#7E43FF] hover:text-[#231645] transition-colors whitespace-nowrap">
                  {c.label} guide →
                </Link>
              </div>
              <div className="space-y-2">
                {c.faqs.map((f, i) => (
                  <details key={`c-${c.slug}-${i}`} className="card p-4 group">
                    <summary className="font-semibold text-[#231645] text-[13px] cursor-pointer list-none flex items-start justify-between gap-3 group-open:text-[#7E43FF]">
                      <span>{f.question}</span>
                      <span className="text-[#7E43FF] flex-shrink-0 group-open:rotate-45 transition-transform text-base leading-none font-light">+</span>
                    </summary>
                    <p className="text-[#615E6E] text-[13px] leading-relaxed mt-2 pt-2 border-t border-black/[0.05]">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* STADIUMS */}
        <section id="stadiums" className="mb-12 scroll-mt-8">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-extrabold text-[#231645]">Stadiums &amp; match day</h2>
            <span className="text-xs font-bold text-[#7E43FF] bg-[#7E43FF]/10 px-2.5 py-1 rounded-full">{allStadiumFaqs.length}</span>
            <div className="flex-1 h-px bg-black/[0.06]" />
            <Link href="/stadiums/" className="text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors whitespace-nowrap">
              All stadiums →
            </Link>
          </div>

          {stadiumGroups.map((s) => (
            <div key={s.slug} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-bold text-[#231645]">{s.label}</h3>
                <span className="text-[10px] font-bold text-[#615E6E]/60">{s.faqs.length} questions</span>
                <div className="flex-1 h-px bg-black/[0.04]" />
                <Link href={`/stadiums/${s.slug}/`} className="text-[11px] font-semibold text-[#7E43FF] hover:text-[#231645] transition-colors whitespace-nowrap">
                  {s.label} guide →
                </Link>
              </div>
              <div className="space-y-2">
                {s.faqs.map((f, i) => (
                  <details key={`s-${s.slug}-${i}`} className="card p-4 group">
                    <summary className="font-semibold text-[#231645] text-[13px] cursor-pointer list-none flex items-start justify-between gap-3 group-open:text-[#7E43FF]">
                      <span>{f.question}</span>
                      <span className="text-[#7E43FF] flex-shrink-0 group-open:rotate-45 transition-transform text-base leading-none font-light">+</span>
                    </summary>
                    <p className="text-[#615E6E] text-[13px] leading-relaxed mt-2 pt-2 border-t border-black/[0.05]">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Still curious */}
        <section className="mb-10">
          <div className="card p-7 text-center">
            <h2 className="text-xl font-extrabold text-[#231645] mb-2">Still have a question?</h2>
            <p className="text-[#615E6E] text-sm mb-5 leading-relaxed">
              Browse the full guides for tickets, your host city, stadium, and matches - they go deeper than the FAQ summaries.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/tickets/" className="btn-primary text-xs">Tickets guide</Link>
              <Link href="/cities/" className="btn-outline text-xs">Host cities</Link>
              <Link href="/stadiums/" className="btn-outline text-xs">Stadiums</Link>
              <Link href="/schedule/" className="btn-outline text-xs">Schedule</Link>
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-black/[0.06]">
          <Link href="/" className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold">
            ← Back to home
          </Link>
        </div>

      </div>
    </div>
  )
}
