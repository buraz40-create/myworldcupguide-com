// Fetches a YouTube "preview" video for any WC match scheduled in the next
// ~36 hours that doesn't yet have a final score. Stores result alongside FT
// data in src/data/matchResults.json so the match page can switch between
// preview (before kickoff) and FT highlight (after FT) automatically.
//
// Usage:
//   YOUTUBE_API_KEY=... node scripts/fetch-match-previews.mjs
//   YOUTUBE_API_KEY=... node scripts/fetch-match-previews.mjs --refetch
//
// Each match costs ~101 YT quota units.

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
  const re = /\{\s*id:\s*"([^"]+)",\s*matchNumber:\s*(\d+),[^}]*?date:\s*"([^"]+)",\s*time:\s*"([^"]+)",[^}]*?homeTeam:\s*"([^"]+)",\s*awayTeam:\s*"([^"]+)"/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1], matchNumber: parseInt(m[2], 10), date: m[3],
      time: m[4], homeTeam: m[5], awayTeam: m[6],
    })
  }
  return out
}

function matchEpoch(m) {
  return new Date(`${m.date}T${m.time}:00Z`).getTime()
}

async function ytSearch(q) {
  const params = new URLSearchParams({
    part: "snippet", q, type: "video", videoEmbeddable: "true",
    order: "viewCount", maxResults: "5", key: API_KEY,
  })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
  if (!res.ok) throw new Error(`YT search HTTP ${res.status}`)
  const j = await res.json()
  return j.items ?? []
}

async function ytStats(ids) {
  if (!ids.length) return {}
  const params = new URLSearchParams({
    part: "statistics,contentDetails", id: ids.join(","), key: API_KEY,
  })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
  if (!res.ok) throw new Error(`YT videos HTTP ${res.status}`)
  const j = await res.json()
  const map = {}
  for (const v of j.items ?? []) {
    map[v.id] = { views: parseInt(v.statistics?.viewCount ?? "0", 10), duration: v.contentDetails?.duration }
  }
  return map
}

function parseIsoDuration(d) {
  if (!d) return 0
  const m = d.match(/PT(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] ?? "0", 10) * 60) + parseInt(m[2] ?? "0", 10)
}

function looksUsable(item, stats) {
  const dur = parseIsoDuration(stats?.duration)
  if (dur > 0 && dur < 60) return false        // Shorts
  if (dur > 60 * 30) return false               // Probably a full-match upload
  const t = (item.snippet?.title ?? "").toLowerCase()
  // Drop obviously-already-finished result uploads (we want PREview, not recap).
  if (t.includes("full-time") || t.includes("full time") || t.includes("highlight") || t.includes("result")) return false
  return true
}

async function pickPreview(home, away) {
  const queries = [
    `${home} vs ${away} preview World Cup 2026`,
    `${home} ${away} preview 2026`,
    `${home} vs ${away} prediction`,
  ]
  for (const q of queries) {
    let items
    try { items = await ytSearch(q) } catch (e) {
      console.warn(`  search failed (${q.slice(0, 40)}): ${e.message}`)
      continue
    }
    if (!items.length) continue
    const ids = items.map((i) => i.id?.videoId).filter(Boolean)
    const stats = await ytStats(ids)
    const cands = items
      .filter((i) => i.id?.videoId && looksUsable(i, stats[i.id.videoId]))
      .map((i) => ({ item: i, views: stats[i.id.videoId]?.views ?? 0 }))
      .sort((a, b) => b.views - a.views)
    if (cands.length) {
      const c = cands[0]
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

async function main() {
  const matches = loadMatches()
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8"))
  const now = Date.now()
  const horizonMs = 36 * 3600 * 1000
  let fetched = 0
  for (const m of matches) {
    if (m.homeTeam === "TBD" || m.awayTeam === "TBD") continue
    const r = results[m.id] ?? {}
    if (r.status === "FT" || r.status === "AET" || r.status === "PEN") continue
    const epoch = matchEpoch(m)
    if (epoch - now > horizonMs) continue          // not soon enough
    if (epoch < now - 6 * 3600 * 1000) continue     // already long over and unrecorded
    if (r.previewVideoId && !REFETCH) continue
    console.log(`preview: ${m.homeTeam} vs ${m.awayTeam} (${m.date} ${m.time})`)
    const pick = await pickPreview(m.homeTeam, m.awayTeam)
    if (!pick) { console.log(`  nothing usable`); continue }
    results[m.id] = {
      ...r,
      previewVideoId: pick.videoId,
      previewVideoTitle: pick.title,
      previewVideoChannel: pick.channel,
      previewFetchedAt: new Date().toISOString(),
    }
    fetched++
    console.log(`  picked ${pick.videoId} (${pick.views.toLocaleString()} views) "${pick.title.slice(0, 60)}"`)
  }
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2) + "\n")
  console.log(`fetched ${fetched} previews`)
}

main().catch((e) => { console.error(e); process.exit(1) })
