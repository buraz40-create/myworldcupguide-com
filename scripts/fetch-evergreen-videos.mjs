// One-shot fetcher for evergreen video content: stadium walkthroughs, city
// visitor guides, team intros. Writes a single src/data/contentVideos.json.
//
// Usage:
//   YOUTUBE_API_KEY=... node scripts/fetch-evergreen-videos.mjs            # fetch missing only
//   YOUTUBE_API_KEY=... node scripts/fetch-evergreen-videos.mjs --refetch  # refetch all
//   YOUTUBE_API_KEY=... node scripts/fetch-evergreen-videos.mjs --kind=stadiums  # restrict
//
// Cost: 101 quota units per item. Default 16 stadiums + 16 cities + 48 teams
// = 80 items ~= 8k units; daily quota is 10k.

import fs from "node:fs"

const OUT_PATH = "src/data/contentVideos.json"
const API_KEY = process.env.YOUTUBE_API_KEY
const ARGS = process.argv.slice(2)
const REFETCH = ARGS.includes("--refetch")
const KIND_ARG = ARGS.find((a) => a.startsWith("--kind="))?.split("=")[1]

if (!API_KEY) {
  console.error("YOUTUBE_API_KEY env var not set")
  process.exit(1)
}

function parseTsArray(filePath) {
  // Pulls {name, slug} for every top-level entry. Tolerates either field order
  // (teams.ts has name first; cities/stadiums.ts have slug first).
  const src = fs.readFileSync(filePath, "utf8")
  const out = []
  // Pattern A: slug then name (within 200 chars)
  const reA = /slug:\s*"([^"]+)"[\s\S]{0,200}?name:\s*"([^"]+)"/g
  let m
  while ((m = reA.exec(src)) !== null) out.push({ slug: m[1], name: m[2] })
  // Pattern B: name then slug
  const reB = /name:\s*"([^"]+)"[\s\S]{0,200}?slug:\s*"([^"]+)"/g
  while ((m = reB.exec(src)) !== null) out.push({ slug: m[2], name: m[1] })
  // Dedupe by slug, prefer the first occurrence.
  const seen = new Set()
  return out.filter((x) => seen.has(x.slug) ? false : (seen.add(x.slug), true))
}

async function ytSearch(query) {
  const params = new URLSearchParams({
    part: "snippet", q: query, type: "video", videoEmbeddable: "true",
    order: "viewCount", maxResults: "10", key: API_KEY,
  })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
  if (!res.ok) throw new Error(`YT search HTTP ${res.status}`)
  const j = await res.json()
  return j.items ?? []
}

async function ytStats(videoIds) {
  if (!videoIds.length) return {}
  const params = new URLSearchParams({
    part: "statistics,contentDetails",
    id: videoIds.join(","), key: API_KEY,
  })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
  if (!res.ok) throw new Error(`YT stats HTTP ${res.status}`)
  const j = await res.json()
  const map = {}
  for (const v of j.items ?? []) {
    map[v.id] = {
      views: parseInt(v.statistics?.viewCount ?? "0", 10),
      duration: v.contentDetails?.duration,
    }
  }
  return map
}

function parseIsoDuration(d) {
  if (!d) return 0
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] ?? "0", 10) * 3600) + (parseInt(m[2] ?? "0", 10) * 60) + parseInt(m[3] ?? "0", 10)
}

function looksUsable(item, stats, { minDuration, maxDuration, mustInclude, mustNotInclude }) {
  const dur = parseIsoDuration(stats?.duration)
  if (dur > 0 && dur < minDuration) return false
  if (maxDuration && dur > maxDuration) return false
  const title = (item.snippet?.title ?? "").toLowerCase()
  const desc = (item.snippet?.description ?? "").toLowerCase()
  if (title.includes("shorts")) return false
  // Topic relevance: at least one of the mustInclude terms must appear in
  // the title (a video about "Chicago" can outrank a real Houston guide on
  // generic search, so we reject anything that doesn't mention our entity).
  if (mustInclude?.length) {
    const hit = mustInclude.some((t) => title.includes(t.toLowerCase()) || desc.includes(t.toLowerCase()))
    if (!hit) return false
  }
  // Negative filter: drop concerts / band tours / unrelated events that
  // happened to be filmed at a stadium.
  if (mustNotInclude?.length) {
    const bad = mustNotInclude.some((t) => title.includes(t.toLowerCase()))
    if (bad) return false
  }
  return true
}

async function pickBest(queries, opts) {
  const { minDuration = 90, maxDuration = 60 * 45, mustInclude, mustNotInclude } = opts ?? {}
  for (const q of queries) {
    let items
    try {
      items = await ytSearch(q)
    } catch (e) {
      console.warn(`    search failed (${q.slice(0, 40)}): ${e.message}`)
      continue
    }
    if (!items.length) continue
    const ids = items.map((i) => i.id?.videoId).filter(Boolean)
    const stats = await ytStats(ids)
    const candidates = items
      .filter((i) => i.id?.videoId && looksUsable(i, stats[i.id.videoId], { minDuration, maxDuration, mustInclude, mustNotInclude }))
      .map((i) => ({ item: i, views: stats[i.id.videoId]?.views ?? 0 }))
      .sort((a, b) => b.views - a.views)
    if (candidates.length) {
      const c = candidates[0]
      return {
        videoId: c.item.id.videoId,
        title: c.item.snippet.title,
        channel: c.item.snippet.channelTitle,
        views: c.views,
      }
    }
  }
  return null
}

// Stop-words that signal "this isn't what we asked for" (concerts, music
// tours at stadiums, marketing-style WC anthem videos).
const STADIUM_NEG = ["concert", "music", "tour 20", "world tour", "anthem", "song", "performance"]
const CITY_NEG = ["song", "music video", "lyrics"]
// Cricket frequently outranks football on shared team names (USA, Australia,
// England, NZ, SA, Netherlands all have men's T20 World Cup 2026 highlights).
const TEAM_NEG = [
  "song", "anthem", "music video",
  "t20", "icc", "cricket", "wicket", "innings", "batting", "rugby",
  "u-17", "u17", "u-20", "u20", "u-23", "futsal",
  "shock you", "things that",
]

const QUERIES = {
  stadiums: (name) => [
    `${name} stadium tour walkthrough`,
    `inside ${name} stadium`,
    `${name} stadium guide`,
    `tour of ${name}`,
  ],
  cities: (name) => [
    `${name} travel guide`,
    `things to do in ${name}`,
    `visit ${name} guide`,
  ],
  teams: (name) => [
    `${name} football World Cup 2026 preview`,
    `${name} national football team 2026 squad`,
    `${name} soccer World Cup qualifier 2026 highlights`,
  ],
}

// Each item gets its own mustInclude (entity name) and mustNotInclude (noise).
function mustInclude(name) {
  // Variants to tolerate broadcaster phrasing.
  const variants = [name]
  if (name === "United States") variants.push("USA", "USMNT")
  if (name === "South Korea") variants.push("Korea")
  if (name === "Ivory Coast") variants.push("Côte d'Ivoire")
  if (name === "Czech Republic") variants.push("Czechia")
  if (name === "Türkiye" || name === "Turkey") variants.push("Turkey", "Türkiye")
  return variants
}

const KIND_CONFIG = {
  stadiums: { file: "src/data/stadiums.ts", minDuration: 90, maxDuration: 60 * 45, negative: STADIUM_NEG },
  cities: { file: "src/data/cities.ts", minDuration: 180, maxDuration: 60 * 60, negative: CITY_NEG },
  teams: { file: "src/data/teams.ts", minDuration: 90, maxDuration: 60 * 30, negative: TEAM_NEG },
}

async function main() {
  const data = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"))
  const kinds = KIND_ARG ? [KIND_ARG] : ["stadiums", "cities", "teams"]
  for (const kind of kinds) {
    const cfg = KIND_CONFIG[kind]
    if (!cfg) { console.warn(`unknown kind: ${kind}`); continue }
    const items = parseTsArray(cfg.file)
    console.log(`${kind}: ${items.length} items`)
    data[kind] ??= {}
    let fetched = 0, skipped = 0
    for (const it of items) {
      if (data[kind][it.slug] && !REFETCH) { skipped++; continue }
      const queries = QUERIES[kind](it.name)
      console.log(`  ${kind}/${it.slug}: searching "${queries[0]}"`)
      const pick = await pickBest(queries, {
        ...cfg,
        mustInclude: mustInclude(it.name),
        mustNotInclude: cfg.negative,
      })
      if (!pick) { console.log(`    nothing usable`); continue }
      data[kind][it.slug] = {
        videoId: pick.videoId,
        title: pick.title,
        channel: pick.channel,
        fetchedAt: new Date().toISOString(),
      }
      fetched++
      console.log(`    picked ${pick.videoId} (${pick.views.toLocaleString()} views) "${pick.title.slice(0, 60)}"`)
    }
    console.log(`${kind}: fetched ${fetched}, skipped ${skipped}`)
  }
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + "\n")
  console.log(`wrote ${OUT_PATH}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
