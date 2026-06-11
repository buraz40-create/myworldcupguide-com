import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { groups } from "@/data/groups"
import { teams } from "@/data/teams"
import { matches, slugForMatch } from "@/data/matches"
import { getStadiumBySlug } from "@/data/stadiums"
import { getCityBySlug } from "@/data/cities"
import { getBaseCamp } from "@/data/baseCamps"
import { groupWinnerOdds, championOdds } from "@/data/marketOdds"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

type Props = { params: Promise<{ letter: string }> }

export async function generateStaticParams() {
  return groups.map((g) => ({ letter: g.letter.toLowerCase() }))
}

function fmtLong(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

// FIFA 2026 Round-of-32 path for the winner / runner-up / best-third of each
// group. Pulled from FIFA regs §12.6. Helps fans see where their group leads.
const NEXT_ROUND_PATH: Record<string, { winner: string; runnerUp: string; thirdPath: string }> = {
  A: { winner: "1A faces a third-placed team in M73", runnerUp: "2A faces 2I in M75",      thirdPath: "Third-place option pool 1" },
  B: { winner: "1B faces 2K in M83",                   runnerUp: "2B faces 2C in M85",      thirdPath: "Third-place option pool 2" },
  C: { winner: "1C faces a third-placed team in M76",  runnerUp: "2C faces 2B in M85",      thirdPath: "Third-place option pool 1" },
  D: { winner: "1D faces 2J in M78",                   runnerUp: "2D faces 2H in M81",      thirdPath: "Third-place option pool 2" },
  E: { winner: "1E faces a third-placed team in M74",  runnerUp: "2E faces 2L in M82",      thirdPath: "Third-place option pool 3" },
  F: { winner: "1F faces a third-placed team in M77",  runnerUp: "2F faces 2G in M84",      thirdPath: "Third-place option pool 3" },
  G: { winner: "1G faces 2F in M84",                   runnerUp: "2G faces 1F",             thirdPath: "Third-place option pool 4" },
  H: { winner: "1H faces 2D in M81",                   runnerUp: "2H faces 2D in M81",      thirdPath: "Third-place option pool 4" },
  I: { winner: "1I faces a third-placed team in M77",  runnerUp: "2I faces 2A in M75",      thirdPath: "Third-place option pool 5" },
  J: { winner: "1J faces a third-placed team in M78",  runnerUp: "2J faces 1D",             thirdPath: "Third-place option pool 5" },
  K: { winner: "1K faces 2B in M83",                   runnerUp: "2K faces 1B",             thirdPath: "Third-place option pool 6" },
  L: { winner: "1L faces a third-placed team in M82",  runnerUp: "2L faces 2E in M82",      thirdPath: "Third-place option pool 6" },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { letter } = await params
  const L = letter.toUpperCase()
  const g = groups.find((x) => x.letter === L)
  if (!g) return {}
  const teamList = g.teams.map((t) => t.name).join(", ")
  return {
    title: `World Cup 2026 Group ${L}: ${teamList} - Fixtures, Predictions, Odds`,
    description:
      `Complete World Cup 2026 Group ${L} guide. ${teamList}. All 6 fixtures, live Kalshi prediction-market odds, host cities, and team base camps. Updated as the tournament unfolds.`,
    keywords: [
      `World Cup 2026 Group ${L}`,
      `Group ${L} World Cup 2026 fixtures`,
      `Group ${L} World Cup 2026 predictions`,
      `Group ${L} World Cup 2026 odds`,
      ...g.teams.map((t) => `${t.name} Group ${L}`),
    ],
    alternates: alternatesFor(`${SITE}/groups/${letter}/`),
    openGraph: {
      title: `World Cup 2026 Group ${L}: ${teamList}`,
      description: `All 6 Group ${L} fixtures, live market odds, host cities and team base camps.`,
      url: `${SITE}/groups/${letter}/`,
      type: "website",
    },
  }
}

export default async function GroupPage({ params }: Props) {
  const { letter } = await params
  const L = letter.toUpperCase()
  const g = groups.find((x) => x.letter === L)
  if (!g) notFound()

  const groupMatches = matches
    .filter((m) => m.round === "Group Stage" && m.group === L)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.time.localeCompare(b.time)))

  // Projected finishing order = sort teams by market group-winner odds desc
  const projection = [...g.teams]
    .map((t) => ({ ...t, odds: groupWinnerOdds[t.name] ?? 0, champ: championOdds[t.name] ?? 0 }))
    .sort((a, b) => b.odds - a.odds)

  const fav = projection[0]
  const path = NEXT_ROUND_PATH[L]

  const teamDetails = new Map(teams.map((t) => [t.name, t]))

  // JSON-LD: SportsCompetition + BreadcrumbList + ItemList of fixtures
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsCompetition",
        name: `2026 FIFA World Cup Group ${L}`,
        sport: "Soccer",
        organizer: { "@type": "Organization", name: "FIFA" },
        startDate: groupMatches[0]?.date ?? "2026-06-11",
        endDate: groupMatches[groupMatches.length - 1]?.date ?? "2026-06-27",
        competitor: g.teams.map((t) => ({ "@type": "SportsTeam", name: t.name })),
      },
      {
        "@type": "ItemList",
        name: `Group ${L} fixtures`,
        itemListElement: groupMatches.map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SportsEvent",
            name: `${m.homeTeam} vs ${m.awayTeam}`,
            startDate: `${m.date}T${m.time}:00-04:00`,
            sport: "Soccer",
            location: {
              "@type": "Place",
              name: getStadiumBySlug(m.stadiumSlug)?.name ?? m.stadiumSlug,
              address: getCityBySlug(m.citySlug)?.name ?? m.citySlug,
            },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Groups", item: `${SITE}/groups/` },
          { "@type": "ListItem", position: 3, name: `Group ${L}`, item: `${SITE}/groups/${letter}/` },
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
          <Link href="/groups" className="hover:text-[#231645]">Groups</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">Group {L}</span>
        </nav>

        {/* Hero */}
        <header className="rounded-3xl p-8 md:p-10 mb-10 text-white" style={{ background: "linear-gradient(135deg,#231645,#5b22b8)" }}>
          <div className="flex items-center gap-5 mb-5">
            <span className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-5xl font-black leading-none">{L}</span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60">World Cup 2026 · {g.strength} group</p>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">Group {L}</h1>
              <p className="text-white/80 text-sm mt-1">{g.teams.map((t) => t.name).join(" · ")}</p>
            </div>
          </div>
          <p className="text-white/90 leading-relaxed max-w-3xl">
            Four teams, six matches, two automatic Round-of-32 spots plus a chance for the third-placed side via the best-thirds rule.
            {" "}{fav.odds > 0 ? `${fav.name} are the Kalshi market favourite to win Group ${L} at ${Math.round(fav.odds * 100)}%.` : ""}
          </p>
        </header>

        {/* Projected finishing order (from markets) */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Market Projection</h2>
          <p className="text-sm text-[#615E6E] mb-5">Teams ranked by implied probability of winning Group {L} on <a href="https://kalshi.com" target="_blank" rel="noopener noreferrer" className="text-[#7E43FF] font-semibold hover:underline">Kalshi</a> prediction markets. Updates as the tournament unfolds.</p>
          <div className="space-y-2">
            {projection.map((p, i) => {
              const td = teamDetails.get(p.name)
              const accent = i < 2 ? "#10b981" : i === 2 ? "#f59e0b" : "transparent"
              const rowBg  = i < 2 ? "rgba(16,185,129,0.06)" : i === 2 ? "rgba(245,158,11,0.06)" : "#fff"
              return (
                <div key={p.name} className="card p-4 flex items-center gap-3"
                     style={{ background: rowBg, borderLeft: `4px solid ${accent}` }}>
                  <span className="text-lg font-extrabold w-6 text-center tabular-nums" style={{ color: i < 2 ? "#10b981" : i === 2 ? "#f59e0b" : "#615E6E" }}>{i + 1}</span>
                  <Image src={`https://flagcdn.com/w80/${p.iso2.toLowerCase()}.png`} alt={`${p.name} flag`} width={40} height={27} className="rounded-sm flex-shrink-0" unoptimized />
                  <div className="flex-1 min-w-0">
                    {td ? (
                      <Link href={`/teams/${td.slug}/`} className="text-base font-extrabold text-[#231645] hover:underline">{p.name}</Link>
                    ) : (
                      <span className="text-base font-extrabold text-[#231645]">{p.name}</span>
                    )}
                    <p className="text-[10px] text-[#615E6E] font-bold uppercase tracking-wider mt-0.5">{p.confederation} · FIFA #{td?.fifaRanking ?? "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-[#231645] tabular-nums leading-none">{Math.round(p.odds * 100)}%</p>
                    <p className="text-[10px] text-[#615E6E] mt-0.5">Win Group {L}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-[#615E6E] mt-3 italic">Top 2 advance automatically. Third-place teams compete in a 12-group pool for 8 Round-of-32 spots.</p>
        </section>

        {/* Fixtures */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">All 6 Group {L} Fixtures</h2>
          <p className="text-sm text-[#615E6E] mb-5">Every Group {L} match with kickoff time, venue, and host city.</p>
          <div className="space-y-3">
            {groupMatches.map((m) => {
              const v = getStadiumBySlug(m.stadiumSlug)
              const c = getCityBySlug(m.citySlug)
              return (
                <Link key={m.id} href={`/matches/${slugForMatch(m)}/`} className="card p-5 hover:-translate-y-0.5 transition-transform flex flex-col md:flex-row md:items-center gap-3 block">
                  <div className="flex items-center gap-3 md:w-48">
                    <span className="text-[10px] font-extrabold text-[#7E43FF] bg-[#f1ecff] rounded px-2 py-1 tabular-nums">M{m.matchNumber}</span>
                    <span className="text-sm font-bold text-[#231645]">{fmtLong(m.date)}</span>
                    <span className="text-xs text-[#615E6E] tabular-nums ml-auto">{m.time}</span>
                  </div>
                  <div className="flex-1 text-sm font-extrabold text-[#231645]">
                    {m.homeTeam} <span className="text-[#615E6E] font-medium mx-2">vs</span> {m.awayTeam}
                  </div>
                  <p className="text-xs text-[#615E6E] md:text-right">{v?.name ?? m.stadiumSlug} · {c?.name ?? m.citySlug}</p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Team cards */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Teams in Group {L}</h2>
          <p className="text-sm text-[#615E6E] mb-5">Snapshot of each squad. Tap any team for the full fan guide.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {g.teams.map((t) => {
              const td = teamDetails.get(t.name)
              const bc = getBaseCamp(t.name)
              return (
                <div key={t.name} className="card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Image src={`https://flagcdn.com/w80/${t.iso2.toLowerCase()}.png`} alt={`${t.name} flag`} width={48} height={32} className="rounded-sm flex-shrink-0" unoptimized />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-extrabold text-[#231645] truncate">{t.name}</h3>
                      <p className="text-[10px] text-[#615E6E] font-bold uppercase tracking-wider mt-0.5">
                        {t.confederation}
                        {td && <> · FIFA #{td.fifaRanking}</>}
                        {t.isHost && <> · 🏟️ Host</>}
                        {t.isDebutant && <> · 🆕 Debut</>}
                        {t.isHistoricReturn && <> · 🔁 First WC in years</>}
                      </p>
                    </div>
                  </div>
                  {td && (
                    <p className="text-xs text-[#615E6E] leading-relaxed line-clamp-3 mb-3">{td.about}</p>
                  )}
                  {bc && (
                    <p className="text-[11px] text-[#231645] mb-3">
                      <span className="font-bold">Base camp:</span> {bc.city}, {bc.region}
                    </p>
                  )}
                  {td && (
                    <div className="flex gap-3 text-xs">
                      <Link href={`/teams/${td.slug}/`} className="font-bold text-[#7E43FF] hover:underline">Team page →</Link>
                      <Link href={`/teams/${td.slug}/fan-guide/`} className="font-bold text-[#7E43FF] hover:underline">Fan guide →</Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Path to knockout */}
        {path && (
          <section className="mb-10">
            <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Path Through the Bracket</h2>
            <p className="text-sm text-[#615E6E] mb-5">Where Group {L} teams land in the brand-new Round of 32, per FIFA regs §12.6.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#10b981]">1{L} · Group winner</p>
                <p className="text-sm font-bold text-[#231645] mt-2">{path.winner}</p>
              </div>
              <div className="card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#10b981]">2{L} · Runner-up</p>
                <p className="text-sm font-bold text-[#231645] mt-2">{path.runnerUp}</p>
              </div>
              <div className="card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#f59e0b]">3{L} · Third (if best-of-12)</p>
                <p className="text-sm font-bold text-[#231645] mt-2">{path.thirdPath}. Only the top 8 of 12 third-placed teams qualify.</p>
              </div>
            </div>
            <Link href="/blog/world-cup-2026-round-of-32-third-place-chaos/" className="inline-block mt-4 text-xs font-bold text-[#7E43FF] hover:underline">
              Why the best-thirds rule will create the most chaotic R32 ever →
            </Link>
          </section>
        )}

        {/* Related */}
        <section className="pt-8 border-t border-black/[0.06]">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Keep digging</h2>
          <ul className="space-y-2">
            <li><Link href="/predictor" className="text-[#7E43FF] font-semibold hover:underline">Build your bracket → see who you have winning Group {L}</Link></li>
            <li><Link href="/groups" className="text-[#7E43FF] font-semibold hover:underline">All 12 groups overview →</Link></li>
            <li><Link href="/schedule" className="text-[#7E43FF] font-semibold hover:underline">Full World Cup 2026 schedule →</Link></li>
            <li><Link href="/kits" className="text-[#7E43FF] font-semibold hover:underline">Rate the Group {L} kits →</Link></li>
          </ul>
        </section>

      </div>
    </div>
  )
}
