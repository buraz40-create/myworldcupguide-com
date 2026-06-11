// Generates a daily-recap blog post from the friendlies + matches data and
// inserts it at the top of src/data/blogPosts.ts.
//
// Usage:
//   node scripts/generate-daily-recap.mjs              # recaps yesterday
//   node scripts/generate-daily-recap.mjs 2026-06-02   # recaps a specific date
//
// Idempotent: if a recap for the date already exists in blogPosts.ts, it is
// skipped (won't duplicate). Posts are fact-based and quotable so they read
// fine without a human editor touching them.

import fs from "node:fs"

const TODAY = process.argv[2] ?? yesterdayISO()

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

// Extract played friendlies (with scores) for a given date by regex from the
// data file . avoids the TS-loader hassle and works in plain node.
function loadPlayedFriendlies(date) {
  const src = fs.readFileSync("src/data/friendlies.ts", "utf8")
  // Match lines like:
  //   { id: "f0531-bra-pan", date: "2026-05-31", time: "17:30", homeTeam: "Brazil", awayTeam: "Panama", bothWcTeams: true, homeScore: 6, awayScore: 2 },
  const re = /\{\s*id:\s*"([^"]+)",\s*date:\s*"([^"]+)",[^}]*homeTeam:\s*"([^"]+)",\s*awayTeam:\s*"([^"]+)"(?:[^}]*bothWcTeams:\s*(true|false))?[^}]*homeScore:\s*(\d+),\s*awayScore:\s*(\d+)[^}]*\}/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) {
    const [, , d, homeTeam, awayTeam, bothWc, hs, as] = m
    if (d !== date) continue
    out.push({
      homeTeam,
      awayTeam,
      bothWcTeams: bothWc === "true",
      homeScore: parseInt(hs, 10),
      awayScore: parseInt(as, 10),
    })
  }
  return out
}

function resultLine(f) {
  return `${f.homeTeam} ${f.homeScore}-${f.awayScore} ${f.awayTeam}`
}

function biggestMargin(list) {
  if (!list.length) return null
  return [...list].sort(
    (a, b) => Math.abs(b.homeScore - b.awayScore) - Math.abs(a.homeScore - a.awayScore),
  )[0]
}

function highestScoring(list) {
  if (!list.length) return null
  return [...list].sort(
    (a, b) => b.homeScore + b.awayScore - (a.homeScore + a.awayScore),
  )[0]
}

function buildPost(date, played) {
  const long = formatLong(date)
  const wcMatches = played.filter((f) => f.bothWcTeams)
  const slug = `world-cup-2026-recap-${date}`

  const headerSummary =
    `On ${long}, ${played.length} pre-tournament international friendly match${played.length === 1 ? "" : "es"} ${played.length === 1 ? "was" : "were"} played ahead of the 2026 FIFA World Cup, including ${wcMatches.length} fixture${wcMatches.length === 1 ? "" : "s"} between WC-qualified nations.`

  const headline = biggestMargin(played)
  const top = highestScoring(played)

  const body = [
    { type: "p", text: headerSummary },
  ]

  if (headline) {
    const margin = Math.abs(headline.homeScore - headline.awayScore)
    const winner = headline.homeScore > headline.awayScore ? headline.homeTeam : headline.awayTeam
    const loser  = headline.homeScore > headline.awayScore ? headline.awayTeam : headline.homeTeam
    body.push({
      type: "p",
      text:
        `The standout result was ${resultLine(headline)}, a ${margin}-goal margin. ${winner} ${margin >= 3 ? "ran riot against" : "comfortably saw off"} ${loser} in their final World Cup tune-up.`,
    })
  }

  // Full results table
  if (played.length) {
    body.push({
      type: "table",
      caption: `All friendly results on ${long}. WC indicates both teams are 2026 World Cup qualifiers.`,
      headers: ["Home", "Score", "Away", "Both WC?"],
      rows: played.map((f) => [
        f.homeTeam,
        `${f.homeScore}-${f.awayScore}`,
        f.awayTeam,
        f.bothWcTeams ? "Yes" : "No",
      ]),
    })
  }

  if (top && (top.homeScore + top.awayScore) >= 5) {
    body.push({
      type: "p",
      text:
        `Goal of the day count went to ${resultLine(top)}, with ${top.homeScore + top.awayScore} goals in 90 minutes. Form like that going into the group stage is exactly what fans want to see, though defensive coaches will be less impressed.`,
    })
  }

  body.push({ type: "h2", text: "What it means for the World Cup" })
  if (wcMatches.length) {
    body.push({
      type: "p",
      text:
        `${wcMatches.length} of the day's fixtures matched two World Cup 2026 qualifiers: ${wcMatches.map((f) => `${f.homeTeam} vs ${f.awayTeam}`).join(", ")}. These are the most predictive results, since both squads are using the friendly to sharpen their tournament starting XI.`,
    })
  } else {
    body.push({
      type: "p",
      text:
        `No fixtures matched two qualified WC sides directly, so the predictive value is limited. Form against non-WC opposition is encouraging but rarely translates 1:1 to the group stage.`,
    })
  }

  body.push({ type: "h2", text: "Next up" })
  body.push({
    type: "p",
    text:
      `Check the [friendlies schedule](/schedule/friendlies/) for the next day's fixtures, the [predictor](/predictor/) to lock in your bracket, or jump straight to the [full World Cup 2026 schedule](/schedule/) for matchday details.`,
  })

  return {
    slug,
    title: `World Cup 2026 Recap: ${long}`,
    description:
      `Pre-tournament friendly results from ${long}. ${played.length} match${played.length === 1 ? "" : "es"} played, ${wcMatches.length} between WC qualifiers. Full scoreline table and what it means for the tournament.`,
    date,
    author: "My World Cup Guide editorial",
    authorBio: "We track FIFA's official schedule, results and visitor info for the 2026 World Cup across the USA, Canada, and Mexico.",
    category: "Results",
    tags: ["recap", "results", "friendlies", date],
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

const played = loadPlayedFriendlies(TODAY)
console.log(`${TODAY}: found ${played.length} played friendlies`)
if (!played.length) {
  console.log("No played matches for that date. Nothing to recap.")
  process.exit(0)
}
const post = buildPost(TODAY, played)
const inserted = insertIntoBlogPosts(post)
if (inserted) {
  console.log(`Wrote post: ${post.title}`)
  console.log(`URL: /blog/${post.slug}/`)
} else {
  console.log("No changes.")
}
