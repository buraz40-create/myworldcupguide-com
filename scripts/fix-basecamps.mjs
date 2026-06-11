// Reconcile src/data/baseCamps.ts against FIFA's official 48-team Base Camp
// infographic (2026-06-03 release). Updates city / region / facility per team
// while preserving the existing editorial blurb, image path and coordinates.
//
// Run with: node scripts/fix-basecamps.mjs

import fs from "node:fs"

// Team key -> FIFA-correct city / region / facility. Only fields that need
// changing are listed; everything else (blurb, coordinates, image) is preserved.
const FIXES = {
  "South Korea":            { city: "Zapopan" },
  "South Africa":           { city: "San Agustín Tlaxiaca", facility: "CF Pachuca - Universidad Del Futbol" },
  "Czech Republic":         { city: "Mansfield" },
  "Brazil":                 { city: "Morristown" },
  "Morocco":                { city: "Basking Ridge" },
  "United States":          { /* already correct */ },
  "Australia":              { city: "Alameda" },
  "Paraguay":               { city: "San Jose" },
  "Ivory Coast":            { city: "Chester", facility: "Philadelphia Union Stadium" },
  "Netherlands":            { city: "Riverside", region: "Missouri" },
  "Tunisia":                { city: "Santiago", region: "Nuevo León", facility: "Rayados Training Center" },
  "Uruguay":                { city: "Playa del Carmen", facility: "Mayakoba Training Center Cancun" },
  "France":                 { city: "Waltham", region: "Massachusetts" },
  "Senegal":                { city: "Piscataway" },
  "Iraq":                   { city: "White Sulphur Springs", facility: "The Greenbrier Sports Performance Center" },
  "Austria":                { city: "Santa Barbara", facility: "UC Santa Barbara - Harder Stadium" },
  "Algeria":                { city: "Lawrence" },
  "England":                { region: "Missouri" },
  "Colombia":               { city: "Zapopan" },
  "Uzbekistan":             { city: "Marietta" },
  "DR Congo":               { facility: "Houston Sports Park" },
}

const PATH = "src/data/baseCamps.ts"
let src = fs.readFileSync(PATH, "utf8")
let changes = 0

for (const [team, patch] of Object.entries(FIXES)) {
  // Locate the team's object block by matching "Team Name": { ... },
  // greedy enough to span multiple lines until the closing },
  const re = new RegExp(`(\\"${team.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\":\\s*\\{)([\\s\\S]*?)(\\n  \\},)`, "m")
  const match = src.match(re)
  if (!match) { console.error(`! could not locate ${team}`); continue }
  let block = match[2]
  let touched = false
  for (const [field, value] of Object.entries(patch)) {
    const fieldRe = new RegExp(`(${field}:\\s*\\")[^\\"]*(\\")`)
    if (fieldRe.test(block)) {
      const before = block
      block = block.replace(fieldRe, `$1${value}$2`)
      if (block !== before) { touched = true; changes++ }
    } else {
      console.warn(`  ${team}: field "${field}" not found`)
    }
  }
  if (touched) {
    src = src.slice(0, match.index) + match[1] + block + match[3] + src.slice(match.index + match[0].length)
    console.log(`✓ ${team}`)
  }
}

fs.writeFileSync(PATH, src)
console.log(`\nApplied ${changes} field changes across ${Object.keys(FIXES).length} teams.`)
