import Link from "next/link"
import { matches, slugForMatch, type Match } from "@/data/matches"
import { getResult, type MatchResult } from "@/lib/matchResults"

// Renders at build time. The daily bot rebuilds every 6 hours, so the cutoff
// between "recent" and "upcoming" stays fresh enough to be useful without any
// client-side ticking. We resolve "now" from BUILD_TIME so it's deterministic
// on cron rebuilds and overridable in tests.
const NOW = new Date(process.env.BUILD_TIME ?? Date.now())

function matchEpoch(m: Match): number {
  return new Date(`${m.date}T${m.time}:00Z`).getTime()
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
}

function FinishedCard({ m, r }: { m: Match; r: MatchResult }) {
  const score = r.status === "PEN" && r.penaltyHome != null
    ? `${r.homeScore}-${r.awayScore} (${r.penaltyHome}-${r.penaltyAway} p)`
    : `${r.homeScore}-${r.awayScore}${r.status === "AET" ? " (AET)" : ""}`
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl p-3 min-w-[210px] flex-shrink-0 text-white hover:-translate-y-0.5 transition-transform shadow-[0_2px_10px_-4px_rgba(35,22,69,0.35)]"
      style={{ background: "linear-gradient(135deg, #231645 0%, #4f1ea1 60%, #7E43FF 100%)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/70">Final</span>
        <span className="text-[10px] text-white/70 tabular-nums">{formatDate(m.date)}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold truncate">{m.homeTeam}</span>
        <span className="text-sm font-extrabold tabular-nums whitespace-nowrap">{score}</span>
      </div>
      <div className="text-sm font-semibold truncate">{m.awayTeam}</div>
    </Link>
  )
}

function UpcomingCard({ m }: { m: Match }) {
  return (
    <Link
      href={`/matches/${slugForMatch(m)}/`}
      className="block rounded-xl p-3 min-w-[210px] flex-shrink-0 text-[#231645] hover:-translate-y-0.5 transition-transform border border-[#7E43FF]/15 shadow-[0_2px_10px_-4px_rgba(126,67,255,0.25)]"
      style={{ background: "linear-gradient(135deg, #f4ecff 0%, #e8dcff 50%, #d6c2ff 100%)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className="text-[9px] font-extrabold uppercase tracking-widest text-white px-2 py-0.5 rounded-full"
          style={{ background: "#7E43FF" }}
        >
          {m.group ? `Group ${m.group}` : m.round}
        </span>
        <span className="text-[10px] text-[#4f1ea1] font-semibold tabular-nums">{formatDate(m.date)} · {m.time}</span>
      </div>
      <div className="text-sm font-bold truncate">{m.homeTeam}</div>
      <div className="text-[10px] text-[#615E6E] my-0.5 font-bold">vs</div>
      <div className="text-sm font-bold truncate">{m.awayTeam}</div>
    </Link>
  )
}

export default function LiveStrip() {
  const now = NOW.getTime()
  type Pair = { kind: "done"; m: Match; r: MatchResult } | { kind: "next"; m: Match }
  const finished: Pair[] = []
  const upcoming: Pair[] = []
  for (const m of matches) {
    if (m.homeTeam === "TBD" || m.awayTeam === "TBD") continue
    const r = getResult(m.id)
    if (r && (r.status === "FT" || r.status === "AET" || r.status === "PEN")) {
      finished.push({ kind: "done", m, r })
    } else if (matchEpoch(m) >= now) {
      upcoming.push({ kind: "next", m })
    }
  }
  finished.sort((a, b) => matchEpoch(b.m) - matchEpoch(a.m))
  upcoming.sort((a, b) => matchEpoch(a.m) - matchEpoch(b.m))
  // Interleave: most recent results first, then the next upcoming fixtures.
  const items: Pair[] = [...finished.slice(0, 4), ...upcoming.slice(0, 8)]
  if (items.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4">
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 snap-x">
        {items.map((it) =>
          it.kind === "done" ? (
            <div key={`d-${it.m.id}`} className="snap-start">
              <FinishedCard m={it.m} r={it.r} />
            </div>
          ) : (
            <div key={`n-${it.m.id}`} className="snap-start">
              <UpcomingCard m={it.m} />
            </div>
          )
        )}
      </div>
    </div>
  )
}
