// Poisson-based football simulator for the 2026 World Cup predictor.
// Pure functions . no React, no DOM. Used by PredictorClient.

import { matches as ALL_MATCHES, type Match } from "../data/matches"
import { teams as TEAMS } from "../data/teams"

// ─── Types ──────────────────────────────────────────────────────────────────
export type ScoreEntry = {
  home: number
  away: number
  // Filled only when a knockout is tied at 90 minutes:
  et?: { home: number; away: number }      // goals scored in extra time
  pens?: { home: number; away: number }    // penalty shootout score (winner has more)
}

export type ScoreMap = Record<string, ScoreEntry>

export type TeamRow = {
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

export type Qualifier = {
  team: string
  source: string             // "A1", "B2", "3rd-A", etc
  position: 1 | 2 | 3
  rank: number               // FIFA rank for tiebreaks
  seed: number               // bracket seed 1..32
}

export type BracketMatch = {
  id: string                 // "r32-1", "r16-3", "qf-2", "sf-1", "third", "final"
  matchNumber: number        // FIFA fixture number 73..104
  round: "Round of 32" | "Round of 16" | "Quarterfinal" | "Semi-final" | "3rd Place" | "Final"
  home: Qualifier | null
  away: Qualifier | null
  // Winner is computed from scores[id]; null until both teams + a score exist.
  winner: string | null
}

export type Bracket = {
  r32: BracketMatch[]        // 16 matches
  r16: BracketMatch[]        // 8 matches
  qf:  BracketMatch[]        // 4 matches
  sf:  BracketMatch[]        // 2 matches
  third: BracketMatch
  final: BracketMatch
  champion: string | null
  thirdPlaceWinner: string | null
}

// ─── Constants ──────────────────────────────────────────────────────────────
export const STORAGE_KEY = "wcg-predictor-v2"

// FIFA's official 2026 R32 bracket mapping, transcribed from the
// FWC2026_regulations_EN.pdf (section 12.6, page 24). Each entry corresponds
// to one of the 16 R32 matches (M73 through M88) in fixture order.
//
// Slot kinds:
//   - "winner": the group winner of the named group
//   - "runnerup": the runner-up of the named group
//   - "best3rd": the best-third-placer whose group is in the candidate set,
//     selected from the 8 advancing third-placers
//
// The 4 "best 3rd of {X}" matches correspond to FIFA's Annex C 495-combo
// table; a faithful implementation of that table is impractical here, so we
// approximate by picking the highest-ranked qualifying 3rd-placer whose
// group letter is in the candidate set. If none of the qualifying 3rds match
// the candidate set, we fall back to the highest-ranked 3rd overall.
export type R32Slot =
  | { kind: "winner";  group: string }
  | { kind: "runnerup"; group: string }
  | { kind: "best3rd"; candidates: string[] }

export const R32_STRUCTURE: { matchNumber: number; teamA: R32Slot; teamB: R32Slot }[] = [
  { matchNumber: 73, teamA: { kind: "runnerup", group: "A" },                 teamB: { kind: "runnerup", group: "B" } },
  { matchNumber: 74, teamA: { kind: "winner",   group: "E" },                 teamB: { kind: "best3rd", candidates: ["A","B","C","D","F"] } },
  { matchNumber: 75, teamA: { kind: "winner",   group: "F" },                 teamB: { kind: "runnerup", group: "C" } },
  { matchNumber: 76, teamA: { kind: "winner",   group: "C" },                 teamB: { kind: "runnerup", group: "F" } },
  { matchNumber: 77, teamA: { kind: "winner",   group: "I" },                 teamB: { kind: "best3rd", candidates: ["C","D","F","G","H"] } },
  { matchNumber: 78, teamA: { kind: "runnerup", group: "E" },                 teamB: { kind: "runnerup", group: "I" } },
  { matchNumber: 79, teamA: { kind: "winner",   group: "A" },                 teamB: { kind: "best3rd", candidates: ["C","E","F","H","I"] } },
  { matchNumber: 80, teamA: { kind: "winner",   group: "L" },                 teamB: { kind: "best3rd", candidates: ["E","H","I","J","K"] } },
  { matchNumber: 81, teamA: { kind: "winner",   group: "D" },                 teamB: { kind: "best3rd", candidates: ["B","E","F","I","J"] } },
  { matchNumber: 82, teamA: { kind: "winner",   group: "G" },                 teamB: { kind: "best3rd", candidates: ["A","E","H","I","J"] } },
  { matchNumber: 83, teamA: { kind: "runnerup", group: "K" },                 teamB: { kind: "runnerup", group: "L" } },
  { matchNumber: 84, teamA: { kind: "winner",   group: "H" },                 teamB: { kind: "runnerup", group: "J" } },
  { matchNumber: 85, teamA: { kind: "winner",   group: "B" },                 teamB: { kind: "best3rd", candidates: ["E","F","G","I","J"] } },
  { matchNumber: 86, teamA: { kind: "winner",   group: "J" },                 teamB: { kind: "runnerup", group: "H" } },
  { matchNumber: 87, teamA: { kind: "winner",   group: "K" },                 teamB: { kind: "best3rd", candidates: ["D","E","I","J","L"] } },
  { matchNumber: 88, teamA: { kind: "runnerup", group: "D" },                 teamB: { kind: "runnerup", group: "G" } },
]

// Kept as a backward-compatibility shim . earlier R32_PAIRINGS shape used by
// any external reference. Empty by default; consumers should use R32_STRUCTURE.
export const R32_PAIRINGS: [number, number][] = []

// FIFA's official R16/QF/SF feed structure, transcribed from FWC2026_regulations_EN.pdf
// sections 12.7-12.11. Each entry is the 0-indexed position of the previous
// round's match whose winner advances. The bracket is NOT naive sequential
// pairing . FIFA cross-couples R32 winners across the bracket halves so the
// tree balances correctly. (Earlier code did i*2/i*2+1 pairing which is wrong;
// see https://digitalhub.fifa.com/m/636f5c9c6f29771f for the source.)
//
// R16: each entry is [r32IndexA, r32IndexB] where r32Index = matchNumber - 73
export const R16_STRUCTURE: [number, number][] = [
  [1, 4],   // M89: W74 v W77
  [0, 2],   // M90: W73 v W75
  [3, 5],   // M91: W76 v W78
  [6, 7],   // M92: W79 v W80
  [10, 11], // M93: W83 v W84
  [8, 9],   // M94: W81 v W82
  [13, 15], // M95: W86 v W88
  [12, 14], // M96: W85 v W87
]
// QF: each entry is [r16IndexA, r16IndexB] where r16Index = matchNumber - 89
export const QF_STRUCTURE: [number, number][] = [
  [0, 1], // M97:  W89 v W90
  [4, 5], // M98:  W93 v W94
  [2, 3], // M99:  W91 v W92
  [6, 7], // M100: W95 v W96
]
// SF: each entry is [qfIndexA, qfIndexB] where qfIndex = matchNumber - 97
export const SF_STRUCTURE: [number, number][] = [
  [0, 1], // M101: W97 v W98
  [2, 3], // M102: W99 v W100
]

// 12 groups × 6 matches = 72 group-stage matches in fixture order
export const GROUP_MATCHES: Match[] = ALL_MATCHES.filter((m) => m.round === "Group Stage")
export const GROUP_LETTERS = Array.from(new Set(GROUP_MATCHES.map((m) => m.group!))).sort()

// FIFA-rank lookup
const teamRank = new Map(TEAMS.map((t) => [t.name, t.fifaRanking ?? 200]))
const teamSlug = new Map(TEAMS.map((t) => [t.name, t.slug]))
const teamFlag = new Map(TEAMS.map((t) => [t.name, t.flag]))
const teamIso2 = new Map(TEAMS.map((t) => [t.name, t.iso2]))
const teamConf = new Map(TEAMS.map((t) => [t.name, t.confederation]))

export function rank(team: string): number { return teamRank.get(team) ?? 200 }
export function slug(team: string): string | undefined { return teamSlug.get(team) }
export function flag(team: string): string { return teamFlag.get(team) ?? "" }
export function iso2(team: string): string { return teamIso2.get(team) ?? "" }
export function confederation(team: string): string { return teamConf.get(team) ?? "" }

// ─── Strength model ─────────────────────────────────────────────────────────
// FIFA rank → Elo-style rating. We use a piecewise map: top 30 stay spread out
// (real strength differences matter), lower ranks compress (single-position
// FIFA-rank differences are mostly noise at the tail).
export function ratingFromRank(rk: number): number {
  if (rk <= 30) return 2200 - rk * 10                    // 2190 (rank 1) → 1900 (rank 30)
  return Math.max(1500, 1900 - (rk - 30) * 4)            // 1900 (rank 30) → 1500 (rank 130+)
}

// Confederation tier modifier . proxy for "real strength minus FIFA points
// noise". UEFA/CONMEBOL play more competitive matches and are systematically
// underweighted by FIFA points; AFC/OFC are over-weighted. Roughly mirrors
// historical World Cup overperformance by confederation.
export function confederationBonus(conf: string): number {
  switch (conf) {
    case "UEFA":     return  60
    case "CONMEBOL": return  60
    case "CONCACAF": return   0
    case "CAF":      return -20
    case "AFC":      return -40
    case "OFC":      return -80
    default:         return   0
  }
}

// Backwards-compatible name used by tests and consumers . returns the rank-only
// component of the rating. Use teamRating(name) for the full strength.
export function rating(rk: number): number { return ratingFromRank(rk) }

// Full team strength: rank curve + confederation bonus.
export function teamRating(team: string): number {
  return ratingFromRank(rank(team)) + confederationBonus(confederation(team))
}

// Expected goals (Poisson means) for both teams given their ratings.
// Based on a Dixon-Coles style scoring model: average match is ~2.7 total goals,
// rating diff shifts which side scores more. We clamp the rating-diff effect
// so even top-vs-minnow blowouts stay in the 3-0 / 4-1 range, not 5-0.
export function expectedGoals(rTeamA: number, rTeamB: number): { lA: number; lB: number } {
  const D = Math.max(-3, Math.min(3, (rTeamA - rTeamB) / 100))
  const lA = Math.max(0.25, 1.4 + 0.5 * D)
  const lB = Math.max(0.25, 1.4 - 0.5 * D)
  return { lA, lB }
}

// ─── RNG + Poisson sampler ──────────────────────────────────────────────────
// Mulberry32 . a tiny seeded PRNG. Lets the user re-run a simulation with the
// same seed for reproducibility.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Knuth's Poisson sampler . exact for small lambdas which is all we need.
export function poissonSample(lambda: number, rng: () => number): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng()
  } while (p > L)
  return k - 1
}

// ─── Match simulation ───────────────────────────────────────────────────────
// Random Poisson draw for a regulation-time score.
export function simulateRegulation(teamA: string, teamB: string, rng: () => number): { home: number; away: number } {
  const { lA, lB } = expectedGoals(teamRating(teamA), teamRating(teamB))
  return { home: poissonSample(lA, rng), away: poissonSample(lB, rng) }
}

// Deterministic "expected" scoreline . round the Poisson means. For a knockout
// match where draws aren't allowed, the higher-rated team gets the extra goal.
export function autoPickScore(teamA: string, teamB: string, allowDraw: boolean): { home: number; away: number } {
  const { lA, lB } = expectedGoals(teamRating(teamA), teamRating(teamB))
  let h = Math.round(lA)
  let a = Math.round(lB)
  if (!allowDraw && h === a) {
    if (teamRating(teamA) >= teamRating(teamB)) h++
    else a++
  }
  return { home: h, away: a }
}

// Simulate ET as ~33% of a normal match (two 15-minute periods).
export function simulateExtraTime(teamA: string, teamB: string, rng: () => number): { home: number; away: number } {
  const { lA, lB } = expectedGoals(teamRating(teamA), teamRating(teamB))
  return { home: poissonSample(lA / 3, rng), away: poissonSample(lB / 3, rng) }
}

// Penalty shootout. Conversion ~75% with a small edge to the higher-rated side.
// Best of 5, then sudden-death paired rounds.
export function simulatePenalties(teamA: string, teamB: string, rng: () => number): { home: number; away: number } {
  const diff = (teamRating(teamA) - teamRating(teamB)) / 5000
  const cA = Math.max(0.6, Math.min(0.85, 0.75 + diff))
  const cB = Math.max(0.6, Math.min(0.85, 0.75 - diff))
  let h = 0
  let a = 0
  for (let i = 0; i < 5; i++) {
    if (rng() < cA) h++
    if (rng() < cB) a++
  }
  while (h === a) {
    const sh = rng() < cA ? 1 : 0
    const sa = rng() < cB ? 1 : 0
    h += sh
    a += sa
  }
  return { home: h, away: a }
}

// Full knockout simulation: regulation → ET → pens. Returns a complete ScoreEntry.
export function simulateKnockout(teamA: string, teamB: string, rng: () => number): ScoreEntry {
  const reg = simulateRegulation(teamA, teamB, rng)
  if (reg.home !== reg.away) return reg
  const et = simulateExtraTime(teamA, teamB, rng)
  const total = { home: reg.home + et.home, away: reg.away + et.away }
  if (total.home !== total.away) return { home: reg.home, away: reg.away, et }
  const pens = simulatePenalties(teamA, teamB, rng)
  return { home: reg.home, away: reg.away, et, pens }
}

// Deterministic auto-pick for a knockout: regulation result that can't be a
// draw (we bump the favorite by 1 goal if the rounded means tie).
export function autoPickKnockout(teamA: string, teamB: string): ScoreEntry {
  return autoPickScore(teamA, teamB, false)
}

// ─── Score → winner ─────────────────────────────────────────────────────────
export function knockoutWinner(home: string, away: string, s: ScoreEntry | undefined): string | null {
  if (!s) return null
  const hRegEt = s.home + (s.et?.home ?? 0)
  const aRegEt = s.away + (s.et?.away ?? 0)
  if (hRegEt > aRegEt) return home
  if (aRegEt > hRegEt) return away
  if (s.pens) return s.pens.home > s.pens.away ? home : away
  return null
}

// ─── Group standings ────────────────────────────────────────────────────────
export function computeStandings(group: string, scores: ScoreMap): TeamRow[] {
  const groupMatches = GROUP_MATCHES.filter((m) => m.group === group)
  const teamSet = new Set<string>()
  groupMatches.forEach((m) => { teamSet.add(m.homeTeam); teamSet.add(m.awayTeam) })
  const rows = new Map<string, TeamRow>()
  for (const t of teamSet) {
    rows.set(t, { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 })
  }
  for (const m of groupMatches) {
    const s = scores[m.id]
    if (!s) continue
    const h = rows.get(m.homeTeam)!
    const a = rows.get(m.awayTeam)!
    h.played++; a.played++
    h.gf += s.home; h.ga += s.away
    a.gf += s.away; a.ga += s.home
    if (s.home > s.away) { h.won++; h.pts += 3; a.lost++ }
    else if (s.home < s.away) { a.won++; a.pts += 3; h.lost++ }
    else { h.drawn++; a.drawn++; h.pts++; a.pts++ }
  }
  for (const r of rows.values()) r.gd = r.gf - r.ga
  return [...rows.values()].sort((x, y) =>
    y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || rank(x.team) - rank(y.team)
  )
}

// Are all 6 group-stage matches scored?
export function isGroupComplete(group: string, scores: ScoreMap): boolean {
  return GROUP_MATCHES.filter((m) => m.group === group).every((m) => !!scores[m.id])
}

export function areAllGroupsComplete(scores: ScoreMap): boolean {
  return GROUP_LETTERS.every((g) => isGroupComplete(g, scores))
}

// ─── Qualification: top 2 + best 8 thirds ───────────────────────────────────
export function getQualifiers(scores: ScoreMap): Qualifier[] | null {
  if (!areAllGroupsComplete(scores)) return null
  const winners: Qualifier[] = []
  const runnersUp: Qualifier[] = []
  // Carry the third-placed team's actual group-stage stats so we can rank the
  // 12 third-placed teams against each other per FIFA regs §12.5:
  //   1. points  2. goal difference  3. goals scored  4. (fallback) FIFA rank
  const thirdsWithStats: (Qualifier & { pts: number; gd: number; gf: number })[] = []
  for (const g of GROUP_LETTERS) {
    const rows = computeStandings(g, scores)
    winners.push({ team: rows[0].team, source: `${g}1`, position: 1, rank: rank(rows[0].team), seed: 0 })
    runnersUp.push({ team: rows[1].team, source: `${g}2`, position: 2, rank: rank(rows[1].team), seed: 0 })
    thirdsWithStats.push({
      team: rows[2].team, source: `${g}3`, position: 3, rank: rank(rows[2].team), seed: 0,
      pts: rows[2].pts, gd: rows[2].gd, gf: rows[2].gf,
    })
  }
  // FIFA §12.5: best 8 third-placed teams by pts, then GD, then GF.
  const bestThirdsRanked = [...thirdsWithStats].sort((a, b) =>
    b.pts - a.pts ||
    b.gd  - a.gd  ||
    b.gf  - a.gf  ||
    a.rank - b.rank
  ).slice(0, 8)
  const bestThirds: Qualifier[] = bestThirdsRanked.map((q) => ({
    team: q.team, source: q.source, position: q.position, rank: q.rank, seed: 0,
  }))

  // Seed: winners 1-12 (by FIFA rank), runners-up 13-24, thirds 25-32
  winners.sort((a, b) => a.rank - b.rank)
  runnersUp.sort((a, b) => a.rank - b.rank)
  bestThirds.sort((a, b) => a.rank - b.rank)
  const seeded: Qualifier[] = []
  winners.forEach((q, i) => seeded.push({ ...q, seed: i + 1 }))
  runnersUp.forEach((q, i) => seeded.push({ ...q, seed: 13 + i }))
  bestThirds.forEach((q, i) => seeded.push({ ...q, seed: 25 + i }))
  return seeded
}

// ─── Knockout bracket ───────────────────────────────────────────────────────
export function buildBracket(scores: ScoreMap): Bracket | null {
  const qualifiers = getQualifiers(scores)
  if (!qualifiers) return null

  // Track 3rd-placers that have already been assigned to an R32 slot so each
  // appears in exactly one match (FIFA's Annex C guarantees this).
  const usedThirds = new Set<string>()
  const allThirds = qualifiers.filter((q) => q.position === 3)

  function resolveSlot(slot: R32Slot): Qualifier | null {
    if (slot.kind === "winner") {
      return qualifiers!.find((q) => q.position === 1 && q.source === slot.group + "1") ?? null
    }
    if (slot.kind === "runnerup") {
      return qualifiers!.find((q) => q.position === 2 && q.source === slot.group + "2") ?? null
    }
    // best3rd . approximation of FIFA Annex C: prefer 3rd-placers whose group
    // is in the candidate set, then any remaining unused 3rd. Best-ranked first.
    const matching = allThirds
      .filter((q) => !usedThirds.has(q.team) && slot.candidates.includes(q.source.charAt(0)))
      .sort((a, b) => a.rank - b.rank)
    let pick = matching[0]
    if (!pick) {
      const fallback = allThirds
        .filter((q) => !usedThirds.has(q.team))
        .sort((a, b) => a.rank - b.rank)
      pick = fallback[0]
    }
    if (pick) usedThirds.add(pick.team)
    return pick ?? null
  }

  // R32 using FIFA's published 2026 mapping (M73-M88).
  const r32: BracketMatch[] = R32_STRUCTURE.map((m, i) => {
    const home = resolveSlot(m.teamA)
    const away = resolveSlot(m.teamB)
    const id = `r32-${i + 1}`
    const winner = home && away ? knockoutWinner(home.team, away.team, scores[id]) : null
    return { id, matchNumber: m.matchNumber, round: "Round of 32", home, away, winner }
  })

  // Helper: take winner of an earlier round match as a Qualifier (seed inherits)
  const winnerToQualifier = (m: BracketMatch): Qualifier | null => {
    if (!m.winner || !m.home || !m.away) return null
    return m.winner === m.home.team ? m.home : m.away
  }

  const r16: BracketMatch[] = R16_STRUCTURE.map(([ai, bi], i) => {
    const a = winnerToQualifier(r32[ai])
    const b = winnerToQualifier(r32[bi])
    const id = `r16-${i + 1}`
    const winner = a && b ? knockoutWinner(a.team, b.team, scores[id]) : null
    return { id, matchNumber: 89 + i, round: "Round of 16", home: a, away: b, winner }
  })

  const qf: BracketMatch[] = QF_STRUCTURE.map(([ai, bi], i) => {
    const a = winnerToQualifier(r16[ai])
    const b = winnerToQualifier(r16[bi])
    const id = `qf-${i + 1}`
    const winner = a && b ? knockoutWinner(a.team, b.team, scores[id]) : null
    return { id, matchNumber: 97 + i, round: "Quarterfinal", home: a, away: b, winner }
  })

  const sf: BracketMatch[] = SF_STRUCTURE.map(([ai, bi], i) => {
    const a = winnerToQualifier(qf[ai])
    const b = winnerToQualifier(qf[bi])
    const id = `sf-${i + 1}`
    const winner = a && b ? knockoutWinner(a.team, b.team, scores[id]) : null
    return { id, matchNumber: 101 + i, round: "Semi-final", home: a, away: b, winner }
  })

  // 3rd place: SF losers (qualifier whose team !== sf.winner)
  const sfLoser = (m: BracketMatch): Qualifier | null => {
    if (!m.winner || !m.home || !m.away) return null
    return m.winner === m.home.team ? m.away : m.home
  }
  const thirdHome = sfLoser(sf[0])
  const thirdAway = sfLoser(sf[1])
  const third: BracketMatch = {
    id: "third",
    matchNumber: 103,
    round: "3rd Place",
    home: thirdHome,
    away: thirdAway,
    winner: thirdHome && thirdAway ? knockoutWinner(thirdHome.team, thirdAway.team, scores["third"]) : null,
  }

  const finalHome = winnerToQualifier(sf[0])
  const finalAway = winnerToQualifier(sf[1])
  const final: BracketMatch = {
    id: "final",
    matchNumber: 104,
    round: "Final",
    home: finalHome,
    away: finalAway,
    winner: finalHome && finalAway ? knockoutWinner(finalHome.team, finalAway.team, scores["final"]) : null,
  }

  return {
    r32, r16, qf, sf, third, final,
    champion: final.winner,
    thirdPlaceWinner: third.winner,
  }
}

// ─── Bulk fillers ───────────────────────────────────────────────────────────
// "Auto-pick by rating" . deterministic. Group matches: rounded Poisson means
// (draws allowed). Knockouts: rounded means + bump favorite if tied.
export function autoPickAll(): ScoreMap {
  const out: ScoreMap = {}
  // Group stage
  for (const m of GROUP_MATCHES) {
    out[m.id] = autoPickScore(m.homeTeam, m.awayTeam, true)
  }
  // Walk the knockout bracket
  let bracket = buildBracket(out)
  if (!bracket) return out
  const fillRound = (round: BracketMatch[]) => {
    for (const m of round) {
      if (!m.home || !m.away) continue
      out[m.id] = autoPickKnockout(m.home.team, m.away.team)
    }
  }
  fillRound(bracket.r32)
  bracket = buildBracket(out)!
  fillRound(bracket.r16)
  bracket = buildBracket(out)!
  fillRound(bracket.qf)
  bracket = buildBracket(out)!
  fillRound(bracket.sf)
  bracket = buildBracket(out)!
  if (bracket.third.home && bracket.third.away) {
    out["third"] = autoPickKnockout(bracket.third.home.team, bracket.third.away.team)
  }
  if (bracket.final.home && bracket.final.away) {
    out["final"] = autoPickKnockout(bracket.final.home.team, bracket.final.away.team)
  }
  return out
}

// "Simulate" . random Poisson roll for every match. Different result each click.
export function simulateAll(seedNum: number): ScoreMap {
  const rng = mulberry32(seedNum)
  const out: ScoreMap = {}
  for (const m of GROUP_MATCHES) {
    out[m.id] = simulateRegulation(m.homeTeam, m.awayTeam, rng)
  }
  let bracket = buildBracket(out)
  if (!bracket) return out
  const simRound = (round: BracketMatch[]) => {
    for (const m of round) {
      if (!m.home || !m.away) continue
      out[m.id] = simulateKnockout(m.home.team, m.away.team, rng)
    }
  }
  simRound(bracket.r32)
  bracket = buildBracket(out)!
  simRound(bracket.r16)
  bracket = buildBracket(out)!
  simRound(bracket.qf)
  bracket = buildBracket(out)!
  simRound(bracket.sf)
  bracket = buildBracket(out)!
  if (bracket.third.home && bracket.third.away) {
    out["third"] = simulateKnockout(bracket.third.home.team, bracket.third.away.team, rng)
  }
  if (bracket.final.home && bracket.final.away) {
    out["final"] = simulateKnockout(bracket.final.home.team, bracket.final.away.team, rng)
  }
  return out
}
