import { matches } from "@/data/matches"
import { groups } from "@/data/groups"
import { getResult } from "@/lib/matchResults"

export type StandingRow = {
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
}

// Returns 4-row standings for a group letter (A..L) from real FT/AET/PEN
// results in matchResults.json + the fixtures in matches.ts. Penalty
// shootouts in the group stage don't happen but we still treat AET as a
// regular win/draw at the regulation score. PEN winners are counted as a
// win at the regulation scoreline.
export function getGroupStandings(letter: string): StandingRow[] {
  const g = groups.find((x) => x.letter === letter)
  if (!g) return []
  const rows = new Map<string, StandingRow>()
  for (const t of g.teams) {
    rows.set(t.name, { team: t.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 })
  }
  const groupMatches = matches.filter((m) => m.group === letter)
  for (const m of groupMatches) {
    const r = getResult(m.id)
    if (!r || (r.status !== "FT" && r.status !== "AET" && r.status !== "PEN")) continue
    const h = rows.get(m.homeTeam)
    const a = rows.get(m.awayTeam)
    if (!h || !a || r.homeScore == null || r.awayScore == null) continue
    h.played++; a.played++
    h.gf += r.homeScore; h.ga += r.awayScore
    a.gf += r.awayScore; a.ga += r.homeScore
    if (r.homeScore > r.awayScore) { h.won++; h.pts += 3; a.lost++ }
    else if (r.homeScore < r.awayScore) { a.won++; a.pts += 3; h.lost++ }
    else { h.drawn++; a.drawn++; h.pts++; a.pts++ }
  }
  for (const r of rows.values()) r.gd = r.gf - r.ga
  return [...rows.values()].sort(
    (x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.team.localeCompare(y.team)
  )
}
