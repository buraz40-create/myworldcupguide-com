import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "public", "images")
const DATA_FILES = [
  path.join(ROOT, "src", "data", "cities.ts"),
  path.join(ROOT, "src", "data", "stadiums.ts"),
]

const URL_RE = /https:\/\/upload\.wikimedia\.org\/[^"\s]+/g
const UA = "MyWorldCupGuide/1.0 (https://myworldcupguide.com; admin@myworldcupguide.com) Node"

function safeName(url) {
  const last = url.split("/").pop() ?? "image"
  const decoded = decodeURIComponent(last)
  return decoded.replace(/[^a-zA-Z0-9._-]+/g, "_")
}

// Derive the canonical Special:FilePath URL from a thumb URL
// e.g. .../thumb/0/04/Metlife_stadium_%28Aerial_view%29.jpg/960px-Metlife_stadium_%28Aerial_view%29.jpg
//   -> https://commons.wikimedia.org/wiki/Special:FilePath/Metlife_stadium_(Aerial_view).jpg?width=960
function specialFilePath(thumbUrl) {
  const m = thumbUrl.match(/\/thumb\/[^/]+\/[^/]+\/([^/]+)\/(\d+)px-/)
  if (!m) return null
  const filename = decodeURIComponent(m[1])
  const width = m[2]
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`
}

async function fetchOne(url) {
  let lastErr
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*" },
      redirect: "follow",
    })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    lastErr = new Error(`HTTP ${res.status}`)
    if (res.status === 404) throw lastErr
    if (res.status === 429) {
      const wait = 4000 * attempt
      console.log(`    rate-limited; waiting ${wait}ms before retry ${attempt}`)
      await new Promise(r => setTimeout(r, wait))
      continue
    }
    throw lastErr
  }
  throw lastErr
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return "cached"
  // Try the original thumb URL first; if 404, fall back to Special:FilePath
  let buf
  try {
    buf = await fetchOne(url)
  } catch (e) {
    if (e.message !== "HTTP 404") throw e
    const fallback = specialFilePath(url)
    if (!fallback) throw e
    console.log(`    thumb 404; trying Special:FilePath`)
    buf = await fetchOne(fallback)
  }
  await fsp.writeFile(dest, buf)
  return "downloaded"
}

async function main() {
  await fsp.mkdir(OUT_DIR, { recursive: true })

  const urls = new Set()
  const contents = {}
  for (const f of DATA_FILES) {
    const c = await fsp.readFile(f, "utf8")
    contents[f] = c
    for (const m of c.matchAll(URL_RE)) urls.add(m[0])
  }
  console.log(`Found ${urls.size} unique URLs across ${DATA_FILES.length} files`)

  const map = {}
  let ok = 0, fail = 0
  for (const url of urls) {
    const filename = safeName(url)
    const dest = path.join(OUT_DIR, filename)
    try {
      const status = await download(url, dest)
      map[url] = `/images/${filename}`
      console.log(`  ${status}: ${filename}`)
      ok++
    } catch (e) {
      console.error(`  FAILED: ${url}\n    ${e.message}`)
      fail++
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  for (const [f, content] of Object.entries(contents)) {
    let updated = content
    for (const [url, local] of Object.entries(map)) {
      updated = updated.split(url).join(local)
    }
    if (updated !== content) {
      await fsp.writeFile(f, updated)
      console.log(`Updated ${path.basename(f)}`)
    }
  }

  console.log(`\nDone. ${ok} downloaded/cached, ${fail} failed.`)
}

main().catch(e => { console.error(e); process.exit(1) })
