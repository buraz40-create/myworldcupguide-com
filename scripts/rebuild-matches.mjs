// Regenerate src/data/matches.ts from the official 2026 World Cup schedule.
// Source: ESPN (via FIFA's published fixture list). Cross-verified against
// FIFA.com for the opening match (Mexico vs South Africa at Estadio Azteca).
//
// Times are local stadium time. Knockout-round home/away are "TBD" until the
// bracket resolves; venues + dates are fixed.

import fs from "node:fs"

// City name in source -> our city slug
const CITY = {
  "Mexico City":       "mexico-city",
  "Zapopan":           "guadalajara",       // Estadio Akron is in Zapopan, Greater Guadalajara
  "Guadalupe":         "monterrey",         // Estadio BBVA is in Guadalupe, Monterrey metro
  "Toronto":           "toronto",
  "Vancouver":         "vancouver",
  "Inglewood":         "los-angeles",
  "Santa Clara":       "san-francisco-bay-area",
  "East Rutherford":   "new-york-new-jersey",
  "Foxborough":        "boston",
  "Houston":           "houston",
  "Arlington":         "dallas",
  "Philadelphia":      "philadelphia",
  "Atlanta":           "atlanta",
  "Seattle":           "seattle",
  "Miami Gardens":     "miami",
  "Kansas City":       "kansas-city",
}

// City -> stadium slug (each of the 16 host cities has one WC venue)
const STADIUM = {
  "Mexico City":       "estadio-azteca",
  "Zapopan":           "estadio-akron",
  "Guadalupe":         "estadio-bbva",
  "Toronto":           "bmo-field",
  "Vancouver":         "bc-place",
  "Inglewood":         "sofi-stadium",
  "Santa Clara":       "levis-stadium",
  "East Rutherford":   "metlife-stadium",
  "Foxborough":        "gillette-stadium",
  "Houston":           "nrg-stadium",
  "Arlington":         "att-stadium",
  "Philadelphia":      "lincoln-financial-field",
  "Atlanta":           "mercedes-benz-stadium",
  "Seattle":           "lumen-field",
  "Miami Gardens":     "hard-rock-stadium",
  "Kansas City":       "arrowhead-stadium",
}

// Team name in source -> our team name (teams.ts)
const TEAM = {
  "Czechia": "Czech Republic",
  "Türkiye": "Turkey",
}
const fix = (t) => TEAM[t] ?? t

// All 104 matches in order. Group stage 1-72, R32 73-88, R16 89-96, QF 97-100, SF 101-102, 3rd 103, Final 104.
const ROWS = [
  // n | date | time | home | away | city | round | group
  [1,  "2026-06-11", "13:00", "Mexico", "South Africa", "Mexico City", "Group Stage", "A"],
  [2,  "2026-06-11", "20:00", "South Korea", "Czechia", "Zapopan", "Group Stage", "A"],
  [3,  "2026-06-12", "15:00", "Canada", "Bosnia and Herzegovina", "Toronto", "Group Stage", "B"],
  [4,  "2026-06-12", "18:00", "United States", "Paraguay", "Inglewood", "Group Stage", "D"],
  [5,  "2026-06-13", "12:00", "Qatar", "Switzerland", "Santa Clara", "Group Stage", "B"],
  [6,  "2026-06-13", "18:00", "Brazil", "Morocco", "East Rutherford", "Group Stage", "C"],
  [7,  "2026-06-13", "21:00", "Haiti", "Scotland", "Foxborough", "Group Stage", "C"],
  [8,  "2026-06-13", "21:00", "Australia", "Türkiye", "Vancouver", "Group Stage", "D"],
  [9,  "2026-06-14", "12:00", "Germany", "Curaçao", "Houston", "Group Stage", "E"],
  [10, "2026-06-14", "15:00", "Netherlands", "Japan", "Arlington", "Group Stage", "F"],
  [11, "2026-06-14", "19:00", "Ivory Coast", "Ecuador", "Philadelphia", "Group Stage", "E"],
  [12, "2026-06-14", "20:00", "Sweden", "Tunisia", "Guadalupe", "Group Stage", "F"],
  [13, "2026-06-15", "12:00", "Spain", "Cape Verde", "Atlanta", "Group Stage", "H"],
  [14, "2026-06-15", "15:00", "Belgium", "Egypt", "Seattle", "Group Stage", "G"],
  [15, "2026-06-15", "18:00", "Saudi Arabia", "Uruguay", "Miami Gardens", "Group Stage", "H"],
  [16, "2026-06-15", "18:00", "Iran", "New Zealand", "Inglewood", "Group Stage", "G"],
  [17, "2026-06-16", "15:00", "France", "Senegal", "East Rutherford", "Group Stage", "I"],
  [18, "2026-06-16", "18:00", "Iraq", "Norway", "Foxborough", "Group Stage", "I"],
  [19, "2026-06-16", "20:00", "Argentina", "Algeria", "Kansas City", "Group Stage", "J"],
  [20, "2026-06-16", "21:00", "Austria", "Jordan", "Santa Clara", "Group Stage", "J"],
  [21, "2026-06-17", "12:00", "Portugal", "DR Congo", "Houston", "Group Stage", "K"],
  [22, "2026-06-17", "15:00", "England", "Croatia", "Arlington", "Group Stage", "L"],
  [23, "2026-06-17", "19:00", "Ghana", "Panama", "Toronto", "Group Stage", "L"],
  [24, "2026-06-17", "20:00", "Uzbekistan", "Colombia", "Mexico City", "Group Stage", "K"],
  [25, "2026-06-18", "12:00", "Czechia", "South Africa", "Atlanta", "Group Stage", "A"],
  [26, "2026-06-18", "15:00", "Switzerland", "Bosnia and Herzegovina", "Inglewood", "Group Stage", "B"],
  [27, "2026-06-18", "18:00", "Canada", "Qatar", "Vancouver", "Group Stage", "B"],
  [28, "2026-06-18", "21:00", "Mexico", "South Korea", "Zapopan", "Group Stage", "A"],
  [29, "2026-06-19", "12:00", "United States", "Australia", "Seattle", "Group Stage", "D"],
  [30, "2026-06-19", "18:00", "Scotland", "Morocco", "Foxborough", "Group Stage", "C"],
  [31, "2026-06-19", "21:00", "Brazil", "Haiti", "Philadelphia", "Group Stage", "C"],
  [32, "2026-06-19", "20:00", "Türkiye", "Paraguay", "Santa Clara", "Group Stage", "D"],
  [33, "2026-06-20", "12:00", "Netherlands", "Sweden", "Houston", "Group Stage", "F"],
  [34, "2026-06-20", "16:00", "Germany", "Ivory Coast", "Toronto", "Group Stage", "E"],
  [35, "2026-06-20", "19:00", "Ecuador", "Curaçao", "Kansas City", "Group Stage", "E"],
  [36, "2026-06-20", "22:00", "Tunisia", "Japan", "Guadalupe", "Group Stage", "F"],
  [37, "2026-06-21", "12:00", "Spain", "Saudi Arabia", "Atlanta", "Group Stage", "H"],
  [38, "2026-06-21", "15:00", "Belgium", "Iran", "Inglewood", "Group Stage", "G"],
  [39, "2026-06-21", "18:00", "Uruguay", "Cape Verde", "Miami Gardens", "Group Stage", "H"],
  [40, "2026-06-21", "21:00", "New Zealand", "Egypt", "Vancouver", "Group Stage", "G"],
  [41, "2026-06-22", "12:00", "Argentina", "Austria", "Arlington", "Group Stage", "J"],
  [42, "2026-06-22", "17:00", "France", "Iraq", "Philadelphia", "Group Stage", "I"],
  [43, "2026-06-22", "20:00", "Norway", "Senegal", "East Rutherford", "Group Stage", "I"],
  [44, "2026-06-22", "20:00", "Jordan", "Algeria", "Santa Clara", "Group Stage", "J"],
  [45, "2026-06-23", "12:00", "Portugal", "Uzbekistan", "Houston", "Group Stage", "K"],
  [46, "2026-06-23", "16:00", "England", "Ghana", "Foxborough", "Group Stage", "L"],
  [47, "2026-06-23", "19:00", "Panama", "Croatia", "Toronto", "Group Stage", "L"],
  [48, "2026-06-23", "20:00", "Colombia", "DR Congo", "Zapopan", "Group Stage", "K"],
  [49, "2026-06-24", "12:00", "Switzerland", "Canada", "Vancouver", "Group Stage", "B"],
  [50, "2026-06-24", "12:00", "Bosnia and Herzegovina", "Qatar", "Seattle", "Group Stage", "B"],
  [51, "2026-06-24", "18:00", "Scotland", "Brazil", "Miami Gardens", "Group Stage", "C"],
  [52, "2026-06-24", "18:00", "Morocco", "Haiti", "Atlanta", "Group Stage", "C"],
  [53, "2026-06-24", "19:00", "Czechia", "Mexico", "Mexico City", "Group Stage", "A"],
  [54, "2026-06-24", "19:00", "South Africa", "South Korea", "Guadalupe", "Group Stage", "A"],
  [55, "2026-06-25", "16:00", "Ecuador", "Germany", "East Rutherford", "Group Stage", "E"],
  [56, "2026-06-25", "16:00", "Curaçao", "Ivory Coast", "Philadelphia", "Group Stage", "E"],
  [57, "2026-06-25", "18:00", "Japan", "Sweden", "Arlington", "Group Stage", "F"],
  [58, "2026-06-25", "18:00", "Tunisia", "Netherlands", "Kansas City", "Group Stage", "F"],
  [59, "2026-06-25", "19:00", "Türkiye", "United States", "Inglewood", "Group Stage", "D"],
  [60, "2026-06-25", "19:00", "Paraguay", "Australia", "Santa Clara", "Group Stage", "D"],
  [61, "2026-06-26", "15:00", "Norway", "France", "Foxborough", "Group Stage", "I"],
  [62, "2026-06-26", "15:00", "Senegal", "Iraq", "Toronto", "Group Stage", "I"],
  [63, "2026-06-26", "19:00", "Cape Verde", "Saudi Arabia", "Houston", "Group Stage", "H"],
  [64, "2026-06-26", "20:00", "Uruguay", "Spain", "Zapopan", "Group Stage", "H"],
  [65, "2026-06-26", "20:00", "Egypt", "Iran", "Seattle", "Group Stage", "G"],
  [66, "2026-06-26", "20:00", "New Zealand", "Belgium", "Vancouver", "Group Stage", "G"],
  [67, "2026-06-27", "17:00", "Panama", "England", "East Rutherford", "Group Stage", "L"],
  [68, "2026-06-27", "17:00", "Croatia", "Ghana", "Philadelphia", "Group Stage", "L"],
  [69, "2026-06-27", "19:30", "Colombia", "Portugal", "Miami Gardens", "Group Stage", "K"],
  [70, "2026-06-27", "19:30", "DR Congo", "Uzbekistan", "Atlanta", "Group Stage", "K"],
  [71, "2026-06-27", "22:00", "Algeria", "Austria", "Kansas City", "Group Stage", "J"],
  [72, "2026-06-27", "22:00", "Jordan", "Argentina", "Arlington", "Group Stage", "J"],
  // Knockouts . teams TBD, venues + dates fixed
  [73, "2026-06-28", "15:00", "TBD", "TBD", "Inglewood", "Round of 32", ""],
  [74, "2026-06-29", "13:00", "TBD", "TBD", "Houston", "Round of 32", ""],
  [75, "2026-06-29", "16:30", "TBD", "TBD", "Foxborough", "Round of 32", ""],
  [76, "2026-06-29", "19:00", "TBD", "TBD", "Guadalupe", "Round of 32", ""],
  [77, "2026-06-30", "13:00", "TBD", "TBD", "Arlington", "Round of 32", ""],
  [78, "2026-06-30", "17:00", "TBD", "TBD", "East Rutherford", "Round of 32", ""],
  [79, "2026-06-30", "19:00", "TBD", "TBD", "Mexico City", "Round of 32", ""],
  [80, "2026-07-01", "12:00", "TBD", "TBD", "Atlanta", "Round of 32", ""],
  [81, "2026-07-01", "16:00", "TBD", "TBD", "Seattle", "Round of 32", ""],
  [82, "2026-07-01", "20:00", "TBD", "TBD", "Santa Clara", "Round of 32", ""],
  [83, "2026-07-02", "15:00", "TBD", "TBD", "Inglewood", "Round of 32", ""],
  [84, "2026-07-02", "19:00", "TBD", "TBD", "Toronto", "Round of 32", ""],
  [85, "2026-07-02", "20:00", "TBD", "TBD", "Vancouver", "Round of 32", ""],
  [86, "2026-07-03", "14:00", "TBD", "TBD", "Arlington", "Round of 32", ""],
  [87, "2026-07-03", "18:00", "TBD", "TBD", "Miami Gardens", "Round of 32", ""],
  [88, "2026-07-03", "21:30", "TBD", "TBD", "Kansas City", "Round of 32", ""],
  [89, "2026-07-04", "13:00", "TBD", "TBD", "Houston", "Round of 16", ""],
  [90, "2026-07-04", "17:00", "TBD", "TBD", "Philadelphia", "Round of 16", ""],
  [91, "2026-07-05", "16:00", "TBD", "TBD", "East Rutherford", "Round of 16", ""],
  [92, "2026-07-05", "18:00", "TBD", "TBD", "Mexico City", "Round of 16", ""],
  [93, "2026-07-06", "15:00", "TBD", "TBD", "Arlington", "Round of 16", ""],
  [94, "2026-07-06", "17:00", "TBD", "TBD", "Seattle", "Round of 16", ""],
  [95, "2026-07-07", "12:00", "TBD", "TBD", "Atlanta", "Round of 16", ""],
  [96, "2026-07-07", "16:00", "TBD", "TBD", "Vancouver", "Round of 16", ""],
  [97, "2026-07-09", "16:00", "TBD", "TBD", "Foxborough", "Quarterfinal", ""],
  [98, "2026-07-10", "15:00", "TBD", "TBD", "Inglewood", "Quarterfinal", ""],
  [99, "2026-07-11", "17:00", "TBD", "TBD", "Miami Gardens", "Quarterfinal", ""],
  [100,"2026-07-11", "21:00", "TBD", "TBD", "Kansas City", "Quarterfinal", ""],
  [101,"2026-07-14", "15:00", "TBD", "TBD", "Arlington", "Semi-final", ""],
  [102,"2026-07-15", "15:00", "TBD", "TBD", "Atlanta", "Semi-final", ""],
  [103,"2026-07-18", "17:00", "TBD", "TBD", "Miami Gardens", "3rd Place", ""],
  [104,"2026-07-19", "15:00", "TBD", "TBD", "East Rutherford", "Final", ""],
]

const lines = ROWS.map(([n, date, time, home, away, city, round, group]) => {
  const id = `m${String(n).padStart(2, "0")}`
  const homeFixed = fix(home)
  const awayFixed = fix(away)
  const stadiumSlug = STADIUM[city]
  const citySlug = CITY[city]
  if (!stadiumSlug) throw new Error(`unknown stadium city: ${city}`)
  if (!citySlug) throw new Error(`unknown city: ${city}`)
  const groupField = group ? `, group:"${group}"` : ""
  return `  { id:"${id}", matchNumber:${n}, round:"${round}"${groupField}, date:"${date}", time:"${time}", homeTeam:"${homeFixed}", awayTeam:"${awayFixed}", stadiumSlug:"${stadiumSlug}", citySlug:"${citySlug}" },`
})

const file = `export type Match = {
  id: string
  matchNumber: number
  round: "Group Stage" | "Round of 32" | "Round of 16" | "Quarterfinal" | "Semi-final" | "3rd Place" | "Final"
  group?: string
  date: string        // "2026-06-11"
  time: string        // local stadium time "20:00"
  homeTeam: string
  awayTeam: string
  stadiumSlug: string
  citySlug: string
}

// Authoritative 104-match fixture list for the 2026 FIFA World Cup.
// Source: FIFA / ESPN official schedule. Times are local stadium time.
// Regenerate by running: node scripts/rebuild-matches.mjs
export const matches: Match[] = [
${lines.join("\n")}
]

export function getMatchesByCity(citySlug: string): Match[] {
  return matches.filter((m) => m.citySlug === citySlug)
}

export function getMatchesByStadium(stadiumSlug: string): Match[] {
  return matches.filter((m) => m.stadiumSlug === stadiumSlug)
}

function slugifyName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function slugForMatch(m: Match): string {
  if (m.homeTeam === "TBD" || m.awayTeam === "TBD") {
    return \`\${slugifyName(m.round)}-match-\${m.matchNumber}\`
  }
  return \`\${slugifyName(m.homeTeam)}-vs-\${slugifyName(m.awayTeam)}-\${m.matchNumber}\`
}

export function getMatchBySlug(slug: string): Match | undefined {
  return matches.find((m) => slugForMatch(m) === slug)
}

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id)
}
`

fs.writeFileSync("src/data/matches.ts", file)
console.log(`Wrote ${ROWS.length} matches to src/data/matches.ts`)

// Sanity check: each group should have 6 matches, each team 3 group matches.
const groups = {}
const teamCount = {}
for (const r of ROWS) {
  const [, , , h, a, , round, g] = r
  if (round !== "Group Stage") continue
  groups[g] = (groups[g] ?? 0) + 1
  teamCount[fix(h)] = (teamCount[fix(h)] ?? 0) + 1
  teamCount[fix(a)] = (teamCount[fix(a)] ?? 0) + 1
}
console.log("Group match counts:", groups)
const bad = Object.entries(teamCount).filter(([, n]) => n !== 3)
if (bad.length) console.error("Teams with wrong match count:", bad)
else console.log(`All teams have exactly 3 group matches ✓`)
