// Generates a daily World Cup matchday recap blog post from matchResults.json
// (finished matches) + matches.ts (fixture metadata), inserts at the top of
// src/data/blogPosts.ts. Idempotent on slug.
//
// Usage:
//   node scripts/generate-matchday-recap.mjs              # yesterday
//   node scripts/generate-matchday-recap.mjs 2026-06-11   # specific date
//
// The post body links each match line to its match page, which already shows
// the highlight embed via MatchHighlightEmbed when the bot has linked one.

import fs from "node:fs"

const ARGS = process.argv.slice(2)
const FORCE = ARGS.includes("--force")
const TODAY = ARGS.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? yesterdayISO()
const RESULTS_PATH = "src/data/matchResults.json"
const MATCHES_PATH = "src/data/matches.ts"

function yesterdayISO() {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

function formatLong(d) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function loadMatches() {
  const src = fs.readFileSync(MATCHES_PATH, "utf8")
  const re = /\{\s*id:\s*"([^"]+)",\s*matchNumber:\s*(\d+),\s*round:\s*"([^"]+)",[^}]*?(?:group:\s*"([^"]+)",[^}]*?)?date:\s*"([^"]+)",\s*time:\s*"([^"]+)",[^}]*?homeTeam:\s*"([^"]+)",\s*awayTeam:\s*"([^"]+)"/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1], matchNumber: parseInt(m[2], 10), round: m[3],
      group: m[4] ?? undefined, date: m[5], time: m[6],
      homeTeam: m[7], awayTeam: m[8],
    })
  }
  return out
}

// Matches the slugForMatch() function in src/data/matches.ts:
//   "{home}-vs-{away}-{matchNumber}"
function matchSlug(m) {
  return `${slugify(m.homeTeam)}-vs-${slugify(m.awayTeam)}-${m.matchNumber}`
}

function nextDayIso(date) {
  const d = new Date(date + "T12:00:00Z")
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function buildPost(date, played, nextDayMatches) {
  const long = formatLong(date)
  const slug = `world-cup-2026-recap-${date}`
  const totalGoals = played.reduce((s, p) => s + p.r.homeScore + p.r.awayScore, 0)
  const videosCount = played.filter(({ r }) => r.videoId).length
  const intro =
    `${played.length} match${played.length === 1 ? "" : "es"} from the 2026 FIFA World Cup ${played.length === 1 ? "was" : "were"} played on ${long}, with ${totalGoals} total goal${totalGoals === 1 ? "" : "s"} scored.` +
    (videosCount > 0 ? ` ${videosCount === played.length ? "Highlights" : `${videosCount} highlight video${videosCount === 1 ? "" : "s"}`} embedded below.` : "")
  const body = [{ type: "p", text: intro }]
  if (played.length) {
    body.push({
      type: "table",
      caption: `All World Cup 2026 results from ${long}.`,
      headers: ["Match", "Score", "Round"],
      rows: played.map(({ m, r }) => {
        const score = r.status === "PEN" && r.penaltyHome != null
          ? `${r.homeScore}-${r.awayScore} (${r.penaltyHome}-${r.penaltyAway} pens)`
          : `${r.homeScore}-${r.awayScore}${r.status === "AET" ? " (AET)" : ""}`
        return [
          `[${m.homeTeam} vs ${m.awayTeam}](/matches/${matchSlug(m)}/)`,
          score,
          m.group ? `Group ${m.group}` : m.round,
        ]
      }),
    })
  }
  const biggest = [...played].sort(
    (a, b) => Math.abs(b.r.homeScore - b.r.awayScore) - Math.abs(a.r.homeScore - a.r.awayScore)
  )[0]
  if (biggest && biggest.r.homeScore !== biggest.r.awayScore) {
    const margin = Math.abs(biggest.r.homeScore - biggest.r.awayScore)
    const winner = biggest.r.homeScore > biggest.r.awayScore ? biggest.m.homeTeam : biggest.m.awayTeam
    const loser = biggest.r.homeScore > biggest.r.awayScore ? biggest.m.awayTeam : biggest.m.homeTeam
    body.push({ type: "h2", text: "Standout result" })
    body.push({
      type: "p",
      text: `${biggest.m.homeTeam} ${biggest.r.homeScore}-${biggest.r.awayScore} ${biggest.m.awayTeam} was the day's biggest margin, a ${margin}-goal win for ${winner} over ${loser}. See the [full match report](/matches/${matchSlug(biggest.m)}/).`,
    })
  }
  // Highlight videos . one block per finished match with a stored videoId.
  const withVideo = played.filter(({ r }) => r.videoId)
  if (withVideo.length) {
    body.push({ type: "h2", text: "Highlights" })
    for (const { m, r } of withVideo) {
      body.push({
        type: "p",
        text: `${m.homeTeam} ${r.homeScore}-${r.awayScore} ${m.awayTeam} . [match page](/matches/${matchSlug(m)}/).`,
      })
      body.push({
        type: "video",
        videoId: r.videoId,
        title: r.videoTitle ?? `${m.homeTeam} vs ${m.awayTeam} highlights`,
        channel: r.videoChannel,
      })
    }
  }
  // Tomorrow . list the actual fixtures if any are scheduled for the next day.
  if (nextDayMatches.length) {
    const nextLong = formatLong(nextDayMatches[0].date)
    body.push({ type: "h2", text: `Next up . ${nextLong}` })
    body.push({
      type: "ul",
      items: nextDayMatches.map((m) =>
        `[${m.homeTeam} vs ${m.awayTeam}](/matches/${matchSlug(m)}/) . ${m.group ? `Group ${m.group}` : m.round} . ${m.time} local`
      ),
    })
  }
  body.push({
    type: "p",
    text: `Browse the [full World Cup 2026 schedule](/schedule/) or use the [predictor bracket](/predictor/) to lock in your knockout picks.`,
  })
  return {
    slug,
    title: `World Cup 2026 Recap: ${long}`,
    description: `Results from every World Cup 2026 match on ${long}: ${played.length} match${played.length === 1 ? "" : "es"}, ${totalGoals} goals${videosCount ? `, ${videosCount} highlight video${videosCount === 1 ? "" : "s"} embedded` : ""}.`,
    date,
    author: "My World Cup Guide editorial",
    authorBio: "We track FIFA's official schedule, results and visitor info for the 2026 World Cup across the USA, Canada, and Mexico.",
    category: "Results",
    tags: ["recap", "results", "world cup 2026", date],
    readMinutes: 3,
    body,
  }
}

function serializeBlock(b) {
  if (b.type === "p" || b.type === "h2" || b.type === "h3") {
    return `      { type: "${b.type}", text: ${JSON.stringify(b.text)} },`
  }
  if (b.type === "ul" || b.type === "ol") {
    const items = b.items.map((it) => `        ${JSON.stringify(it)},`).join("\n")
    return [
      `      {`,
      `        type: "${b.type}",`,
      `        items: [`,
      items,
      `        ],`,
      `      },`,
    ].join("\n")
  }
  if (b.type === "table") {
    const headers = JSON.stringify(b.headers)
    const rows = b.rows.map((r) => `          ${JSON.stringify(r)},`).join("\n")
    return [
      `      {`,
      `        type: "table",`,
      `        caption: ${JSON.stringify(b.caption ?? "")},`,
      `        headers: ${headers},`,
      `        rows: [`,
      rows,
      `        ],`,
      `      },`,
    ].join("\n")
  }
  if (b.type === "video") {
    return [
      `      {`,
      `        type: "video",`,
      `        videoId: ${JSON.stringify(b.videoId)},`,
      `        title: ${JSON.stringify(b.title ?? "")},`,
      `        channel: ${JSON.stringify(b.channel ?? "")},`,
      `      },`,
    ].join("\n")
  }
  throw new Error(`unsupported block type ${b.type}`)
}

function serializePost(post) {
  return [
    `  {`,
    `    slug: ${JSON.stringify(post.slug)},`,
    `    title: ${JSON.stringify(post.title)},`,
    `    description: ${JSON.stringify(post.description)},`,
    `    date: ${JSON.stringify(post.date)},`,
    `    author: ${JSON.stringify(post.author)},`,
    `    authorBio: ${JSON.stringify(post.authorBio)},`,
    `    category: ${JSON.stringify(post.category)},`,
    `    tags: ${JSON.stringify(post.tags)},`,
    `    readMinutes: ${post.readMinutes},`,
    `    body: [`,
    post.body.map(serializeBlock).join("\n"),
    `    ],`,
    `  },`,
  ].join("\n")
}

function removeExistingPost(slug) {
  const path = "src/data/blogPosts.ts"
  const src = fs.readFileSync(path, "utf8")
  // Find the exact "{ slug: "X" ... }," entry and excise it. Each post entry
  // is delimited at 2-space indent and ends with "  }," . match minimally.
  const startMarker = `    slug: "${slug}",`
  const start = src.indexOf(startMarker)
  if (start === -1) return false
  const objStart = src.lastIndexOf("  {", start)
  const objEnd = src.indexOf("\n  },", start)
  if (objStart === -1 || objEnd === -1) return false
  const out = src.slice(0, objStart) + src.slice(objEnd + 6) // "\n  },\n" = 6 chars
  fs.writeFileSync(path, out)
  return true
}

function insertIntoBlogPosts(post, { force = false } = {}) {
  const path = "src/data/blogPosts.ts"
  let src = fs.readFileSync(path, "utf8")
  if (src.includes(`slug: "${post.slug}"`)) {
    if (!force) {
      console.log(`SKIP: post ${post.slug} already exists (pass --force to overwrite)`)
      return false
    }
    removeExistingPost(post.slug)
    src = fs.readFileSync(path, "utf8")
  }
  const marker = "export const blogPosts: BlogPost[] = ["
  const i = src.indexOf(marker)
  if (i === -1) throw new Error("could not find blogPosts array literal")
  const after = i + marker.length
  src = src.slice(0, after) + "\n" + serializePost(post) + src.slice(after)
  fs.writeFileSync(path, src)
  return true
}

const matches = loadMatches()
const results = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf8"))
const played = matches
  .filter((m) => m.date === TODAY)
  .map((m) => ({ m, r: results[m.id] }))
  .filter(({ r }) => r && (r.status === "FT" || r.status === "AET" || r.status === "PEN"))

const tomorrow = nextDayIso(TODAY)
const nextDayMatches = matches
  .filter((m) => m.date === tomorrow && m.homeTeam !== "TBD" && m.awayTeam !== "TBD")
  .sort((a, b) => a.matchNumber - b.matchNumber)

console.log(`${TODAY}: ${played.length} finished WC matches; ${nextDayMatches.length} fixtures next day`)
if (!played.length) {
  console.log("Nothing to recap. Exiting.")
  process.exit(0)
}
const post = buildPost(TODAY, played, nextDayMatches)
const inserted = insertIntoBlogPosts(post, { force: FORCE })
if (inserted) {
  console.log(`Wrote post: ${post.title}`)
  console.log(`URL: /blog/${post.slug}/`)
}
