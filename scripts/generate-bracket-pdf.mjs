// Generate the printable World Cup 2026 bracket PDF served at
// /world-cup-2026-bracket.pdf. Single source of truth: matches.ts (data) and
// public/bracket-pdf-cover.png (Higgsfield-generated cover).
//
// Re-run after any schedule change:  node scripts/generate-bracket-pdf.mjs
import fs from "node:fs"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import sharp from "sharp"

const OUT = "public/world-cup-2026-bracket.pdf"
const COVER = "public/bracket-pdf-cover.png"

// Read matches from the source file so this stays in sync with FIFA's schedule.
const matchesSrc = fs.readFileSync("src/data/matches.ts", "utf8")
const matchRe = /\{\s*id:"(m\d+)",\s*matchNumber:(\d+),\s*round:"([^"]+)"(?:,\s*group:"([^"]+)")?,\s*date:"([^"]+)",\s*time:"([^"]+)",\s*homeTeam:"([^"]+)",\s*awayTeam:"([^"]+)",\s*stadiumSlug:"([^"]+)",\s*citySlug:"([^"]+)"\s*\}/g
const matches = []
let m
while ((m = matchRe.exec(matchesSrc)) !== null) {
  matches.push({
    id: m[1], matchNumber: +m[2], round: m[3], group: m[4],
    date: m[5], time: m[6], homeTeam: m[7], awayTeam: m[8],
    stadiumSlug: m[9], citySlug: m[10],
  })
}
console.log(`Loaded ${matches.length} matches.`)

// ───── Page layout constants ─────────────────────────────────────────────────
const W = 612          // US Letter @ 72dpi
const H = 792
const M = 40           // page margin
const BRAND = rgb(0.137, 0.086, 0.271)        // #231645
const PURPLE = rgb(0.494, 0.263, 1.0)         // #7E43FF
const INK    = rgb(0.137, 0.086, 0.271)
const SUB    = rgb(0.380, 0.369, 0.431)       // #615E6E
const RULE   = rgb(0.85, 0.85, 0.90)
const TINT   = rgb(0.97, 0.96, 0.99)

function fmtDate(d) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const pdf = await PDFDocument.create()
const font = await pdf.embedFont(StandardFonts.Helvetica)
const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

pdf.setTitle("World Cup 2026 Printable Bracket Pool")
pdf.setAuthor("myworldcupguide.com")
pdf.setSubject("Printable bracket prediction sheets for the 2026 FIFA World Cup")
pdf.setKeywords(["World Cup 2026", "bracket", "printable", "prediction", "pool"])

// ───── Helpers ───────────────────────────────────────────────────────────────
function pageHeader(page, title, sub) {
  page.drawRectangle({ x: 0, y: H - 60, width: W, height: 60, color: BRAND })
  page.drawText(title.toUpperCase(), { x: M, y: H - 32, size: 14, font: bold, color: rgb(1, 1, 1) })
  page.drawText(sub, { x: M, y: H - 50, size: 9, font, color: rgb(1, 1, 1, ) })
  page.drawText("myworldcupguide.com", { x: W - M - bold.widthOfTextAtSize("myworldcupguide.com", 9), y: H - 32, size: 9, font: bold, color: rgb(0.77, 0.66, 1.0) })
}
function pageFooter(page, n, total) {
  page.drawLine({ start: { x: M, y: 40 }, end: { x: W - M, y: 40 }, thickness: 0.5, color: RULE })
  const left = "World Cup 2026 Pool Kit"
  const right = `Page ${n} / ${total}`
  page.drawText(left, { x: M, y: 26, size: 8, font, color: SUB })
  page.drawText(right, { x: W - M - font.widthOfTextAtSize(right, 8), y: 26, size: 8, font, color: SUB })
}

// ───── COVER PAGE ────────────────────────────────────────────────────────────
const coverPage = pdf.addPage([W, H])

// Crop the Higgsfield cover to a banner aspect (so it doesn't squash) and
// scale to fit a fixed 320px-tall band at the top of the page.
const COVER_H = 320
const targetPxW = 1200
const targetPxH = Math.round(targetPxW * (COVER_H / W))
const coverBuf = await sharp(COVER)
  .resize(targetPxW, targetPxH, { fit: "cover", position: "centre" })
  .png({ quality: 88 })
  .toBuffer()
const cover = await pdf.embedPng(coverBuf)
coverPage.drawImage(cover, { x: 0, y: H - COVER_H, width: W, height: COVER_H })

// Title block below cover
let cy = H - COVER_H - 40
coverPage.drawText("WORLD CUP 2026", { x: M, y: cy, size: 30, font: bold, color: BRAND })
cy -= 28
coverPage.drawText("Printable Bracket Pool Kit", { x: M, y: cy, size: 16, font, color: SUB })

// Two-column "how to use" panel . sized to fit between title and footer.
cy -= 30
const panelH = 200
coverPage.drawRectangle({ x: M, y: cy - panelH, width: W - 2 * M, height: panelH, color: TINT })
coverPage.drawText("How to run your pool", { x: M + 14, y: cy - 22, size: 12, font: bold, color: BRAND })

const howTo = [
  "1. Print this PDF for every player in your pool.",
  "2. Players fill in group-stage scorelines AND a full knockout bracket.",
  "3. Tally points after each round using the scoring sheet on page 10.",
  "4. Track the leaderboard on the final page through the tournament.",
  "",
  "Bonus: build a digital bracket in seconds at",
  "myworldcupguide.com/predictor . it auto-picks against",
  "current Kalshi prediction-market odds.",
]
let yy = cy - 44
for (const line of howTo) {
  coverPage.drawText(line, { x: M + 14, y: yy, size: 10, font: (line.startsWith("Bonus") ? bold : font), color: INK })
  yy -= 16
}
// Footer is drawn for ALL pages at the end so the page count is correct.

// ───── GROUP STAGE PAGES (2 groups per page, 6 pages total) ──────────────────
const groupLetters = [...new Set(matches.filter((x) => x.round === "Group Stage").map((x) => x.group))].sort()
function autoFitSize(text, maxW, baseSize, theFont, minSize = 6) {
  let s = baseSize
  while (s > minSize && theFont.widthOfTextAtSize(text, s) > maxW) s -= 0.5
  return s
}

function drawGroupBox(page, letter, ox, oy) {
  const ww = (W - 2 * M - 10) / 2
  const hh = 330
  // Header
  page.drawRectangle({ x: ox, y: oy + hh - 30, width: ww, height: 30, color: BRAND })
  page.drawText(`GROUP ${letter}`, { x: ox + 12, y: oy + hh - 21, size: 14, font: bold, color: rgb(1, 1, 1) })

  // 6 matches . single horizontal line each, ~28px tall
  const ms = matches.filter((x) => x.round === "Group Stage" && x.group === letter)
  const scoreW = 20, scoreH = 14
  const metaColW = 38                            // left column for M# + date
  const scoresCenter = ox + ww * 0.58            // bias right so longer team names get more room on left
  const homeBoxX = scoresCenter - scoreW - 4
  const awayBoxX = scoresCenter + 4
  const dashX = scoresCenter - 2

  let mY = oy + hh - 46
  for (const mm of ms) {
    const rowMid = mY                             // visual midline of the row

    // Match number (top of meta col)
    page.drawText(`M${mm.matchNumber}`, { x: ox + 4, y: rowMid + 3, size: 7, font: bold, color: PURPLE })
    // Date (bottom of meta col)
    page.drawText(fmtDate(mm.date), { x: ox + 4, y: rowMid - 7, size: 6.5, font, color: SUB })

    // Home team . right-aligned, ending just before the home score box
    const homeMaxW = homeBoxX - (ox + metaColW) - 4
    const homeSize = autoFitSize(mm.homeTeam, homeMaxW, 9, font)
    const homeW = font.widthOfTextAtSize(mm.homeTeam, homeSize)
    page.drawText(mm.homeTeam, { x: homeBoxX - 4 - homeW, y: rowMid - 2, size: homeSize, font, color: INK })

    // Score boxes + dash
    page.drawRectangle({ x: homeBoxX, y: rowMid - 5, width: scoreW, height: scoreH, borderColor: RULE, borderWidth: 0.6, color: rgb(1, 1, 1) })
    page.drawText("–", { x: dashX, y: rowMid - 2, size: 10, font: bold, color: SUB })
    page.drawRectangle({ x: awayBoxX, y: rowMid - 5, width: scoreW, height: scoreH, borderColor: RULE, borderWidth: 0.6, color: rgb(1, 1, 1) })

    // Away team . left-aligned, starting just after the away score box
    const awayMaxW = (ox + ww) - (awayBoxX + scoreW + 4) - 2
    const awaySize = autoFitSize(mm.awayTeam, awayMaxW, 9, font)
    page.drawText(mm.awayTeam, { x: awayBoxX + scoreW + 4, y: rowMid - 2, size: awaySize, font, color: INK })

    // Divider under the row
    page.drawLine({ start: { x: ox, y: rowMid - 12 }, end: { x: ox + ww, y: rowMid - 12 }, thickness: 0.3, color: RULE })
    mY -= 28
  }

  // Standings mini-grid
  const sY = oy + hh - 240
  page.drawText("Standings (fill in)", { x: ox + 6, y: sY, size: 8, font: bold, color: BRAND })
  const cols = ["#", "Team", "P", "W", "D", "L", "GD", "Pts"]
  const colX = [ox + 6, ox + 22, ox + 100, ox + 118, ox + 136, ox + 154, ox + 172, ox + 196]
  for (let i = 0; i < cols.length; i++) {
    page.drawText(cols[i], { x: colX[i], y: sY - 14, size: 7, font: bold, color: SUB })
  }
  for (let r = 1; r <= 4; r++) {
    const rowY = sY - 14 - r * 14
    page.drawLine({ start: { x: ox + 4, y: rowY + 4 }, end: { x: ox + ww - 4, y: rowY + 4 }, thickness: 0.4, color: RULE })
    page.drawText(String(r), { x: colX[0], y: rowY - 6, size: 7, font, color: r <= 2 ? PURPLE : SUB })
  }
}

const groupPages = []
// 4 groups per page in a 2×2 grid. Each box is 330 tall; two rows + gap fit
// between the header (top 60px) and the footer (bottom 40px).
const COL_W = (W - 2 * M - 10) / 2
const LEFT_X = M
const RIGHT_X = M + COL_W + 10
const TOP_ROW_Y = H - 60 - 10 - 330                // 392
const BOTTOM_ROW_Y = TOP_ROW_Y - 10 - 330          // 52
for (let i = 0; i < groupLetters.length; i += 4) {
  const p = pdf.addPage([W, H])
  const last = Math.min(i + 3, groupLetters.length - 1)
  const labels = groupLetters.slice(i, last + 1).join(", ")
  pageHeader(p, `Group Stage . Groups ${labels}`, "Fill in scorelines and your projected final standings.")
  drawGroupBox(p, groupLetters[i],     LEFT_X,  TOP_ROW_Y)
  if (groupLetters[i + 1]) drawGroupBox(p, groupLetters[i + 1], RIGHT_X, TOP_ROW_Y)
  if (groupLetters[i + 2]) drawGroupBox(p, groupLetters[i + 2], LEFT_X,  BOTTOM_ROW_Y)
  if (groupLetters[i + 3]) drawGroupBox(p, groupLetters[i + 3], RIGHT_X, BOTTOM_ROW_Y)
  groupPages.push(p)
}

// ───── ROUND OF 32 PAGE ──────────────────────────────────────────────────────
const r32Matches = matches.filter((x) => x.round === "Round of 32")
const r32Page = pdf.addPage([W, H])
pageHeader(r32Page, "Round of 32", "16 matches. Write in the teams as group standings resolve, plus your predicted scoreline.")
let r32Y = H - 90
for (let i = 0; i < r32Matches.length; i++) {
  const mm = r32Matches[i]
  const col = i % 2
  const row = Math.floor(i / 2)
  const x = M + col * ((W - 2 * M) / 2)
  const y = H - 90 - row * 50
  const ww = (W - 2 * M) / 2 - 10
  // Match number
  r32Page.drawText(`M${mm.matchNumber}`, { x: x, y: y, size: 8, font: bold, color: PURPLE })
  r32Page.drawText(fmtDate(mm.date) + " · " + mm.time, { x: x + 28, y: y, size: 7, font, color: SUB })
  // Team lines (home, away) with score boxes
  for (let t = 0; t < 2; t++) {
    const ly = y - 12 - t * 14
    r32Page.drawLine({ start: { x: x, y: ly - 1 }, end: { x: x + ww - 30, y: ly - 1 }, thickness: 0.5, color: RULE })
    r32Page.drawText(t === 0 ? "Home: " : "Away: ", { x: x, y: ly + 2, size: 7, font: bold, color: SUB })
    r32Page.drawRectangle({ x: x + ww - 22, y: ly - 3, width: 18, height: 12, borderColor: RULE, borderWidth: 0.5, color: rgb(1, 1, 1) })
  }
}

// ───── R16 → FINAL PAGE ──────────────────────────────────────────────────────
const knockoutPage = pdf.addPage([W, H])
pageHeader(knockoutPage, "Knockout Bracket . Round of 16 to Final", "Fill in your projected winners and scorelines all the way to MetLife on July 19.")
const rounds = [
  { title: "Round of 16", filter: "Round of 16" },
  { title: "Quarterfinals", filter: "Quarterfinal" },
  { title: "Semi-finals", filter: "Semi-final" },
  { title: "3rd Place", filter: "3rd Place" },
  { title: "Final", filter: "Final" },
]
let secY = H - 90
for (const r of rounds) {
  const ms = matches.filter((x) => x.round === r.filter)
  knockoutPage.drawRectangle({ x: M, y: secY - 14, width: W - 2 * M, height: 16, color: TINT })
  knockoutPage.drawText(`${r.title.toUpperCase()} . ${ms.length} match${ms.length === 1 ? "" : "es"}`, { x: M + 8, y: secY - 11, size: 9, font: bold, color: BRAND })
  secY -= 22
  for (const mm of ms) {
    knockoutPage.drawText(`M${mm.matchNumber} · ${fmtDate(mm.date)} · ${mm.time} · ${mm.citySlug.replace(/-/g, " ")}`, { x: M, y: secY, size: 8, font, color: SUB })
    knockoutPage.drawLine({ start: { x: M, y: secY - 10 }, end: { x: W - M - 80, y: secY - 10 }, thickness: 0.5, color: RULE })
    knockoutPage.drawText("vs", { x: W / 2 - 6, y: secY - 8, size: 8, font: bold, color: SUB })
    knockoutPage.drawRectangle({ x: W - M - 70, y: secY - 14, width: 22, height: 14, borderColor: RULE, borderWidth: 0.5, color: rgb(1, 1, 1) })
    knockoutPage.drawText("-", { x: W - M - 46, y: secY - 9, size: 10, font: bold, color: SUB })
    knockoutPage.drawRectangle({ x: W - M - 40, y: secY - 14, width: 22, height: 14, borderColor: RULE, borderWidth: 0.5, color: rgb(1, 1, 1) })
    secY -= 26
  }
  secY -= 6
}

// ───── SCORING + LEADERBOARD PAGE ────────────────────────────────────────────
const scorePage = pdf.addPage([W, H])
pageHeader(scorePage, "Scoring & Leaderboard", "Standard pool scoring. Customize to taste before kickoff on June 11.")

const scoring = [
  ["Correct group-stage result (W / D / L)", "1 pt"],
  ["Correct group-stage exact scoreline", "3 pts"],
  ["Correct group winner (1st place)", "5 pts"],
  ["Correct group runner-up (2nd place)", "3 pts"],
  ["Correct R32 / R16 / QF winner", "5 pts each"],
  ["Correct Semi-finalist (one of 4)", "10 pts"],
  ["Correct Finalist (one of 2)", "15 pts"],
  ["Correct Champion", "25 pts"],
  ["Bonus: exact champion scoreline", "+10 pts"],
]
let sY = H - 100
scorePage.drawText("SCORING SYSTEM", { x: M, y: sY, size: 11, font: bold, color: BRAND })
sY -= 16
for (const [k, v] of scoring) {
  scorePage.drawLine({ start: { x: M, y: sY + 5 }, end: { x: W - M, y: sY + 5 }, thickness: 0.3, color: RULE })
  scorePage.drawText(k, { x: M, y: sY - 6, size: 9, font, color: INK })
  scorePage.drawText(v, { x: W - M - bold.widthOfTextAtSize(v, 9), y: sY - 6, size: 9, font: bold, color: PURPLE })
  sY -= 18
}

sY -= 20
scorePage.drawText("LEADERBOARD", { x: M, y: sY, size: 11, font: bold, color: BRAND })
sY -= 16
const lbCols = ["Player", "Group Stage", "R32", "R16", "QF", "SF", "Final", "Total"]
const lbX = [M, M + 130, M + 220, M + 270, M + 320, M + 370, M + 420, W - M - 50]
for (let i = 0; i < lbCols.length; i++) {
  scorePage.drawText(lbCols[i], { x: lbX[i], y: sY, size: 7, font: bold, color: SUB })
}
for (let r = 1; r <= 14; r++) {
  const rowY = sY - 8 - r * 18
  scorePage.drawLine({ start: { x: M, y: rowY + 8 }, end: { x: W - M, y: rowY + 8 }, thickness: 0.3, color: RULE })
  scorePage.drawText(String(r) + ".", { x: M - 4, y: rowY - 2, size: 8, font, color: SUB })
}

// ───── Write footers with correct total page count ──────────────────────────
const pages = pdf.getPages()
for (let i = 0; i < pages.length; i++) {
  pageFooter(pages[i], i + 1, pages.length)
}

const bytes = await pdf.save()
fs.writeFileSync(OUT, bytes)
console.log(`Wrote ${OUT} (${(bytes.length / 1024).toFixed(1)} KB, ${pages.length} pages)`)
