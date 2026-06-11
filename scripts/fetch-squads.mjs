/**
 * Fetches current squad data from Wikipedia for all 48 WC 2026 teams
 * and updates src/data/teams.ts keyPlayers arrays.
 *
 * Run with: node scripts/fetch-squads.mjs
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Wikipedia page names for each team
const WIKI_PAGES = {
  "Mexico":                  "Mexico_national_football_team",
  "South Korea":             "South_Korea_national_football_team",
  "South Africa":            "South_Africa_national_football_team",
  "Czech Republic":          "Czech_Republic_national_football_team",
  "Canada":                  "Canada_national_soccer_team",
  "Switzerland":             "Switzerland_national_football_team",
  "Qatar":                   "Qatar_national_football_team",
  "Bosnia and Herzegovina":  "Bosnia_and_Herzegovina_national_football_team",
  "Brazil":                  "Brazil_national_football_team",
  "Morocco":                 "Morocco_national_football_team",
  "Scotland":                "Scotland_national_football_team",
  "Haiti":                   "Haiti_national_football_team",
  "United States":           "United_States_men%27s_national_soccer_team",
  "Australia":               "Australia_national_football_team",
  "Paraguay":                "Paraguay_national_football_team",
  "Turkey":                  "Turkey_national_football_team",
  "Germany":                 "Germany_national_football_team",
  "Ecuador":                 "Ecuador_national_football_team",
  "Ivory Coast":             "Ivory_Coast_national_football_team",
  "Curaçao":                 "Cura%C3%A7ao_national_football_team",
  "Netherlands":             "Netherlands_national_football_team",
  "Japan":                   "Japan_national_football_team",
  "Tunisia":                 "Tunisia_national_football_team",
  "Sweden":                  "Sweden_national_football_team",
  "Belgium":                 "Belgium_national_football_team",
  "Iran":                    "Iran_national_football_team",
  "Egypt":                   "Egypt_national_football_team",
  "New Zealand":             "New_Zealand_national_football_team",
  "Spain":                   "Spain_national_football_team",
  "Uruguay":                 "Uruguay_national_football_team",
  "Saudi Arabia":            "Saudi_Arabia_national_football_team",
  "Cape Verde":              "Cape_Verde_national_football_team",
  "France":                  "France_national_football_team",
  "Senegal":                 "Senegal_national_football_team",
  "Norway":                  "Norway_national_football_team",
  "Iraq":                    "Iraq_national_football_team",
  "Argentina":               "Argentina_national_football_team",
  "Austria":                 "Austria_national_football_team",
  "Algeria":                 "Algeria_national_football_team",
  "Jordan":                  "Jordan_national_football_team",
  "Portugal":                "Portugal_national_football_team",
  "Colombia":                "Colombia_national_football_team",
  "Uzbekistan":              "Uzbekistan_national_football_team",
  "DR Congo":                "Democratic_Republic_of_the_Congo_national_football_team",
  "England":                 "England_national_football_team",
  "Croatia":                 "Croatia_national_football_team",
  "Panama":                  "Panama_national_football_team",
  "Ghana":                   "Ghana_national_football_team",
}

const WIKI_API = "https://en.wikipedia.org/w/api.php"

async function getSections(page) {
  const url = `${WIKI_API}?action=parse&page=${page}&prop=sections&format=json&origin=*`
  const res = await fetch(url)
  const json = await res.json()
  return json?.parse?.sections ?? []
}

async function getSectionWikitext(page, sectionIndex) {
  const url = `${WIKI_API}?action=parse&page=${page}&prop=wikitext&section=${sectionIndex}&format=json&origin=*`
  const res = await fetch(url)
  const json = await res.json()
  return json?.parse?.wikitext?.["*"] ?? ""
}

function parsePlayersFromWikitext(wikitext) {
  const players = []

  // Match {{fb squad player ... | name=[[Player Name]] ... }}
  // or | name = [[Player Name|Display]] |
  const nameRegex = /\|\s*name\s*=\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/gi
  let match
  while ((match = nameRegex.exec(wikitext)) !== null) {
    const name = match[1].trim()
    if (name && !players.includes(name)) {
      players.push(name)
    }
  }

  // Fallback: plain name= field without wikilinks
  if (players.length === 0) {
    const plainRegex = /\|\s*name\s*=\s*([^\|\n\}]+)/gi
    while ((match = plainRegex.exec(wikitext)) !== null) {
      const name = match[1].replace(/\[\[|\]\]/g, "").split("|")[0].trim()
      if (name && name.length > 2 && !players.includes(name)) {
        players.push(name)
      }
    }
  }

  return players
}

async function fetchSquadForTeam(teamName) {
  const page = WIKI_PAGES[teamName]
  if (!page) {
    console.log(`  ⚠ No wiki page mapped for ${teamName}`)
    return null
  }

  try {
    // Find the "Current squad" section
    const sections = await getSections(page)
    const squadSection = sections.find(
      (s) =>
        s.line.toLowerCase().includes("current squad") ||
        s.line.toLowerCase() === "squad"
    )

    if (!squadSection) {
      console.log(`  ⚠ No squad section found for ${teamName}`)
      return null
    }

    const wikitext = await getSectionWikitext(page, squadSection.index)
    const players = parsePlayersFromWikitext(wikitext)

    if (players.length === 0) {
      console.log(`  ⚠ Could not parse players for ${teamName}`)
      return null
    }

    // Pick 5 key players . forwards/attackers tend to be listed last, so mix positions
    // Just take 5 spread across the list (GK + 2 mid-list + 2 from end)
    const total = players.length
    const picks = [
      players[0],
      players[Math.floor(total * 0.25)],
      players[Math.floor(total * 0.5)],
      players[Math.floor(total * 0.75)],
      players[total - 1],
    ].filter((p, i, arr) => p && arr.indexOf(p) === i) // dedupe

    return picks.slice(0, 5)
  } catch (err) {
    console.log(`  ✗ Error fetching ${teamName}: ${err.message}`)
    return null
  }
}

async function main() {
  console.log("Fetching squads from Wikipedia...\n")

  const results = {}
  const teamNames = Object.keys(WIKI_PAGES)

  for (const teamName of teamNames) {
    process.stdout.write(`Fetching ${teamName}... `)
    const players = await fetchSquadForTeam(teamName)
    if (players) {
      results[teamName] = players
      console.log(`✓ ${players.join(", ")}`)
    } else {
      console.log("skipped")
    }
    // Be polite to Wikipedia's servers
    await new Promise((r) => setTimeout(r, 300))
  }

  // Now update teams.ts
  const teamsPath = path.join(__dirname, "../src/data/teams.ts")
  let source = fs.readFileSync(teamsPath, "utf8")

  let updatedCount = 0
  for (const [teamName, players] of Object.entries(results)) {
    if (!players || players.length === 0) continue

    const playersArray = `["${players.join('", "')}"]`

    // Match keyPlayers line for this team by finding the team's name then the keyPlayers
    // Strategy: replace keyPlayers line that appears within ~10 lines of the team's name entry
    const escapedName = teamName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(
      `(name:\\s*"${escapedName}"[\\s\\S]{0,500}?keyPlayers:\\s*)\\[[^\\]]*\\]`,
      "m"
    )

    if (regex.test(source)) {
      source = source.replace(regex, `$1${playersArray}`)
      updatedCount++
    } else {
      console.log(`  ⚠ Could not find keyPlayers entry for: ${teamName}`)
    }
  }

  fs.writeFileSync(teamsPath, source, "utf8")
  console.log(`\n✅ Updated ${updatedCount}/${teamNames.length} teams in teams.ts`)
}

main().catch(console.error)
