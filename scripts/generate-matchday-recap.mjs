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

const TODAY = process.argv[2] ?? yesterdayISO()
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
  const re = /\{\s*id:\s*"([^"]+)",[^}]*?round:\s*"([^"]+)",[^}]*?(?:group:\s*"([^"]+)",[^}]*?)?date:\s*"([^"]+)",[^}]*?homeTeam:\s*"([^"]+)",\s*awayTeam:\s*"([^"]+)"/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1], round: m[2], group: m[3] ?? undefined,
      date: m[4], homeTeam: m[5], awayTeam: m[6],
    })
  }
  return out
}

function matchSlug(m) {
  return `${slugify(m.homeTeam)}-vs-${slugify(m.awayTeam)}-match-${m.id}`
}

function buildPost(date, played) {
  const long = formatLong(date)
  const slug = `world-cup-2026-recap-${date}`
  const totalGoals = played.reduce((s, p) => s + p.r.homeScore + p.r.awayScore, 0)
  const body = [
    {
      type: "p",
      text: `${played.length} match${played.length === 1 ? "" : "es"} from the 2026 FIFA World Cup ${played.length === 1 ? "was" : "were"} played on ${long}, with ${totalGoals} total goal${totalGoals === 1 ? "" : "s"} scored. Full scorelines and links to highlights below.`,
    },
  ]
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
  if (biggest) {
    const margin = Math.abs(biggest.r.homeScore - biggest.r.awayScore)
    const winner = biggest.r.homeScore > biggest.r.awayScore ? biggest.m.homeTeam : biggest.m.awayTeam
    const loser = biggest.r.homeScore > biggest.r.awayScore ? biggest.m.awayTeam : biggest.m.homeTeam
    if (margin > 0) {
      body.push({ type: "h2", text: "Standout result" })
      body.push({
        type: "p",
        text: `${biggest.m.homeTeam} ${biggest.r.homeScore}-${biggest.r.awayScore} ${biggest.m.awayTeam} was the day's biggest margin, a ${margin}-goal win for ${winner} over ${loser}. Watch the [match highlights and full match report](/matches/${matchSlug(biggest.m)}/).`,
      })
    }
  }
  body.push({ type: "h2", text: "Tomorrow" })
  body.push({
    type: "p",
    text: `See the [full World Cup 2026 schedule](/schedule/) for tomorrow's fixtures, or the [predictor bracket](/predictor/) to lock in your knockout picks based on what you saw today.`,
  })
  return {
    slug,
    title: `World Cup 2026 Recap: ${long}`,
    description: `Results and highlights from every World Cup 2026 match on ${long}. ${played.length} match${played.length === 1 ? "" : "es"}, ${totalGoals} goals, full scoreline table and links to video highlights.`,
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

function insertIntoBlogPosts(post) {
  const path = "src/data/blogPosts.ts"
  let src = fs.readFileSync(path, "utf8")
  if (src.includes(`slug: "${post.slug}"`)) {
    console.log(`SKIP: post ${post.slug} already exists`)
    return false
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

console.log(`${TODAY}: ${played.length} finished WC matches`)
if (!played.length) {
  console.log("Nothing to recap. Exiting.")
  process.exit(0)
}
const post = buildPost(TODAY, played)
const inserted = insertIntoBlogPosts(post)
if (inserted) {
  console.log(`Wrote post: ${post.title}`)
  console.log(`URL: /blog/${post.slug}/`)
}
