// Resolve and download a hero image for each base camp via Wikipedia's
// pageimages API. Reads each base camp's `link` field (a Wikipedia URL),
// fetches the page's primary image at 960px, and saves to a deterministic
// path: /images/basecamp-<slug>.jpg.
//
// Then rewrites baseCamps.ts to point each `image` field at the local file.
// `imageUrl` is dropped from the data . derived per-run from the link.
//
// Run: node scripts/fetch-basecamp-images.mjs

import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const PUBLIC_DIR = path.join(ROOT, "public", "images")
const SRC = path.join(ROOT, "src", "data", "baseCamps.ts")
const UA = "MyWorldCupGuide/1.0 (https://myworldcupguide.com; admin@myworldcupguide.com) Node"

function teamSlug(team) {
  return team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

function articleTitleFromUrl(url) {
  // https://en.wikipedia.org/wiki/Q2_Stadium → Q2_Stadium
  const m = url.match(/\/wiki\/([^?#]+)/)
  if (!m) return null
  return decodeURIComponent(m[1])
}

async function fetchOne(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "*/*" },
      redirect: "follow",
    })
    if (res.ok) return res
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 4000 * attempt))
      continue
    }
    throw new Error(`HTTP ${res.status}`)
  }
  throw new Error("retry exhausted")
}

async function pageImageUrl(title) {
  // pageimages prop: returns the main thumbnail at the requested size.
  // pithumbsize=960 keeps consistent with the rest of the site.
  const u = new URL("https://en.wikipedia.org/w/api.php")
  u.searchParams.set("action", "query")
  u.searchParams.set("format", "json")
  u.searchParams.set("titles", title)
  u.searchParams.set("prop", "pageimages")
  u.searchParams.set("piprop", "thumbnail|original")
  u.searchParams.set("pithumbsize", "960")
  u.searchParams.set("redirects", "1")
  const res = await fetchOne(u.toString())
  const j = await res.json()
  const pages = j?.query?.pages ?? {}
  for (const k of Object.keys(pages)) {
    const p = pages[k]
    if (p.thumbnail?.source) return p.thumbnail.source
    if (p.original?.source)  return p.original.source
  }
  return null
}

async function downloadImage(url, dest) {
  const res = await fetchOne(url)
  const buf = Buffer.from(await res.arrayBuffer())
  await fsp.mkdir(path.dirname(dest), { recursive: true })
  await fsp.writeFile(dest, buf)
  return buf.length
}

// Extract { team, link } from baseCamps.ts. Each entry's key is the team name;
// the link line follows shortly after. We parse loosely instead of importing.
function parseEntries(src) {
  const out = []
  const headerRe = /^\s{2}"([^"]+)":\s*\{/gm
  const headers = []
  let h
  while ((h = headerRe.exec(src)) !== null) {
    headers.push({ team: h[1], at: h.index })
  }
  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].at
    const end = i + 1 < headers.length ? headers[i + 1].at : src.length
    const slice = src.slice(start, end)
    const cityMatch   = slice.match(/city:\s*"([^"]+)"/)
    const regionMatch = slice.match(/region:\s*"([^"]+)"/)
    // The data file no longer carries a hand-set Wikipedia link; we derive one
    // from city + region. A small set of teams have city values that need a
    // override (e.g. "New York/New Jersey" . Wikipedia uses "New York City").
    if (cityMatch && regionMatch) {
      const cityOverride = {
        "New York/New Jersey": "New York City",
        "San Francisco Bay Area": "San Francisco",
        "Kansas City": "Kansas City, Missouri", // KS-side equivalent has its own article but Missouri is the iconic one
        "Greenbrier County": "Greenbrier County, West Virginia",
        "Bernards Township": "Bernards Township, New Jersey",
        "Mexico City": "Mexico City",
      }
      const cityForLink = cityOverride[cityMatch[1]] ?? `${cityMatch[1]}, ${regionMatch[1]}`
      const link = `https://en.wikipedia.org/wiki/${encodeURIComponent(cityForLink.replace(/ /g, "_"))}`
      out.push({
        team: headers[i].team,
        link,
        city: cityMatch?.[1],
        region: regionMatch?.[1],
      })
    }
  }
  return out
}

// City-level Wikipedia URL fallback for entries whose facility article has
// no usable main image (e.g. high schools, university soccer complexes).
function cityArticleUrl(city, region) {
  if (!city || !region) return null
  const t = `${city.replace(/ /g, "_")},_${region.replace(/ /g, "_")}`
  return `https://en.wikipedia.org/wiki/${t}`
}

async function main() {
  const src = await fsp.readFile(SRC, "utf8")
  const entries = parseEntries(src)
  console.log(`Found ${entries.length} entries with Wikipedia links\n`)

  const results = []
  for (const { team, link, city, region } of entries) {
    const slug = teamSlug(team)
    const localFilename = `basecamp-${slug}.jpg`
    const dest = path.join(PUBLIC_DIR, localFilename)
    const localPath = `/images/${localFilename}`

    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      console.log(`  cached: ${team} → ${localFilename}`)
      results.push({ team, localPath, status: "cached" })
      continue
    }

    // Try the facility article first, then fall back to the city article.
    const candidates = []
    const facilityTitle = articleTitleFromUrl(link)
    if (facilityTitle) candidates.push({ title: facilityTitle, source: "facility" })
    const cityUrl = cityArticleUrl(city, region)
    const cityTitle = cityUrl ? articleTitleFromUrl(cityUrl) : null
    if (cityTitle && cityTitle !== facilityTitle) candidates.push({ title: cityTitle, source: "city" })

    let downloaded = false
    for (const { title, source } of candidates) {
      try {
        const imgUrl = await pageImageUrl(title)
        if (!imgUrl) {
          console.log(`  no pageimage [${source}]: ${team} (${title})`)
          continue
        }
        const bytes = await downloadImage(imgUrl, dest)
        console.log(`  downloaded [${source}]: ${team} → ${localFilename} (${bytes.toLocaleString()} bytes)`)
        results.push({ team, localPath, status: "ok" })
        downloaded = true
        break
      } catch (e) {
        console.log(`  FAIL [${source}]: ${team} ${title} . ${e.message}`)
      }
      await new Promise(r => setTimeout(r, 600))
    }
    if (!downloaded) {
      results.push({ team, localPath: null, status: "no-image" })
    }
    await new Promise(r => setTimeout(r, 600))
  }

  // Rewrite baseCamps.ts: replace each entry's `image: "..."` with the new path.
  let updated = src
  for (const r of results) {
    if (!r.localPath) continue
    // Match the image line within the team's entry block. We anchor on the team
    // name to avoid mis-matching across entries.
    const teamHeader = `"${r.team}":`
    const idx = updated.indexOf(teamHeader)
    if (idx === -1) continue
    const blockStart = idx
    // Find the closing brace of this entry to bound the replacement
    let depth = 0, blockEnd = -1
    for (let i = blockStart; i < updated.length; i++) {
      const ch = updated[i]
      if (ch === "{") depth++
      else if (ch === "}") {
        depth--
        if (depth === 0) { blockEnd = i; break }
      }
    }
    if (blockEnd === -1) continue
    const block = updated.slice(blockStart, blockEnd + 1)
    const newBlock = block.replace(/image:\s*"[^"]*"/, `image: "${r.localPath}"`)
    updated = updated.slice(0, blockStart) + newBlock + updated.slice(blockEnd + 1)
  }
  if (updated !== src) {
    await fsp.writeFile(SRC, updated)
    console.log(`\nRewrote ${path.basename(SRC)} with new image paths`)
  }

  const ok = results.filter(r => r.status === "ok").length
  const cached = results.filter(r => r.status === "cached").length
  const fail = results.filter(r => r.status === "fail" || r.status === "no-image" || r.status === "skip").length
  console.log(`\n${ok} downloaded, ${cached} cached, ${fail} failed`)
  if (fail > 0) {
    console.log("\nFailures:")
    for (const r of results.filter(r => r.status !== "ok" && r.status !== "cached")) {
      console.log(`  ${r.team}: ${r.status} ${r.err ?? ""}`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
