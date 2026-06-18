// Fetches finished World Cup match scores from ESPN's public scoreboard API
// and merges them into src/data/matchResults.json by our internal match id.
//
// Usage:
//   node scripts/fetch-match-scores.mjs            # today + yesterday
//   node scripts/fetch-match-scores.mjs 2026-06-12 # specific date
//
// We match ESPN events to our matches.ts entries by (date, homeTeam, awayTeam)
// using a loose name map. ESPN's "FT" status maps to status:"FT".

import fs from "node:fs"

const RESULTS_PATH = "src/data/matchResults.json"
const MATCHES_PATH = "src/data/matches.ts"

// ESPN team names sometimes differ from FIFA/our canonical names. Map both
// directions here. Keep the key as ESPN's exact displayName.
const NAME_ALIASES = {
  "United States": "United States",
  "USA": "United States",
  "USMNT": "United States",
  "South Korea": "South Korea",
  "Korea Republic": "South Korea",
  "Republic of Korea": "South Korea",
  "Türkiye": "Turkey",
  "Turkiye": "Turkey",
  "Côte d'Ivoire": "Ivory Coast",
  "Cote d'Ivoire": "Ivory Coast",
  "Czechia": "Czech Republic",
  "Cape Verde Islands": "Cape Verde",
  "Curacao": "Curaçao",
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  "BIH": "Bosnia and Herzegovina",
  "Congo DR": "DR Congo",
  "DR Congo": "DR Congo",
  "Democratic Republic of the Congo": "DR Congo",
  "Cape Verde Islands": "Cape Verde",
}

function canon(name) {
  if (!name) return ""
  return NAME_ALIASES[name] ?? name
}

function loadMatches() {
  const src = fs.readFileSync(MATCHES_PATH, "utf8")
  const re = /\{\s*id:\s*"([^"]+)",[^}]*?date:\s*"([^"]+)",[^}]*?homeTeam:\s*"([^"]+)",\s*awayTeam:\s*"([^"]+)"/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) {
    out.push({ id: m[1], date: m[2], homeTeam: m[3], awayTeam: m[4] })
  }
  return out
}

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) return {}
  return JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8"))
}

function saveResults(r) {
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(r, null, 2) + "\n")
}

function datesToFetch(arg) {
  if (arg) return [arg]
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const y = new Date(now.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10)
  return [y, today]
}

function compactDate(iso) {
  return iso.replaceAll("-", "")
}

async function fetchEspnScoreboard(dateIso) {
  // FIFA World Cup league code in ESPN is "fifa.world"
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${compactDate(dateIso)}`
  const res = await fetch(url, { headers: { "User-Agent": "myworldcupguide-bot/1.0" } })
  if (!res.ok) throw new Error(`ESPN ${dateIso}: HTTP ${res.status}`)
  return res.json()
}

function extractFromEvent(ev) {
  const comp = ev.competitions?.[0]
  if (!comp) return null
  const home = comp.competitors.find((c) => c.homeAway === "home")
  const away = comp.competitors.find((c) => c.homeAway === "away")
  if (!home || !away) return null
  const statusType = comp.status?.type?.name ?? ev.status?.type?.name ?? ""
  let status = "scheduled"
  if (statusType === "STATUS_FULL_TIME" || statusType === "STATUS_FINAL") status = "FT"
  else if (statusType === "STATUS_END_EXTRA_TIME") status = "AET"
  else if (statusType === "STATUS_END_PENALTY_SHOOTOUT" || statusType === "STATUS_FINAL_PEN") status = "PEN"
  else if (statusType === "STATUS_IN_PROGRESS" || statusType === "STATUS_HALFTIME") status = "live"
  const homeName = canon(home.team?.displayName ?? home.team?.name)
  const awayName = canon(away.team?.displayName ?? away.team?.name)
  return {
    date: ev.date?.slice(0, 10),
    homeName,
    awayName,
    homeScore: parseInt(home.score ?? "0", 10),
    awayScore: parseInt(away.score ?? "0", 10),
    status,
    penaltyHome: home.shootoutScore != null ? parseInt(home.shootoutScore, 10) : undefined,
    penaltyAway: away.shootoutScore != null ? parseInt(away.shootoutScore, 10) : undefined,
  }
}

async function main() {
  const arg = process.argv[2]
  const dates = datesToFetch(arg)
  const matches = loadMatches()
  const results = loadResults()
  let updated = 0
  for (const d of dates) {
    let payload
    try {
      payload = await fetchEspnScoreboard(d)
    } catch (e) {
      console.warn(`skip ${d}: ${e.message}`)
      continue
    }
    const events = payload.events ?? []
    console.log(`${d}: ${events.length} events from ESPN`)
    for (const ev of events) {
      const x = extractFromEvent(ev)
      if (!x) continue
      if (x.status === "scheduled") continue
      // Find our match by team pair, allowing ±1 day tolerance on the date
      // (ESPN dates are UTC, our matches.ts dates are local stadium time).
      // Each team pair plays once per tournament so this is unambiguous.
      const ours = matches.find((m) => {
        if (canon(m.homeTeam) !== x.homeName || canon(m.awayTeam) !== x.awayName) return false
        if (!x.date) return false
        const ours = new Date(m.date + "T12:00:00Z").getTime()
        const theirs = new Date(x.date + "T12:00:00Z").getTime()
        return Math.abs(ours - theirs) <= 36 * 3600 * 1000
      })
      if (!ours) {
        console.warn(`  unmatched ESPN event: ${x.date} ${x.homeName} ${x.homeScore}-${x.awayScore} ${x.awayName}`)
        continue
      }
      const prev = results[ours.id] ?? {}
      const next = {
        ...prev,
        homeScore: x.homeScore,
        awayScore: x.awayScore,
        status: x.status,
      }
      if (x.penaltyHome != null) next.penaltyHome = x.penaltyHome
      if (x.penaltyAway != null) next.penaltyAway = x.penaltyAway
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        results[ours.id] = next
        updated++
        console.log(`  ${ours.id}: ${ours.homeTeam} ${x.homeScore}-${x.awayScore} ${ours.awayTeam} [${x.status}]`)
      }
    }
  }
  saveResults(results)
  console.log(`updated ${updated} match results`)
}

main().catch((e) => { console.error(e); process.exit(1) })
