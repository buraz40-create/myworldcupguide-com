import type { Metadata } from "next"
import Link from "next/link"
import { broadcasters } from "@/data/broadcasters"
import { quickAnswersJsonLd, type QA } from "@/components/QuickAnswers"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

const FAQ: QA[] = [
  {
    question: "What TV channel is the 2026 World Cup on in the USA?",
    answer:
      "In English, FOX and FS1 carry every World Cup 2026 match across the FOX Sports network. In Spanish, Telemundo and Universo air every match on TV with the full 104-match catalog streaming on Peacock. FOX Sports also streams English coverage via the FOX Sports app and FOX Live.",
  },
  {
    question: "How can I watch the 2026 World Cup for free?",
    answer:
      "Free-to-air options depend on country. In the UK, BBC and ITV share all 104 matches free on BBC iPlayer and ITVX. In Australia, SBS broadcasts every match free. In Mexico, Canal 5 (Televisa) and Azteca 7 carry games free-to-air. In the US, an over-the-air antenna picks up FOX and Telemundo. Most other major markets (Germany ARD/ZDF, Spain RTVE, Brazil Globo, Japan NHK) also have free-to-air coverage for the biggest matches.",
  },
  {
    question: "Can I stream every World Cup 2026 match in the US?",
    answer:
      "Yes. In English, FOX Sports app streams every FOX/FS1 broadcast with a TV-provider login or a streaming bundle like Sling TV, Hulu Live, YouTube TV, or FuboTV. In Spanish, Peacock has all 104 matches included with the standard Peacock subscription, plus the Telemundo Deportes website streams live to authenticated users.",
  },
  {
    question: "Who has the Canada World Cup 2026 broadcast rights?",
    answer:
      "Bell Media. CTV airs the biggest matches free-to-air; TSN carries the full lineup on cable with companion streaming on TSN+. French-language coverage is on RDS (cable) and noovo.ca. Canada's home matches against Bosnia and Herzegovina, and one further group-stage opponent are simulcast across all the channels.",
  },
  {
    question: "When are the FOX vs FS1 channel splits announced?",
    answer:
      "FOX publishes its weekly matchday channel assignments about 7-10 days ahead of each round. Group-stage matches are typically split between FOX (the bigger draws and US Men's National Team games) and FS1. Knockout matches from the Round of 32 onward generally air on the FOX broadcast network. Check the match page on this site closer to kickoff for the confirmed channel.",
  },
]

export const metadata: Metadata = {
  title: "Where to Watch World Cup 2026 - TV Channels & Streaming by Country",
  description:
    "Every TV channel and streaming service carrying the 2026 FIFA World Cup. Country-by-country guide for USA (FOX, Telemundo, Peacock), Canada (CTV, TSN), Mexico (TUDN), UK (BBC, ITV) and more.",
  keywords: [
    "world cup 2026 tv channel",
    "what channel is the world cup on",
    "where to watch world cup 2026",
    "world cup 2026 streaming",
    "world cup 2026 fox channel",
    "world cup 2026 telemundo schedule",
    "world cup 2026 free stream",
    "world cup 2026 broadcast rights",
  ],
  alternates: alternatesFor(`${SITE}/how-to-watch`),
  openGraph: {
    title: "Where to Watch World Cup 2026 - TV Channels by Country",
    description:
      "Country-by-country guide to every World Cup 2026 broadcaster - FOX, Telemundo, Peacock, BBC, ITV, TSN, TUDN and more.",
    url: `${SITE}/how-to-watch`,
    type: "website",
  },
}

export default function HowToWatchPage() {
  const faqJsonLd = quickAnswersJsonLd(FAQ)
  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#231645] font-medium">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-[#231645] font-semibold">How to watch</span>
      </nav>

      <header className="mb-10">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF]">Broadcast guide</span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#231645] mt-2 mb-3 leading-tight">
          Where to watch the 2026 FIFA World Cup
        </h1>
        <p className="text-base md:text-lg text-[#615E6E] leading-relaxed">
          Every official broadcaster and streaming service carrying the World Cup, country by country. Each match page on this site
          also lists the specific channel where the FOX-vs-FS1 or Telemundo-vs-Universo split has been published.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {broadcasters.map((c) => (
          <article key={c.countryCode} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl" aria-hidden>{c.emoji}</span>
              <h2 className="text-lg font-extrabold text-[#231645]">{c.countryName}</h2>
            </div>
            <ul className="space-y-1.5">
              {c.broadcasters.map((b, i) => (
                <li key={i} className="text-sm">
                  {b.url ? (
                    <a href={b.url} target="_blank" rel="noopener" className="font-semibold text-[#231645] hover:text-[#7E43FF] transition-colors">
                      {b.name}
                    </a>
                  ) : (
                    <span className="font-semibold text-[#231645]">{b.name}</span>
                  )}
                  <span className="text-xs text-[#615E6E] ml-1.5">
                    ({b.type === "stream" ? "stream" : "TV"}{b.note ? `, ${b.note}` : ""})
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#231645] mb-4">How the US rights work</h2>
        <div className="space-y-4 text-[#231645] text-base leading-relaxed">
          <p>
            <strong>FOX Sports</strong> holds the English-language rights to every match. The split is usually:
            FOX (broadcast network) gets the biggest draws like the opener, USMNT group games, all matches from the
            quarterfinals onward, and the Final. FS1 (cable) gets the rest of the group stage and the Round of 32.
            Channel assignments are published ~10 days ahead by FOX.
          </p>
          <p>
            <strong>Telemundo</strong> holds the US Spanish-language rights. Telemundo broadcasts the marquee matches
            on its broadcast network; Universo (cable) takes the rest. The full 104-match catalog streams on
            <Link href="https://www.peacocktv.com/sports/soccer" className="text-[#7E43FF] font-semibold ml-1 underline">Peacock</Link> in Spanish.
          </p>
          <p>
            If you don&apos;t have cable, FOX&apos;s coverage streams on the
            <Link href="https://www.foxsports.com/live/" className="text-[#7E43FF] font-semibold ml-1 underline">FOX Sports app</Link> with
            a TV-provider login, or any live-TV streaming bundle (YouTube TV, Hulu+Live TV, FuboTV, Sling Blue, DirecTV Stream)
            that includes FOX and FS1.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#231645] mb-5">FAQ</h2>
        <div className="space-y-4">
          {FAQ.map((f, i) => (
            <details key={i} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-bold text-[#231645]">{f.question}</summary>
              <p className="text-sm text-[#615E6E] mt-3 leading-relaxed">{typeof f.answer === "string" ? f.answer : f.answer.map((p, j) => typeof p === "string" ? p : <a key={j} href={p.href} className="text-[#7E43FF] underline">{p.text}</a>)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[#f8f7fd] p-6 text-center">
        <p className="text-sm font-bold text-[#231645] mb-2">Looking for a specific match?</p>
        <p className="text-sm text-[#615E6E] mb-4">Every match page has its own &ldquo;Where to watch&rdquo; panel with the country breakdown and channel-specific overrides.</p>
        <Link href="/schedule" className="btn-primary inline-flex text-sm">Browse the full schedule</Link>
      </section>
    </div>
  )
}
