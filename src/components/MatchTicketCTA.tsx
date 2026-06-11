// Multi-vendor ticket CTA for a single match. Each vendor link is a search URL
// that lands the user on the vendor's results page for this fixture. None of
// these have working "deep links" to a specific WC2026 event yet (FIFA hasn't
// fully delivered tickets), but search-page landing is the best public option
// for now and converts via affiliate when those programs are wired up.

import type { Match } from "@/data/matches"
import { cities } from "@/data/cities"

const cityMap = new Map(cities.map((c) => [c.slug, c]))

const FIFA_OFFICIAL =
  "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026/tickets"

function searchTerm(m: Match): string {
  if (m.homeTeam !== "TBD" && m.awayTeam !== "TBD") {
    return `${m.homeTeam} vs ${m.awayTeam} World Cup 2026`
  }
  const city = cityMap.get(m.citySlug)?.name ?? ""
  return `World Cup 2026 ${city} ${m.round}`.trim()
}

export default function MatchTicketCTA({ match }: { match: Match }) {
  const q = encodeURIComponent(searchTerm(match))

  // Each search URL is the most reliable public-search format for that vendor.
  // Add ?marker=/aid=… to these strings once each affiliate program is approved.
  const vendors = [
    {
      name: "FIFA Official",
      url: FIFA_OFFICIAL,
      tag: "Primary - face value",
      primary: true,
    },
    {
      name: "StubHub",
      url: `https://www.stubhub.com/search?q=${q}`,
      tag: "Resale - guaranteed delivery",
    },
    {
      name: "SeatGeek",
      url: `https://seatgeek.com/search?search=${q}`,
      tag: "Resale - Deal Score ratings",
    },
    {
      name: "Vivid Seats",
      url: `https://www.vividseats.com/search?searchTerm=${q}`,
      tag: "Resale",
    },
    {
      name: "TickPick",
      url: `https://www.tickpick.com/search?event=${q}`,
      tag: "Resale - no buyer fees",
    },
  ]

  const teams =
    match.homeTeam === "TBD" || match.awayTeam === "TBD"
      ? `Match #${match.matchNumber}`
      : `${match.homeTeam} vs ${match.awayTeam}`

  return (
    <section
      id="tickets"
      className="rounded-2xl mb-10 overflow-hidden scroll-mt-24"
      style={{
        background: "linear-gradient(135deg, #f6f4ff 0%, #ede7ff 100%)",
        border: "1px solid rgba(126,67,255,0.20)",
      }}
      aria-labelledby="match-tickets-heading"
    >
      <div className="px-6 md:px-8 py-7">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">
          Get tickets
        </p>
        <h2 id="match-tickets-heading" className="text-2xl md:text-3xl font-extrabold text-[#231645] leading-tight mb-2">
          Find tickets for {teams}
        </h2>
        <p className="text-sm text-[#615E6E] leading-relaxed mb-5">
          FIFA is the only legitimate primary source. Resale links below open a search page
          for this match on each marketplace. Compare prices before you buy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {vendors.map((v) => (
            <a
              key={v.name}
              href={v.url}
              target="_blank"
              rel={v.primary ? "noopener" : "noopener sponsored"}
              className={
                v.primary
                  ? "flex items-center justify-between gap-3 rounded-xl px-5 py-4 bg-[#7E43FF] text-white hover:bg-[#6a30e6] transition-colors group"
                  : "flex items-center justify-between gap-3 rounded-xl px-5 py-4 bg-white border border-black/[0.08] hover:border-[#7E43FF]/40 hover:shadow-md transition-all group"
              }
            >
              <div className="min-w-0">
                <p className={`font-extrabold text-sm leading-tight ${v.primary ? "text-white" : "text-[#231645]"}`}>
                  {v.name}
                </p>
                <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${v.primary ? "text-white/80" : "text-[#615E6E]"}`}>
                  {v.tag}
                </p>
              </div>
              <span
                className={`text-xl font-extrabold flex-shrink-0 group-hover:translate-x-0.5 transition-transform ${v.primary ? "text-white" : "text-[#7E43FF]"}`}
                aria-hidden
              >
                →
              </span>
            </a>
          ))}
        </div>

        <p className="text-[11px] text-[#615E6E] leading-relaxed mt-5">
          Tickets sold by anyone outside FIFA or the marketplaces above are typically cancelled before kickoff.
          We may earn a commission on some links - this never costs you anything extra and helps keep this guide free.
        </p>
      </div>
    </section>
  )
}
