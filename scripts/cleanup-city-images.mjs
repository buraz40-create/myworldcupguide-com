import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const CITIES = path.join(ROOT, "src", "data", "cities.ts")
const STADIUMS = path.join(ROOT, "src", "data", "stadiums.ts")

const citySrc = await fs.readFile(CITIES, "utf8")
const stadSrc = await fs.readFile(STADIUMS, "utf8")

// Build stadiumSlug -> local image map from stadiums.ts
const stadMap = new Map()
const stadRe = /slug:\s*"([^"]+)"[\s\S]*?image:\s*"([^"]+)"/g
let m
while ((m = stadRe.exec(stadSrc))) {
  if (m[2].startsWith("/images/")) stadMap.set(m[1], m[2])
}
console.log(`Loaded ${stadMap.size} stadium images`)

// Process cities.ts: for each city, strip remote URLs from images[] and
// fall back to stadium photo if empty
let updated = citySrc
const cityRe = /(slug:\s*"([^"]+)"[\s\S]*?stadiumSlug:\s*"([^"]+)"[\s\S]*?images:\s*\[)([\s\S]*?)(\],)/g

updated = updated.replace(cityRe, (_full, prefix, _slug, stadiumSlug, body, suffix) => {
  const urls = [...body.matchAll(/"([^"]+)"/g)].map(m => m[1])
  const local = urls.filter(u => u.startsWith("/images/"))
  const finalUrls = local.length > 0
    ? local
    : (stadMap.has(stadiumSlug) ? [stadMap.get(stadiumSlug)] : [])

  const formatted = finalUrls.map(u => `\n      "${u}",`).join("") + "\n    "
  return prefix + formatted + suffix
})

if (updated !== citySrc) {
  await fs.writeFile(CITIES, updated)
  console.log("Updated cities.ts")
} else {
  console.log("No changes")
}

// Audit
const cityCheckRe = /slug:\s*"([^"]+)"[\s\S]*?images:\s*\[([\s\S]*?)\]/g
let mm
const audit = []
while ((mm = cityCheckRe.exec(updated))) {
  const slug = mm[1]
  const body = mm[2]
  const local = (body.match(/\/images\//g) || []).length
  const remote = (body.match(/https:\/\/upload/g) || []).length
  audit.push({ slug, local, remote })
}
console.log("\nFinal state:")
for (const a of audit) console.log(`  ${a.slug.padEnd(28)} local=${a.local} remote=${a.remote}`)
