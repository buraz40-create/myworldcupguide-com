// Searches YouTube Data API v3 for highlight videos of finished matches and
// stores the top result (by view count, last 7 days) into src/data/matchResults.json.
//
// Requires env var YOUTUBE_API_KEY (Google Cloud Console > YouTube Data API v3).
//
// Usage:
//   YOUTUBE_API_KEY=... node scripts/fetch-highlights.mjs
//   YOUTUBE_API_KEY=... node scripts/fetch-highlights.mjs --refetch  # refetch even if already stored
//
// Strategy:
//   1. Read matchResults.json. For each finished match with no videoId (or with
//      --refetch), build a query "{home} vs {away} highlights world cup 2026".
//   2. search.list with type=video, videoEmbeddable=true, order=viewCount,
//      publishedAfter = match date 00:00Z.
//   3. videos.list with id=... part=statistics to get viewCount, pick top.
//   4. Persist {videoId, videoTitle, videoChannel, videoFetchedAt}.
//
// Cost: ~100 quota units per match (search=100, videos=1). 10k/day free quota
// fits ~100 matches/day, well above the 4-match peak group-stage day.

import fs from "node:fs"

const RESULTS_PATH = "src/data/matchResults.json"
const MATCHES_PATH = "src/data/matches.ts"
const API_KEY = process.env.YOUTUBE_API_KEY
const REFETCH = process.argv.includes("--refetch")

if (!API_KEY) {
  console.error("YOUTUBE_API_KEY env var not set")
  process.exit(1)
}

function loadMatches() {
  const src = fs.readFileSync(MATCHES_PATH, "utf8")
  const re = /\{\s*id:\s*"([^"]+)",[^}]*?date:\s*"([^"]+)",[^}]*?homeTeam:\s*"([^"]+)",\s*awayTeam:\s*"([^"]+)"/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) {
    out.push({ id: m[1], date: m[2], homeTeam: m[3], awayTeam: m[4] })
  }
  return out
}

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) return {}
  return JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8"))
}

function saveResults(r) {
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(r, null, 2) + "\n")
}

async function ytSearch(q, publishedAfterIso) {
  const params = new URLSearchParams({
    part: "snippet",
    q,
    type: "video",
    videoEmbeddable: "true",
    order: "viewCount",
    maxResults: "5",
    publishedAfter: publishedAfterIso,
    key: API_KEY,
  })
  const url = `https://www.googleapis.com/youtube/v3/search?${params}`
  const res = await fetch(url)
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`YT search HTTP ${res.status}: ${t.slice(0, 200)}`)
  }
  const json = await res.json()
  return json.items ?? []
}

async function ytStats(videoIds) {
  if (!videoIds.length) return {}
  const params = new URLSearchParams({
    part: "statistics,contentDetails",
    id: videoIds.join(","),
    key: API_KEY,
  })
  const url = `https://www.googleapis.com/youtube/v3/videos?${params}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`YT videos HTTP ${res.status}`)
  }
  const json = await res.json()
  const m = {}
  for (const v of json.items ?? []) {
    m[v.id] = {
      views: parseInt(v.statistics?.viewCount ?? "0", 10),
      duration: v.contentDetails?.duration,
    }
  }
  return m
}

function parseIsoDuration(d) {
  // PT#M#S -> seconds. Highlights typically 8-15 min, skip Shorts (<60s) and full matches (>30min)
  if (!d) return 0
  const mm = d.match(/PT(?:(\d+)M)?(?:(\d+)S)?/)
  if (!mm) return 0
  return (parseInt(mm[1] ?? "0", 10) * 60) + parseInt(mm[2] ?? "0", 10)
}

function looksLikeHighlight(item, stats) {
  const dur = parseIsoDuration(stats?.duration)
  if (dur > 0 && dur < 90) return false           // Shorts
  if (dur > 60 * 35) return false                  // Full match replay
  const title = (item.snippet?.title ?? "").toLowerCase()
  if (title.includes("preview") || title.includes("prediction")) return false
  if (title.includes("reaction")) return false
  return true
}

async function pickBestVideo(home, away, dateIso) {
  // Query variants in order . accept first one that yields a usable result.
  const queries = [
    `${home} vs ${away} highlights world cup 2026`,
    `${home} ${away} highlights world cup`,
    `${home} vs ${away} extended highlights`,
  ]
  const publishedAfter = `${dateIso}T00:00:00Z`
  for (const q of queries) {
    let items
    try {
      items = await ytSearch(q, publishedAfter)
    } catch (e) {
      console.warn(`  search failed (${q}): ${e.message}`)
      continue
    }
    if (!items.length) continue
    const ids = items.map((i) => i.id?.videoId).filter(Boolean)
    const stats = await ytStats(ids)
    const candidates = items
      .filter((i) => i.id?.videoId && looksLikeHighlight(i, stats[i.id.videoId]))
      .map((i) => ({ item: i, views: stats[i.id.videoId]?.views ?? 0 }))
      .sort((a, b) => b.views - a.views)
    if (candidates.length) {
      const c = candidates[0]
      return {
        videoId: c.item.id.videoId,
        videoTitle: c.item.snippet.title,
        videoChannel: c.item.snippet.channelTitle,
        views: c.views,
      }
    }
  }
  return null
}

async function main() {
  const matches = loadMatches()
  const results = loadResults()
  let fetched = 0
  let skipped = 0
  for (const m of matches) {
    const r = results[m.id]
    if (!r) { skipped++; continue }                     // not finished yet
    if (r.status !== "FT" && r.status !== "AET" && r.status !== "PEN") { skipped++; continue }
    if (r.videoId && !REFETCH) { skipped++; continue }  // already have one
    console.log(`searching highlights for ${m.id}: ${m.homeTeam} vs ${m.awayTeam} (${m.date})`)
    const pick = await pickBestVideo(m.homeTeam, m.awayTeam, m.date)
    if (!pick) {
      console.log(`  no suitable video found`)
      continue
    }
    results[m.id] = {
      ...r,
      videoId: pick.videoId,
      videoTitle: pick.videoTitle,
      videoChannel: pick.videoChannel,
      videoFetchedAt: new Date().toISOString(),
    }
    fetched++
    console.log(`  picked ${pick.videoId} (${pick.views.toLocaleString()} views) "${pick.videoTitle}"`)
  }
  saveResults(results)
  console.log(`fetched ${fetched} highlight videos (${skipped} skipped)`)
}

main().catch((e) => { console.error(e); process.exit(1) })
