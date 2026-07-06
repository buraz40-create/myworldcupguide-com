// Sync knockout match dates/times in matches.ts to the real ESPN kickoff times,
// converted to local stadium time. Only touches knockout matches (m73+); group
// fixtures are left alone. Run standalone or after resolve-knockout.mjs.
//
//   node scripts/sync-match-times.mjs

import fs from "node:fs"

const MATCHES = "src/data/matches.ts"
let src = fs.readFileSync(MATCHES, "utf8")

// Local UTC offsets during the tournament window (all in DST; Mexico has none).
const OFFSET = {
  "philadelphia": -4, "new-york-new-jersey": -4, "atlanta": -4, "boston": -4, "miami": -4, "toronto": -4,
  "houston": -5, "dallas": -5, "kansas-city": -5,
  "seattle": -7, "vancouver": -7, "los-angeles": -7, "san-francisco-bay-area": -7,
  "mexico-city": -6, "monterrey": -6, "guadalajara": -6,
}
const NAME_ALIASES = {
  "USA": "United States", "Türkiye": "Turkey", "Turkiye": "Turkey", "Czechia": "Czech Republic",
  "Korea Republic": "South Korea", "Côte d'Ivoire": "Ivory Coast", "Cote d'Ivoire": "Ivory Coast",
  "Cape Verde Islands": "Cape Verde", "Curacao": "Curaçao", "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Congo DR": "DR Congo",
}
const canon = (n) => (n ? (NAME_ALIASES[n] ?? n) : "")

function parse() {
  const re = /id:"(m\d+)",\s*matchNumber:(\d+),[^}]*?homeTeam:"([^"]*)",\s*awayTeam:"([^"]*)",\s*stadiumSlug:"[^"]*",\s*citySlug:"([^"]*)"/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) out.push({ id: m[1], num: +m[2], home: m[3], away: m[4], city: m[5] })
  return out
}
function setDateTime(id, date, time) {
  const re = new RegExp('(id:"' + id + '",[^}]*?date:")[^"]*(",\\s*time:")[^"]*(")')
  const before = src
  src = src.replace(re, `$1${date}$2${time}$3`)
  return src !== before
}

async function espn(date) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date.replaceAll("-", "")}`
  const res = await fetch(url, { headers: { "User-Agent": "myworldcupguide-bot/1.0" } })
  if (!res.ok) return []
  const j = await res.json()
  return (j.events ?? []).map((e) => {
    const c = e.competitions?.[0]
    const h = c?.competitors?.find((x) => x.homeAway === "home")
    const a = c?.competitors?.find((x) => x.homeAway === "away")
    return { iso: e.date, home: canon(h?.team?.displayName), away: canon(a?.team?.displayName) }
  }).filter((e) => e.iso && e.home && e.away)
}

async function main() {
  const matches = parse().filter((m) => m.num >= 73 && m.home !== "TBD" && m.away !== "TBD")
  const dates = ["2026-06-28", "2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02", "2026-07-03",
    "2026-07-04", "2026-07-05", "2026-07-06", "2026-07-07", "2026-07-09", "2026-07-10", "2026-07-11",
    "2026-07-14", "2026-07-15", "2026-07-18", "2026-07-19"]
  const events = []
  for (const d of dates) events.push(...await espn(d))

  let updated = 0
  for (const m of matches) {
    const off = OFFSET[m.city]
    if (off == null) continue
    const ev = events.find((e) => e.home === canon(m.home) && e.away === canon(m.away))
    if (!ev) continue
    const local = new Date(new Date(ev.iso).getTime() + off * 3600 * 1000)
    const date = local.toISOString().slice(0, 10)
    const time = local.toISOString().slice(11, 16)
    if (setDateTime(m.id, date, time)) { updated++; console.log(`  ${m.id}: ${m.home} v ${m.away} -> ${date} ${time} (${m.city})`) }
  }
  if (updated) fs.writeFileSync(MATCHES, src)
  console.log(updated ? `synced ${updated} kickoff times` : "all kickoff times already correct")
}
main().catch((e) => { console.error(e); process.exit(1) })
