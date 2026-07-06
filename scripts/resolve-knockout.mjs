// Fill in knockout fixtures (R16 -> Final) in matches.ts from the winners of
// completed earlier rounds, so later-round scores can be fetched and matched.
// Idempotent: run repeatedly (interleaved with fetch-match-scores) to advance
// the bracket one round at a time as results land.
//
//   node scripts/resolve-knockout.mjs

import fs from "node:fs"

const MATCHES = "src/data/matches.ts"
const RES = "src/data/matchResults.json"
const results = JSON.parse(fs.readFileSync(RES, "utf8"))
let src = fs.readFileSync(MATCHES, "utf8")

// FIFA 2026 knockout structure (indices are 0-based within each round).
const R16 = [[1, 4], [0, 2], [3, 5], [6, 7], [10, 11], [8, 9], [13, 15], [12, 14]]
const QF = [[0, 1], [4, 5], [2, 3], [6, 7]]
const SF = [[0, 1], [2, 3]]

function parse() {
  const re = /id:"(m\d+)",[^}]*?homeTeam:"([^"]*)",\s*awayTeam:"([^"]*)"/g
  const map = {}
  let m
  while ((m = re.exec(src)) !== null) map[m[1]] = { home: m[2], away: m[3] }
  return map
}
function winner(id, map) {
  const r = results[id]
  if (!r || !["FT", "AET", "PEN"].includes(r.status)) return null
  const t = map[id]
  if (!t || t.home === "TBD" || t.away === "TBD") return null
  if (r.homeScore > r.awayScore) return t.home
  if (r.awayScore > r.homeScore) return t.away
  return (r.penaltyHome ?? 0) >= (r.penaltyAway ?? 0) ? t.home : t.away
}
function loser(id, map) {
  const w = winner(id, map)
  if (!w) return null
  const t = map[id]
  return w === t.home ? t.away : t.home
}
function setTeams(id, home, away) {
  const re = new RegExp('(id:"' + id + '",[^}]*?homeTeam:")[^"]*(",\\s*awayTeam:")[^"]*(")')
  src = src.replace(re, `$1${home}$2${away}$3`)
}
let changed = 0
function ensure(id, home, away) {
  const map = parse()
  const cur = map[id]
  if (!cur) return
  if (cur.home !== home || cur.away !== away) {
    setTeams(id, home, away)
    changed++
    console.log(`  ${id}: ${home} vs ${away}`)
  }
}

// R16 from R32 winners
{ const map = parse(); R16.forEach((p, j) => { const h = winner(`m${73 + p[0]}`, map), a = winner(`m${73 + p[1]}`, map); if (h && a) ensure(`m${89 + j}`, h, a) }) }
// QF from R16 winners
{ const map = parse(); QF.forEach((p, j) => { const h = winner(`m${89 + p[0]}`, map), a = winner(`m${89 + p[1]}`, map); if (h && a) ensure(`m${97 + j}`, h, a) }) }
// SF from QF winners
{ const map = parse(); SF.forEach((p, j) => { const h = winner(`m${97 + p[0]}`, map), a = winner(`m${97 + p[1]}`, map); if (h && a) ensure(`m${101 + j}`, h, a) }) }
// Final + 3rd place from SF winners/losers
{ const map = parse(); const f1 = winner("m101", map), f2 = winner("m102", map); if (f1 && f2) ensure("m104", f1, f2); const l1 = loser("m101", map), l2 = loser("m102", map); if (l1 && l2) ensure("m103", l1, l2) }

if (changed) fs.writeFileSync(MATCHES, src)
console.log(changed ? `resolved ${changed} fixtures` : "no new fixtures to resolve")
