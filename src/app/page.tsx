import Link from "next/link"
import Image from "next/image"
import { cities } from "@/data/cities"
import { stadiums } from "@/data/stadiums"
import { getRecentBlogPosts } from "@/data/blogPosts"
import HeroParticles from "@/components/HeroParticles"
import BlocksGrid from "@/components/BlocksGrid"
import AnimatedCounter from "@/components/AnimatedCounter"
import CityMarquee from "@/components/CityMarquee"
import RadialBracket, { type Tie as RadialTie } from "@/components/RadialBracket"
import { matches } from "@/data/matches"

const HOMEPAGE_FAQS = [
  {
    question: "When is the 2026 FIFA World Cup?",
    answer: "The 2026 FIFA World Cup runs from June 11 to July 19, 2026 - 39 days, the longest World Cup ever. The Opening Match is at Estadio Azteca (Mexico City) on June 11 and the Final is at MetLife Stadium (New York / New Jersey) on July 19.",
  },
  {
    question: "Where is the World Cup 2026 being played?",
    answer: "Across three host countries (USA, Canada, Mexico) in 16 host cities and 16 stadiums - the first World Cup co-hosted by three nations. The USA hosts 78 of the 104 matches; Mexico and Canada host 13 each. All knockout matches from the Round of 32 onward are in the USA.",
  },
  {
    question: "How does the new 48-team World Cup format work?",
    answer: "48 teams in 12 groups of 4. Top two from each group plus the 8 best third-placed teams advance to a brand-new Round of 32 - the first ever at a World Cup. From there it's standard knockout: Round of 16, Quarterfinals, Semi-finals, 3rd Place playoff, Final.",
  },
  {
    question: "When do World Cup 2026 tickets go on sale?",
    answer: "FIFA sells tickets in five sequential phases: Visa Presale Draw, Random Selection Draw, First-Come-First-Served, Last-Minute Sales, and the ongoing FIFA Resale Hub. Buy only at FIFA.com/tickets - the FIFA Resale Hub is the only legitimate secondary market.",
  },
]

export default function HomePage() {
  const usaCities = cities.filter((c) => c.country === "USA")
  const mexicoCities = cities.filter((c) => c.country === "Mexico")
  const canadaCities = cities.filter((c) => c.country === "Canada")
  const stadiumBySlug = new Map(stadiums.map((s) => [s.slug, s]))
  const recentPosts = getRecentBlogPosts(3)

  const r32Ties: RadialTie[] = matches
    .filter((m) => m.round === "Round of 32" && m.homeTeam !== "TBD" && m.awayTeam !== "TBD")
    .sort((a, b) => a.matchNumber - b.matchNumber)
    .map((m) => ({ matchNumber: m.matchNumber, home: m.homeTeam, away: m.awayTeam }))

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {/* Stadium photo: fixed to viewport, extends behind navbar all the way up */}
      <div
        aria-hidden
        className="hero-photo fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay: fixed alongside the photo so the dark→white fade covers from the very top */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,10,40,0.55) 0%, rgba(20,10,40,0.35) 40%, rgba(255,255,255,0.85) 80%, #ffffff 100%)",
        }}
      />

      <div className="relative z-10">

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-4 pb-0">

        <BlocksGrid count={55} className="blocks-grid-bright opacity-90" />
        <HeroParticles />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-[4.5rem] font-extrabold leading-[1.08] tracking-tight text-white mb-5 drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
            Your complete guide<br />to the{" "}
            <span className="text-gradient-purple">2026 World Cup</span>
          </h1>

          <p className="text-lg text-white/90 max-w-xl mx-auto mb-9 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
            City guides, stadium info, match schedules, and visitor tips for all 16 host cities across the USA, Canada, and Mexico.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/cities" className="btn-primary text-[0.95rem]">Browse Host Cities</Link>
            <Link href="/schedule" className="btn-outline text-[0.95rem]">View Schedule</Link>
          </div>
        </div>

        {/* All 18 host cities - auto-scrolling marquee inside browser frame */}
        <div className="relative z-10 mt-14 w-full max-w-5xl mx-auto">
          <div className="card shadow-[0_20px_80px_rgba(35,22,69,0.18)] overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-black/[0.05]" style={{ background: "#fafafa" }}>
              <div className="flex gap-1.5">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div className="flex-1 mx-3 rounded-md px-3 py-1 text-xs text-[#615E6E] text-left" style={{ background: "#f0eefa" }}>
                myworldcupguide.com / 18 host cities
              </div>
            </div>
            <div className="p-4" style={{ background: "#fefeff" }}>
              <CityMarquee />
            </div>
          </div>
        </div>

        {/* Radial knockout bracket */}
        {r32Ties.length === 16 && (
          <div className="relative z-10 mt-16 w-full max-w-2xl mx-auto pb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ffcf6b] mb-1 text-center">The road to the final</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-8 text-center drop-shadow">Tap a team to trace its path to the trophy</h2>
            <RadialBracket ties={r32Ties} />
          </div>
        )}
      </section>

      {/* Smooth fade from hero photo into the white sections below */}
      <div
        aria-hidden
        className="relative h-72 -mt-1"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.8) 60%, rgba(255,255,255,0.97) 85%, #ffffff 100%)",
        }}
      />

      {/* AEO Q&A block - tournament basics in answer format for LLM extraction */}
      <section className="bg-white pt-2 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-3">Quick answers</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#231645] mb-6 leading-tight">
            World Cup 2026 - the basics
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-extrabold text-[#231645] text-base mb-1.5">When is the 2026 FIFA World Cup?</h3>
              <p className="text-[#615E6E] text-sm leading-relaxed">
                The 2026 FIFA World Cup runs from <span className="font-semibold text-[#231645]">June 11 to July 19, 2026</span> -
                39 days, the longest World Cup ever. The Opening Match is at Estadio Azteca (Mexico City) on June 11
                and the Final is at MetLife Stadium (New York / New Jersey) on July 19.
              </p>
            </div>
            <div>
              <h3 className="font-extrabold text-[#231645] text-base mb-1.5">Where is the World Cup 2026 being played?</h3>
              <p className="text-[#615E6E] text-sm leading-relaxed">
                Across <span className="font-semibold text-[#231645]">three host countries (USA, Canada, Mexico)</span> in
                16 host cities and 16 stadiums - the first World Cup co-hosted by three nations. The USA hosts 78
                of the 104 matches; Mexico and Canada host 13 each. All knockout matches from the Round of 32
                onward are in the USA.
              </p>
            </div>
            <div>
              <h3 className="font-extrabold text-[#231645] text-base mb-1.5">How does the new 48-team format work?</h3>
              <p className="text-[#615E6E] text-sm leading-relaxed">
                <span className="font-semibold text-[#231645]">48 teams in 12 groups of 4</span>. Top two from
                each group plus the 8 best third-placed teams advance to a brand-new Round of 32 - the first
                ever at a World Cup. From there it&apos;s standard knockout: Round of 16, Quarterfinals,
                Semi-finals, 3rd Place playoff, Final. <Link href="/blog/world-cup-2026-format-explained/" className="text-[#7E43FF] font-semibold hover:underline">Format guide →</Link>
              </p>
            </div>
            <div>
              <h3 className="font-extrabold text-[#231645] text-base mb-1.5">When do tickets go on sale?</h3>
              <p className="text-[#615E6E] text-sm leading-relaxed">
                FIFA sells tickets in <span className="font-semibold text-[#231645]">five sequential phases</span>:
                Visa Presale Draw, Random Selection Draw, First-Come-First-Served, Last-Minute Sales, and the
                ongoing FIFA Resale Hub. Buy only at FIFA.com/tickets - the FIFA Resale Hub is the only legitimate
                secondary market. <Link href="/tickets/" className="text-[#7E43FF] font-semibold hover:underline">Tickets guide →</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-black/[0.06]">
              {[
                { label: "Host Cities", target: 16 },
                { label: "Teams", target: 48 },
                { label: "Matches", target: 104 },
                { label: "Stadiums", target: 16 },
              ].map((s) => (
                <div key={s.label} className="px-4">
                  <p className="text-4xl font-extrabold text-[#231645]">
                    <AnimatedCounter target={s.target} />
                  </p>
                  <p className="text-sm text-[#615E6E] font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── THE CHALLENGE (like Wiza "The problem") ── */}
      <section className="py-20 px-6 relative overflow-hidden bg-white">
        <BlocksGrid count={20} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="pill mb-6">The Tournament</div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-6 leading-tight">
                The biggest World Cup ever
              </h2>
            </div>
            <div className="space-y-4">
              {[
                "48 teams competing for the first time in history - the largest World Cup ever held.",
                "3 host nations across North America, spanning thousands of miles between venues.",
                "16 world-class stadiums from Estadio Azteca to SoFi Stadium - a list like no other.",
              ].map((text) => (
                <div key={text} className="card p-5">
                  <p className="text-[#615E6E] text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CITIES (large panel like Wiza solution section) ── */}
      <section className="py-6 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="section-panel panel-purple px-8 py-14 relative overflow-hidden">
            <BlocksGrid count={25} />
            <HeroParticles />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="pill inline-flex mb-4">Host Cities</div>
                <h2 className="text-4xl font-extrabold text-[#231645] mb-3">Choose Your City</h2>
                <p className="text-[#615E6E] text-lg max-w-xl mx-auto">
                  Full visitor guides for all 16 cities - transport, neighbourhoods, stadiums, and tips.
                </p>
              </div>

              {[
                { flag: "🇺🇸", label: "United States", list: usaCities },
                { flag: "🇲🇽", label: "Mexico", list: mexicoCities },
                { flag: "🇨🇦", label: "Canada", list: canadaCities },
              ].map(({ flag, label, list }) => (
                <div key={label} className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xl">{flag}</span>
                    <h3 className="text-base font-bold text-[#231645]">{label}</h3>
                    <div className="flex-1 h-px bg-black/[0.08]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {list.map((city) => {
                      const stadium = stadiumBySlug.get(city.stadiumSlug)
                      const img = stadium?.image ?? "/hero-bg.jpg"
                      return (
                        <Link
                          key={city.slug}
                          href={`/cities/${city.slug}`}
                          className="group relative block rounded-2xl overflow-hidden h-44 shadow-[0_2px_12px_-4px_rgba(35,22,69,0.12)] hover:shadow-[0_8px_28px_-6px_rgba(126,67,255,0.35)] hover:-translate-y-1 transition-all duration-300"
                        >
                          {/* Stadium photo */}
                          <Image
                            src={img}
                            alt={`${city.stadium} in ${city.name}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                          />
                          {/* Bottom gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#231645]/95 via-[#231645]/55 to-transparent" />
                          {/* Games badge */}
                          <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-widest text-[#231645] bg-white/95 px-2.5 py-1 rounded-full shadow-md">
                            {city.games} match{city.games === 1 ? "" : "es"}
                          </span>
                          {/* Bottom text */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h4 className="font-extrabold text-lg leading-tight mb-0.5">{city.name}</h4>
                            <p className="text-xs text-white/85 font-semibold truncate">{city.stadium}</p>
                            <p className="text-[10px] text-white/65 mt-0.5">{city.capacity.toLocaleString()} seats</p>
                            {/* CTA on hover */}
                            <span className="block mt-2 max-h-0 overflow-hidden group-hover:max-h-12 transition-all duration-300">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#7E43FF] rounded-full px-3 py-1 shadow-md">
                                Visitor guide
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                              </span>
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 relative overflow-hidden bg-white">
        <BlocksGrid count={20} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="pill inline-flex mb-4">Everything Covered</div>
            <h2 className="text-4xl font-extrabold text-[#231645]">Plan Your Trip in Minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Stadium Guides", desc: "Capacity, surface, roof type, transport routes, and insider facts for all 16 venues.", href: "/stadiums" },
              { title: "City Visitor Guides", desc: "Where to stay, best neighbourhoods, how to get to the stadium, and local tips.", href: "/cities" },
              { title: "Full Schedule", desc: "Every match, every city, every date - from Opening Match to the Final at MetLife.", href: "/schedule" },
            ].map((f) => (
              <Link key={f.title} href={f.href} className="card p-7 block group">
                <h3 className="text-base font-bold text-[#231645] mb-2 group-hover:text-[#7E43FF] transition-colors">{f.title}</h3>
                <p className="text-[#615E6E] text-sm leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG TEASER ── */}
      {recentPosts.length > 0 && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-1">From the blog</p>
                <h2 className="text-3xl font-extrabold text-[#231645]">Long-form guides</h2>
              </div>
              <Link href="/blog" className="text-sm font-bold text-[#7E43FF] hover:text-[#231645] transition-colors whitespace-nowrap">
                All articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}/`}
                  className="card p-5 block group hover:border-[#7E43FF]/40 transition-all hover:-translate-y-0.5"
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">{p.category}</p>
                  <h3 className="font-extrabold text-[#231645] text-base mb-2 leading-tight group-hover:text-[#7E43FF] transition-colors">{p.title}</h3>
                  <p className="text-[#615E6E] text-xs leading-relaxed line-clamp-3 mb-2">{p.description}</p>
                  <p className="text-[10px] text-[#615E6E]">{p.readMinutes} min read</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-10 px-6 pb-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="section-panel panel-pink px-8 py-16 text-center relative overflow-hidden">
            <HeroParticles />
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-[#231645] mb-4">
                Ready to experience<br />
                <span className="text-gradient-purple">the World Cup?</span>
              </h2>
              <p className="text-[#615E6E] mb-8 max-w-md mx-auto">
                Dive into city guides, check the schedule, and start planning the trip of a lifetime.
              </p>
              <Link href="/cities" className="btn-primary text-base">Start Planning →</Link>
            </div>
          </div>
        </div>
      </section>

      </div>
    </>
  )
}
