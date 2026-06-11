import Link from "next/link"
import { matches, slugForMatch, type Match } from "@/data/matches"
import { getResult, type MatchResult } from "@/lib/matchResults"

// Renders at build time. The daily bot rebuilds every 6 hours, so the cutoff
// between "recent" and "upcoming" stays fresh enough to be useful without any
// client-side ticking. We resolve "now" from BUILD_TIME so it's deterministic
// on cron rebuilds and overridable in tests.
const NOW = new Date(process.env.BUILD_TIME ?? Date.now())

function matchEpoch(m: Match): number {
  // Approximate kickoff as <date>T<time>:00Z. Off by a few hours from real
  // local kickoff but consistent across matches, which is all sorting needs.
  return new Date(`${m.date}T${m.time}:00Z`).getTime()
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

function FinishedRow({ m, r }: { m: Match; r: MatchResult }) {
  const score = r.status === "PEN" && r.penaltyHome != null
    ? `${r.homeScore}-${r.awayScore} (${r.penaltyHome}-${r.penaltyAway} p)`
    : `${r.homeScore}-${r.awayScore}${r.status === "AET" ? " (AET)" : ""}`
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl border border-black/[0.06] bg-white hover:bg-[#faf9fe] transition-colors p-3 min-w-[200px] flex-shrink-0"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#7E43FF]">FT</span>
        <span className="text-[10px] text-[#615E6E] tabular-nums">{formatDate(m.date)}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#231645] truncate">{m.homeTeam}</span>
        <span className="text-sm font-extrabold text-[#231645] tabular-nums whitespace-nowrap">{score}</span>
      </div>
      <div className="text-sm font-semibold text-[#231645] truncate">{m.awayTeam}</div>
    </Link>
  )
}

function UpcomingRow({ m }: { m: Match }) {
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl border border-black/[0.06] bg-white hover:bg-[#faf9fe] transition-colors p-3 min-w-[200px] flex-shrink-0"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#615E6E]">{m.group ? `Group ${m.group}` : m.round}</span>
        <span className="text-[10px] text-[#615E6E] tabular-nums">{formatDate(m.date)} · {m.time}</span>
      </div>
      <div className="text-sm font-semibold text-[#231645] truncate">{m.homeTeam}</div>
      <div className="text-[11px] text-[#615E6E] my-0.5">vs</div>
      <div className="text-sm font-semibold text-[#231645] truncate">{m.awayTeam}</div>
    </Link>
  )
}

export default function LiveStrip() {
  const now = NOW.getTime()
  type Pair = { m: Match; r: MatchResult }
  const finished: Pair[] = []
  const upcoming: Match[] = []
  for (const m of matches) {
    if (m.homeTeam === "TBD" || m.awayTeam === "TBD") continue
    const r = getResult(m.id)
    if (r && (r.status === "FT" || r.status === "AET" || r.status === "PEN")) {
      finished.push({ m, r })
    } else if (matchEpoch(m) >= now) {
      upcoming.push(m)
    }
  }
  finished.sort((a, b) => matchEpoch(b.m) - matchEpoch(a.m))
  upcoming.sort((a, b) => matchEpoch(a) - matchEpoch(b))
  const recent = finished.slice(0, 6)
  const next = upcoming.slice(0, 6)

  if (recent.length === 0 && next.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-4 mt-6 mb-8">
      {recent.length > 0 && (
        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-base md:text-lg font-extrabold text-[#231645]">Latest results</h2>
            <Link href="/blog/" className="text-xs font-semibold text-[#7E43FF] hover:underline">All recaps -&gt;</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
            {recent.map(({ m, r }) => (
              <div key={m.id} className="snap-start">
                <FinishedRow m={m} r={r} />
              </div>
            ))}
          </div>
        </div>
      )}
      {next.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-base md:text-lg font-extrabold text-[#231645]">Up next</h2>
            <Link href="/schedule/" className="text-xs font-semibold text-[#7E43FF] hover:underline">Full schedule -&gt;</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
            {next.map((m) => (
              <div key={m.id} className="snap-start">
                <UpcomingRow m={m} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
