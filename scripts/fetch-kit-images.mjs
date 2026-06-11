// Downloads kit images from Daily Mail's CDN once, stores in public/images/kits/.
// 48 teams × 2 kits × 2 views = 192 images total, ~50MB.
//
// URL pattern:
//   https://www.dailymail.com/i/html_modules/WorldCup/kit_ranking_2026/Kit_Pics/
//     {Home|Away}/{Front|Back}/{Front|Back}%20{Team}%20{Home|Away}.jpg
//
// Run: node scripts/fetch-kit-images.mjs
//
// Polite: 800ms delay between requests, gives up on 404s without retrying.
// Saves to public/images/kits/<slug>-<home|away>-<front|back>.jpg

import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "public", "images", "kits")
const SRC = path.join(ROOT, "src", "data", "kits.ts")
const UA = "MyWorldCupGuide/1.0 (https://myworldcupguide.com; admin@myworldcupguide.com) Node"

const BASE = "https://www.dailymail.com/i/html_modules/WorldCup/kit_ranking_2026/Kit_Pics"

function teamSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

// Returns the list of candidate URLs to try for a single kit image.
// Daily Mail's CDN is wildly inconsistent: some images are .jpg, some .png,
// some .webp, and a handful (e.g. Paraguay) have a stray trailing space before
// the extension. The downloaded bytes always go to a .jpg file locally and
// browsers content-sniff them correctly regardless of the original format.
function candidateUrls(dailyMailName, side, view) {
  const encName = encodeURIComponent(dailyMailName)
  const prefix  = `${BASE}/${side}/${view}`
  const stems = [
    `${view}%20${encName}%20${side}`,        // "Front Argentina Home"
    `${view}%20${encName}%20${side}%20`,     // "Front Paraguay Home " (trailing space)
  ]
  const exts = [".jpg", ".png", ".webp", ".jpeg"]
  const urls = []
  for (const stem of stems) for (const ext of exts) urls.push(`${prefix}/${stem}${ext}`)
  return urls
}

async function fetchOne(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*" },
    redirect: "follow",
  })
  if (res.ok) return Buffer.from(await res.arrayBuffer())
  const err = new Error(`HTTP ${res.status}`)
  err.status = res.status
  throw err
}

// Parse kits.ts to get { team, dailyMailName } pairs. Same loose-parse style as
// scripts/fetch-basecamp-images.mjs.
function parseKits(src) {
  const out = []
  const re = /\{\s*team:\s*"([^"]+)",\s*dailyMailName:\s*"([^"]+)"/g
  let m
  while ((m = re.exec(src)) !== null) {
    out.push({ team: m[1], dailyMailName: m[2] })
  }
  return out
}

async function main() {
  await fsp.mkdir(OUT_DIR, { recursive: true })
  const src = await fsp.readFile(SRC, "utf8")
  const entries = parseKits(src)
  console.log(`${entries.length} teams parsed; downloading 4 images each (${entries.length * 4} total)\n`)

  let ok = 0, cached = 0, fail = 0
  const failures = []
  for (const { team, dailyMailName } of entries) {
    const slug = teamSlug(team)
    for (const side of ["Home", "Away"]) {
      for (const view of ["Front", "Back"]) {
        const localName = `${slug}-${side.toLowerCase()}-${view.toLowerCase()}.jpg`
        const dest = path.join(OUT_DIR, localName)
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
          cached++
          continue
        }
        const urls = candidateUrls(dailyMailName, side, view)
        let downloaded = false
        let lastErr = ""
        for (const url of urls) {
          try {
            const buf = await fetchOne(url)
            await fsp.writeFile(dest, buf)
            const ext = url.split(".").pop()
            console.log(`  ${team} ${side}/${view} → .${ext} (${buf.length.toLocaleString()} bytes)`)
            ok++
            downloaded = true
            break
          } catch (e) {
            lastErr = e.message
            if (e.status !== 404) {
              // Non-404 errors stop the candidate loop (rate-limit, network, etc.)
              break
            }
            // 404: try next candidate
            await new Promise((r) => setTimeout(r, 200))
          }
        }
        if (!downloaded) {
          console.log(`  FAIL ${team} ${side}/${view}: ${lastErr} (tried ${urls.length} URL variants)`)
          failures.push({ team, side, view, url: urls[0], err: lastErr })
          fail++
        }
        await new Promise((r) => setTimeout(r, 800))
      }
    }
  }

  console.log(`\n${ok} downloaded, ${cached} cached, ${fail} failed`)
  if (failures.length) {
    console.log("\nFailures (probable name-mismatch with Daily Mail's filename convention):")
    for (const f of failures) console.log(`  ${f.team} ${f.side}/${f.view}\n    ${f.url}`)
    console.log("\nIf many fail for the same team, update its `dailyMailName` in src/data/kits.ts to match Daily Mail's exact spelling.")
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
