import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { teams, getTeamBySlug } from "@/data/teams"
import { groups } from "@/data/groups"
import { matches } from "@/data/matches"
import { stadiums } from "@/data/stadiums"
import { cities } from "@/data/cities"
import { alternatesFor } from "@/lib/hreflang"
import YouTubeEmbed from "@/components/YouTubeEmbed"
import { getTeamVideo } from "@/lib/contentVideos"
import { getBaseCamp, distanceMiles } from "@/data/baseCamps"
import { stadiumDetails } from "@/data/stadiumDetails"

const teamIso2Map = new Map<string, string>()
for (const g of groups) {
  for (const t of g.teams) teamIso2Map.set(t.name, t.iso2)
}

const matchRoundColors: Record<string, { bg: string; text: string; border: string }> = {
  "Group Stage":  { bg: "#7E43FF15", text: "#7E43FF", border: "#7E43FF" },
  "Round of 32":  { bg: "#3b82f615", text: "#3b82f6", border: "#3b82f6" },
  "Round of 16":  { bg: "#10b98115", text: "#10b981", border: "#10b981" },
  "Quarterfinal": { bg: "#f59e0b15", text: "#f59e0b", border: "#f59e0b" },
  "Semi-final":   { bg: "#ef444415", text: "#ef4444", border: "#ef4444" },
  "3rd Place":    { bg: "#64748b15", text: "#64748b", border: "#64748b" },
  "Final":        { bg: "#eab30820", text: "#a16207", border: "#eab308" },
}

function formatMatchDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return teams.map((t) => ({ slug: t.slug }))
}

const SITE = "https://myworldcupguide.com"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const team = getTeamBySlug(slug)
  if (!team) return {}
  const title = `${team.name} World Cup 2026 - Squad, Group, Schedule`
  const description = `${team.name} at the 2026 FIFA World Cup: Group ${team.group}, FIFA ranking #${team.fifaRanking}, coach ${team.coach}, key players, group stage fixtures and full World Cup history.`
  return {
    title,
    description,
    keywords: [
      `${team.name} World Cup`,
      `${team.name} World Cup 2026`,
      `${team.name} squad`,
      `${team.name} 2026 FIFA World Cup`,
      `${team.name} Group ${team.group}`,
      "World Cup 2026 teams",
      "2026 FIFA World Cup qualified teams",
    ],
    alternates: alternatesFor(`${SITE}/teams/${team.slug}`),
    openGraph: {
      title,
      description,
      url: `${SITE}/teams/${team.slug}`,
      type: "website",
    },
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stageColor(stage: string): string {
  if (stage === "Champion") return "bg-yellow-100 text-yellow-800 border-yellow-300"
  if (stage === "Runner-up") return "bg-slate-100 text-slate-700 border-slate-300"
  if (stage === "3rd Place" || stage === "4th Place") return "bg-amber-50 text-amber-700 border-amber-300"
  if (stage === "Semi-final") return "bg-purple-100 text-purple-800 border-[#7E43FF]/30"
  if (stage === "Quarterfinal") return "bg-blue-50 text-blue-700 border-blue-200"
  if (stage === "Round of 16") return "bg-teal-50 text-teal-700 border-teal-200"
  return "bg-gray-50 text-gray-500 border-gray-200"
}

function stageDot(stage: string): string {
  if (stage === "Champion") return "bg-yellow-400"
  if (stage === "Runner-up") return "bg-slate-400"
  if (stage === "3rd Place" || stage === "4th Place") return "bg-amber-400"
  if (stage === "Semi-final") return "bg-purple-500"
  if (stage === "Quarterfinal") return "bg-blue-500"
  if (stage === "Round of 16") return "bg-teal-500"
  return "bg-gray-300"
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TeamPage({ params }: Props) {
  const { slug } = await params
  const team = getTeamBySlug(slug)
  if (!team) notFound()

  const group = groups.find((g) => g.letter === team.group)
  const groupOpponents = group?.teams.filter((t) => t.name !== team.name) ?? []
  const baseCamp = getBaseCamp(team.name)

  // Distance from base camp to each group-stage match venue
  type CampTrip = { matchNumber: number; opponent: string; stadium: string; city: string; miles: number }
  const baseCampTrips: CampTrip[] = baseCamp
    ? matches
        .filter((m) => m.round === "Group Stage" && (m.homeTeam === team.name || m.awayTeam === team.name))
        .sort((a, b) => a.matchNumber - b.matchNumber)
        .map((m) => {
          const opp = m.homeTeam === team.name ? m.awayTeam : m.homeTeam
          const stadium = stadiums.find((s) => s.slug === m.stadiumSlug)
          const city = cities.find((c) => c.slug === m.citySlug)
          const detail = stadiumDetails.find((d) => d.slug === m.stadiumSlug)
          const miles = detail ? distanceMiles(baseCamp.coordinates, detail.coordinates) : 0
          return {
            matchNumber: m.matchNumber,
            opponent: opp,
            stadium: stadium?.name ?? m.stadiumSlug,
            city: city?.name ?? m.citySlug,
            miles,
          }
        })
    : []

  // Derive an internal "Read more" target. If the base camp's facility is one
  // of our host stadiums, link there. Else if the base camp city is one of our
  // host cities, link to that city page. Else no link (don't link to Wikipedia).
  let baseCampLink: { href: string; label: string } | null = null
  if (baseCamp) {
    const stadiumMatch = baseCamp.facility
      ? stadiums.find((s) => baseCamp.facility!.toLowerCase().includes(s.name.toLowerCase()))
      : undefined
    const cityMatch = cities.find((c) => c.name.toLowerCase() === baseCamp.city.toLowerCase())
    if (stadiumMatch) baseCampLink = { href: `/stadiums/${stadiumMatch.slug}/`, label: stadiumMatch.name }
    else if (cityMatch) baseCampLink = { href: `/cities/${cityMatch.slug}/`, label: cityMatch.name }
  }

  const sortedHistory = [...team.wcHistory].sort((a, b) => b.year - a.year)

  // Auto-generated team FAQs from existing data
  const teamMatches2026 = matches.filter((m) => m.homeTeam === team.name || m.awayTeam === team.name)
  const opponentNames = groupOpponents.map((o) => o.name).join(", ")
  const teamFaqs: { question: string; answer: string }[] = [
    {
      question: `What group is ${team.name} in for the 2026 World Cup?`,
      answer: opponentNames
        ? `${team.name} is in Group ${team.group} of the 2026 FIFA World Cup, alongside ${opponentNames}.`
        : `${team.name} is in Group ${team.group} of the 2026 FIFA World Cup.`,
    },
    {
      question: `Who is the manager of ${team.name} at the 2026 World Cup?`,
      answer: `${team.coach} manages ${team.name} at the 2026 FIFA World Cup.`,
    },
    {
      question: `What is ${team.name}'s FIFA ranking?`,
      answer: `${team.name} is ranked #${team.fifaRanking} in the FIFA World Rankings heading into the 2026 World Cup.`,
    },
    {
      question: `How many World Cups has ${team.name} played in?`,
      answer: `${team.name} has appeared in ${team.worldCupAppearances} FIFA World Cups including 2026. Their best result is ${team.bestResult}${team.titles > 0 ? `, and they have won the World Cup ${team.titles} time${team.titles === 1 ? "" : "s"}` : ""}.`,
    },
  ]
  if (teamMatches2026.length > 0) {
    const groupStageMatches = teamMatches2026.filter((m) => m.round === "Group Stage").sort((a, b) => a.matchNumber - b.matchNumber)
    if (groupStageMatches.length > 0) {
      const lines = groupStageMatches.map((m) => {
        const opp = m.homeTeam === team.name ? m.awayTeam : m.homeTeam
        const dateStr = new Date(m.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric" })
        return `${dateStr} vs ${opp}`
      }).join("; ")
      teamFaqs.push({
        question: `When does ${team.name} play in the 2026 World Cup?`,
        answer: `${team.name}'s 2026 World Cup group stage matches: ${lines}. Knockout matches are determined by group stage results.`,
      })
    }
  }
  if (team.keyPlayers.length > 0) {
    teamFaqs.push({
      question: `Who are ${team.name}'s key players for the 2026 World Cup?`,
      answer: `Key players to watch for ${team.name} include ${team.keyPlayers.slice(0, 5).join(", ")}.`,
    })
  }
  if (baseCamp) {
    teamFaqs.push({
      question: `Where is ${team.name}'s base camp for the 2026 World Cup?`,
      answer: `${team.name} will be based in ${baseCamp.city}, ${baseCamp.region} (${baseCamp.country})${baseCamp.facility ? `, training at ${baseCamp.facility}` : ""}. Per FIFA regulations, the team stays at this base camp throughout the group stage and travels to match venues one day before each game.`,
    })
  }

  const teamJsonLd: { "@context": string; "@graph": Record<string, unknown>[] } = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsTeam",
        name: team.name,
        sport: "Soccer",
        url: `${SITE}/teams/${team.slug}`,
        coach: { "@type": "Person", name: team.coach },
        memberOf: { "@type": "SportsOrganization", name: team.confederation },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Groups", item: `${SITE}/groups` },
          { "@type": "ListItem", position: 3, name: team.name, item: `${SITE}/teams/${team.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: teamFaqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen pt-8 pb-24 px-4 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLd) }}
      />
      <div className="max-w-4xl mx-auto">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm text-[#615E6E] mb-10" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#231645] transition-colors font-medium">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/groups" className="hover:text-[#231645] transition-colors font-medium">Groups</Link>
          <span className="opacity-40">/</span>
          <span className="text-[#231645] font-semibold">{team.name}</span>
        </nav>

        {/* ── Hero ── */}
        <div className="section-panel panel-purple px-8 py-10 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Flag */}
            <div className="shrink-0">
              <Image
                src={`https://flagcdn.com/w80/${team.iso2}.png`}
                alt={`${team.name} flag`}
                width={80}
                height={60}
                unoptimized
                className="rounded-lg shadow-md border border-black/10 object-cover"
                style={{ width: 80, height: 60 }}
              />
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="pill" style={{ background: "#7E43FF", color: "#fff", border: "none" }}>
                  Group {team.group}
                </span>
                <span className="pill">{team.confederation}</span>
                {team.titles > 0 && (
                  <span className="pill" style={{ background: "#fef9c3", color: "#92400e", borderColor: "#fde68a" }}>
                    {"🏆".repeat(Math.min(team.titles, 5))} {team.titles}× Champion
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#231645] leading-tight mb-2">
                {team.name}
              </h1>
              <p className="text-[#615E6E] font-medium text-sm">
                FIFA Ranking <span className="font-extrabold text-[#231645] text-lg">#{team.fifaRanking}</span>
                <span className="mx-2 opacity-30">·</span>
                Coach: <span className="font-semibold text-[#231645]">{team.coach}</span>
              </p>
              <Link
                href={`/teams/${team.slug}/fan-guide/`}
                className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#7E43FF,#231645)" }}
              >
                📘 {team.name} Fan Guide
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick stats strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "WC Appearances",
              value: team.worldCupAppearances.toString(),
              sub: "including 2026",
            },
            {
              label: "Best Result",
              value: team.bestResult,
              sub: "all-time",
            },
            {
              label: "Titles",
              value: team.titles > 0 ? `${team.titles} 🏆` : "None",
              sub: team.titles > 0 ? "World Cup wins" : "yet to win",
            },
            {
              label: "FIFA Ranking",
              value: `#${team.fifaRanking}`,
              sub: "April 2026 (approx.)",
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-2xl font-extrabold text-[#7E43FF] mb-0.5 leading-tight">{value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#231645] mb-0.5">{label}</p>
              <p className="text-[10px] text-[#615E6E]">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── About ── */}
        <section className="card p-8 mb-8">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">About {team.name}</h2>
          <p className="text-[#615E6E] leading-relaxed text-base">{team.about}</p>
        </section>

        {/* ── Team Base Camp ── */}
        <section className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-extrabold text-[#231645]">Team Base Camp</h2>
            {baseCamp && (
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  background: baseCamp.country === "Mexico" ? "#10b98115" : baseCamp.country === "Canada" ? "#ef444415" : "#3b82f615",
                  color:      baseCamp.country === "Mexico" ? "#047857"   : baseCamp.country === "Canada" ? "#b91c1c"   : "#1d4ed8",
                }}
              >
                {baseCamp.country === "Mexico" ? "🇲🇽" : baseCamp.country === "Canada" ? "🇨🇦" : "🇺🇸"} {baseCamp.country}
              </span>
            )}
          </div>
          {baseCamp ? (
            <div className="card overflow-hidden">
              {/* Hero image */}
              <div className="relative w-full" style={{ aspectRatio: "16 / 7" }}>
                <Image
                  src={baseCamp.image}
                  alt={`${team.name} Team Base Camp, ${baseCamp.city}, ${baseCamp.region}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                  unoptimized
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(35,22,69,0.55) 0%, rgba(35,22,69,0) 50%)" }}
                />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-90">Base camp</p>
                  <p className="text-xl font-extrabold leading-tight">{baseCamp.city}, {baseCamp.region}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-7">
                {baseCamp.facility && (
                  <div className="rounded-xl bg-[#f8f7fd] border border-[#7E43FF]/15 px-5 py-3 inline-flex items-center gap-3 mb-5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF]">Training at</span>
                    <span className="text-sm font-bold text-[#231645]">{baseCamp.facility}</span>
                  </div>
                )}

                <p className="text-[#231645] leading-relaxed mb-5">{baseCamp.blurb}</p>

                <p className="text-[#615E6E] leading-relaxed text-sm mb-6">
                  Per FIFA regulations (§18.3), {team.name} stays at this base camp for the entire group stage and travels to each match venue one day before kickoff (and returns the same night or the next day).
                </p>

                {/* Travel-to-match-venue table */}
                {baseCampTrips.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#615E6E] mb-3">
                      Distance to each group-stage match
                    </p>
                    <div className="rounded-xl border border-black/[0.06] overflow-hidden divide-y divide-black/[0.04]">
                      {baseCampTrips.map((t) => (
                        <div key={t.matchNumber} className="flex items-center gap-3 px-4 py-3 text-sm">
                          <span className="text-[10px] font-bold text-[#7E43FF] w-9 tabular-nums flex-shrink-0">M{t.matchNumber}</span>
                          <span className="font-semibold text-[#231645] truncate flex-1">vs {t.opponent}</span>
                          <span className="text-[#615E6E] text-xs hidden sm:inline truncate">{t.stadium} · {t.city}</span>
                          <span
                            className="text-xs font-extrabold tabular-nums px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                            style={{
                              background: t.miles < 50 ? "#10b98115" : t.miles < 500 ? "#f59e0b15" : "#ef444415",
                              color:      t.miles < 50 ? "#047857"   : t.miles < 500 ? "#b45309"   : "#b91c1c",
                            }}
                            title={t.miles < 50 ? "Local, drivable" : t.miles < 500 ? "Regional, short flight or long drive" : "Cross-country, flight required"}
                          >
                            {t.miles.toLocaleString()} mi
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#615E6E]/70 mt-2">
                      Straight-line distance from {baseCamp.city} to each match stadium. Actual travel adds airport time on flights.
                    </p>
                  </div>
                )}

                {baseCampLink && (
                  <div className="flex items-center pt-3 border-t border-black/[0.05]">
                    <Link
                      href={baseCampLink.href}
                      className="text-xs font-bold text-[#7E43FF] hover:text-[#231645] transition-colors ml-auto"
                    >
                      About {baseCampLink.label} →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-7">
              <p className="text-[#615E6E] leading-relaxed mb-2">
                {team.name}&apos;s Team Base Camp has not been publicly confirmed yet. Most national teams announce their location 1–2 months before kickoff (June 11, 2026).
              </p>
              <p className="text-[11px] text-[#615E6E]/70">
                Per FIFA regulations (§18.3), every team picks one base camp from FIFA&apos;s pre-approved brochure and stays there throughout the group stage.
              </p>
            </div>
          )}
        </section>

        {/* ── Key Players ── */}
        <section className="mb-8">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Key Players</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {team.keyPlayers.map((player, i) => (
              <div
                key={player}
                className="card p-4 text-center flex flex-col items-center gap-2"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm"
                  style={{ background: "linear-gradient(135deg, #231645, #7E43FF)" }}
                >
                  {i + 1}
                </div>
                <p className="text-[#231645] font-semibold text-sm leading-snug text-center">{player}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Coach + Group side by side ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Coach card */}
          <div className="card p-7 flex items-center gap-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shrink-0"
              style={{ background: "linear-gradient(135deg, #231645, #7E43FF)" }}
            >
              🧑‍💼
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#615E6E] mb-1">Head Coach</p>
              <p className="text-xl font-extrabold text-[#231645]">{team.coach}</p>
            </div>
          </div>

          {/* Group card */}
          <div className="section-panel panel-purple p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-1">2026 Group</p>
            <p className="text-3xl font-extrabold text-[#231645] mb-3">Group {team.group}</p>
            <div className="space-y-2">
              {groupOpponents.map((opp) => (
                <div key={opp.name} className="flex items-center gap-2 text-sm text-[#231645]">
                  <span className="text-lg">{opp.flag}</span>
                  <span className="font-semibold">{opp.name}</span>
                  {opp.isHost && <span className="pill text-[10px] py-0.5 px-2">Host</span>}
                  {opp.isDebutant && <span className="pill text-[10px] py-0.5 px-2" style={{ background: "#ede9ff", borderColor: "#c4b5fd" }}>Debut</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2026 Match Schedule ── */}
        {(() => {
          const teamMatches = matches
            .filter((m) => m.homeTeam === team.name || m.awayTeam === team.name)
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

          if (teamMatches.length === 0) return null

          return (
            <section className="mb-10">
              <h2 className="text-2xl font-extrabold text-[#231645] mb-4">
                {team.name} at the 2026 World Cup
              </h2>
              <div className="space-y-2.5">
                {teamMatches.map((m) => {
                  const isHome = m.homeTeam === team.name
                  const opponent = isHome ? m.awayTeam : m.homeTeam
                  const oppIso2 = teamIso2Map.get(opponent)
                  const rc = matchRoundColors[m.round] ?? matchRoundColors["Group Stage"]
                  const stadium = stadiums.find((s) => s.slug === m.stadiumSlug)
                  const city = cities.find((c) => c.slug === m.citySlug)
                  const oppSlug = teams.find((t) => t.name === opponent)?.slug

                  return (
                    <div
                      key={m.id}
                      className="card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(126,67,255,0.1)]"
                      style={{ borderLeft: `4px solid ${rc.border}` }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4">
                        <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5 flex-shrink-0 sm:w-24">
                          <span className="text-lg font-black text-[#231645] tabular-nums leading-none">
                            {formatMatchDate(m.date)}
                          </span>
                          <span className="text-xs font-bold text-[#615E6E] tabular-nums">{m.time}</span>
                        </div>

                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 whitespace-nowrap"
                            style={{ background: rc.bg, color: rc.text }}
                          >
                            {m.group ? `Group ${m.group}` : m.round}
                          </span>
                          <span className="text-xs font-semibold text-[#615E6E] flex-shrink-0">
                            {isHome ? "vs" : "@"}
                          </span>
                          {oppIso2 && (
                            <Image
                              src={`https://flagcdn.com/w80/${oppIso2}.png`}
                              alt={opponent}
                              width={32}
                              height={22}
                              className="rounded-sm object-cover flex-shrink-0 shadow-sm ring-1 ring-black/5"
                              style={{ width: 32, height: 22 }}
                              unoptimized
                            />
                          )}
                          {oppSlug ? (
                            <Link
                              href={`/teams/${oppSlug}`}
                              className="font-bold text-[#231645] text-base hover:text-[#7E43FF] transition-colors truncate"
                            >
                              {opponent}
                            </Link>
                          ) : (
                            <span className="font-bold text-[#231645] text-base truncate">{opponent}</span>
                          )}
                        </div>

                        <div className="flex flex-col items-start sm:items-end text-xs flex-shrink-0 sm:w-48 sm:text-right">
                          {stadium && (
                            <Link
                              href={`/stadiums/${stadium.slug}`}
                              className="inline-flex items-center gap-1.5 text-[#7E43FF] hover:text-[#231645] transition-colors font-bold"
                            >
                              <span className="opacity-60">🏟</span>
                              <span className="hover:underline">{stadium.name}</span>
                            </Link>
                          )}
                          {city && (
                            <Link
                              href={`/cities/${city.slug}`}
                              className="text-[0.7rem] text-[#615E6E] hover:text-[#231645] transition-colors mt-0.5"
                            >
                              {city.name}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-[0.7rem] text-[#615E6E] mt-3 text-center">
                All times shown are local to the stadium
              </p>
            </section>
          )
        })()}

        {/* ── World Cup History table ── */}
        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">World Cup History</h2>

          {sortedHistory.length === 0 ? (
            <div className="card p-8 text-center text-[#615E6E]">
              <p className="text-5xl mb-3">🌟</p>
              <p className="font-bold text-lg text-[#231645]">First-time participant</p>
              <p className="text-sm mt-1">2026 will be {team.name}&apos;s debut on the World Cup stage.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8f7fd" }}>
                    <th className="text-left px-5 py-3 font-bold text-[#231645] uppercase tracking-wide text-xs">Year</th>
                    <th className="text-left px-5 py-3 font-bold text-[#231645] uppercase tracking-wide text-xs">Stage Reached</th>
                    <th className="hidden sm:table-cell px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((appearance, idx) => (
                    <tr
                      key={`${appearance.year}-${idx}`}
                      className="border-t border-black/[0.05] hover:bg-[#faf9ff] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-[#231645] text-base">
                        {appearance.year}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-bold ${stageColor(appearance.stage)}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stageDot(appearance.stage)}`} />
                          {appearance.stage}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3.5 text-right">
                        {appearance.stage === "Champion" && <span className="text-yellow-500 text-lg">🏆</span>}
                        {appearance.stage === "Runner-up" && <span className="text-slate-400 text-lg">🥈</span>}
                        {(appearance.stage === "3rd Place" || appearance.stage === "4th Place") && <span className="text-amber-500 text-lg">🥉</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-black/[0.05]" style={{ background: "#f8f7fd" }}>
                <p className="text-xs text-[#615E6E]">
                  {team.worldCupAppearances} appearance{team.worldCupAppearances !== 1 ? "s" : ""} total · Includes all World Cups as{" "}
                  {team.name === "Czech Republic" ? "Czechoslovakia and Czech Republic" : team.name === "DR Congo" ? "Zaire and DR Congo" : team.name}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── Legend ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {[
            { label: "Champion", cls: stageColor("Champion"), dot: stageDot("Champion") },
            { label: "Runner-up", cls: stageColor("Runner-up"), dot: stageDot("Runner-up") },
            { label: "3rd / 4th", cls: stageColor("3rd Place"), dot: stageDot("3rd Place") },
            { label: "Semi-final", cls: stageColor("Semi-final"), dot: stageDot("Semi-final") },
            { label: "Quarterfinal", cls: stageColor("Quarterfinal"), dot: stageDot("Quarterfinal") },
            { label: "Round of 16", cls: stageColor("Round of 16"), dot: stageDot("Round of 16") },
            { label: "Group Stage", cls: stageColor("Group Stage"), dot: stageDot("Group Stage") },
          ].map(({ label, cls, dot }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
              {label}
            </span>
          ))}
        </div>

        {/* ── FAQ ── */}
        <section className="mt-10 mb-10">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-4">{team.name} World Cup 2026 FAQ</h2>
          <div className="space-y-3">
            {teamFaqs.map((f, i) => (
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

        {(() => {
          const v = getTeamVideo(team.slug)
          return v ? (
            <YouTubeEmbed videoId={v.videoId} title={v.title} channel={v.channel} heading={`${team.name} on the way to 2026`} />
          ) : null
        })()}

        {/* ── Back link ── */}
        <div className="pt-6 border-t border-black/[0.06]">
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-[#7E43FF] hover:text-[#231645] transition-colors font-semibold"
          >
            ← Back to All Groups
          </Link>
        </div>

      </div>
    </div>
  )
}
