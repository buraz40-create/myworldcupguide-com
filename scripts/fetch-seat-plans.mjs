import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "public", "images", "seating")

// Map from our stadium slug to the source filename on 2026worldcupsim.com
// (which mirrors FIFA's official seat plans). Source is FIFA - credit goes to
// FIFA on the rendered page.
const MAP = {
  "metlife-stadium":          "new-york.png",
  "sofi-stadium":             "los-angeles.png",
  "att-stadium":              "dallas.png",
  "levis-stadium":            "san-francisco.png",
  "hard-rock-stadium":        "miami.png",
  "lumen-field":              "seattle-world-cup-seatmap.png",
  "gillette-stadium":         "boston.png",
  "lincoln-financial-field":  "philadelphia.png",
  "arrowhead-stadium":        "kansas-city.png",
  "mercedes-benz-stadium":    "atlanta.png",
  "nrg-stadium":              "houston.png",
  "estadio-azteca":           "mexico-city.png",
  "estadio-akron":            "guadalajara.png",
  "estadio-bbva":             "monterrey.png",
  "bmo-field":                "toronto.png",
  "bc-place":                 "vancouver.png",
}

const BASE = "https://www.2026worldcupsim.com/"
const UA = "MyWorldCupGuide/1.0 (https://myworldcupguide.com)"

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) return "cached"
  const res = await fetch(url, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 1000) throw new Error("file too small (probably empty)")
  await fsp.writeFile(dest, buf)
  return "downloaded"
}

async function main() {
  await fsp.mkdir(OUT_DIR, { recursive: true })
  let ok = 0, fail = 0
  for (const [slug, src] of Object.entries(MAP)) {
    const dest = path.join(OUT_DIR, `${slug}.png`)
    try {
      const status = await download(BASE + src, dest)
      const size = (fs.statSync(dest).size / 1024).toFixed(0)
      console.log(`  ${status}: ${slug}.png (${size} KB)`)
      ok++
    } catch (e) {
      console.error(`  FAILED: ${slug} <- ${src}: ${e.message}`)
      fail++
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  console.log(`\nDone. ${ok} downloaded/cached, ${fail} failed.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
