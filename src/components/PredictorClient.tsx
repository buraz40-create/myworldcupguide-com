"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  STORAGE_KEY,
  GROUP_LETTERS,
  GROUP_MATCHES,
  computeStandings,
  buildBracket,
  getQualifiers,
  autoPickAll,
  simulateAll,
  iso2,
  slug,
  knockoutWinner,
  autoPickKnockout,
  type ScoreMap,
  type ScoreEntry,
  type BracketMatch,
  type Bracket,
  type Qualifier,
} from "@/lib/predictorEngine"
import { groupWinnerOdds, championOdds, oddsFetchedAt } from "@/data/marketOdds"

// ───── Prediction-market autopick ─────────────────────────────────────────
// "Markets" button fills the bracket using current Kalshi prediction-market
// prices. Group stage uses each team's group-winner odds; knockouts use the
// outright champion odds (higher implied probability = stronger team).
//
// Scoreline mapping is heuristic . we just need believable scorelines that
// produce the right winner; the value users get is which team is picked,
// not the exact 2-0 vs 2-1 distinction.

function marketGroupScore(homeTeam: string, awayTeam: string): ScoreEntry {
  const a = groupWinnerOdds[homeTeam] ?? 0.05
  const b = groupWinnerOdds[awayTeam] ?? 0.05
  const diff = Math.abs(a - b)
  if (diff < 0.10) return { home: 1, away: 1 }
  if (diff < 0.25) return a > b ? { home: 1, away: 0 } : { home: 0, away: 1 }
  return a > b ? { home: 2, away: 0 } : { home: 0, away: 2 }
}

function marketKnockoutScore(homeTeam: string, awayTeam: string): ScoreEntry {
  const a = championOdds[homeTeam] ?? 0.005
  const b = championOdds[awayTeam] ?? 0.005
  const diff = Math.abs(a - b)
  // Knockouts need a non-draw, so always pick a winner . gaps shrink late.
  if (diff < 0.005) return a >= b ? { home: 1, away: 0 } : { home: 0, away: 1 }
  if (diff < 0.03) return a > b ? { home: 2, away: 1 } : { home: 1, away: 2 }
  return a > b ? { home: 2, away: 0 } : { home: 0, away: 2 }
}

function marketPickAll(): ScoreMap {
  const scores: ScoreMap = {}
  // 1. Group stage: every match.
  for (const m of GROUP_MATCHES) {
    scores[m.id] = marketGroupScore(m.homeTeam, m.awayTeam)
  }
  // 2. Knockouts: walk the bracket round by round. Each iteration of buildBracket
  // surfaces the matches whose participants are now known; fill those, recompute,
  // repeat. Cap at 6 rounds (R32→R16→QF→SF→Final) plus a safety pass.
  for (let i = 0; i < 6; i++) {
    const bracket = buildBracket(scores)
    if (!bracket) break
    let filled = 0
    const all: BracketMatch[] = [
      ...bracket.r32, ...bracket.r16, ...bracket.qf, ...bracket.sf, bracket.third, bracket.final,
    ].filter(Boolean) as BracketMatch[]
    for (const m of all) {
      if (!m.home || !m.away) continue
      if (scores[m.id]) continue
      scores[m.id] = marketKnockoutScore(m.home.team, m.away.team)
      filled++
    }
    if (!filled) break
  }
  return scores
}

// ───── Flag component ─────────────────────────────────────────────────────
// Uses flagcdn.com (same as the rest of the site) so flags render the same
// on every OS. Windows can't draw flag emoji natively.
function Flag({ team, size = "sm" }: { team: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const code = iso2(team)
  if (!code) return null
  const dims = size === "xs"
    ? { src: "w20", w: 18, h: 12 }
    : size === "sm"
    ? { src: "w40", w: 24, h: 16 }
    : size === "md"
    ? { src: "w80", w: 36, h: 24 }
    : { src: "w320", w: 96, h: 64 }
  return (
    <Image
      src={`https://flagcdn.com/${dims.src}/${code}.png`}
      alt={team}
      width={dims.w}
      height={dims.h}
      className="rounded-sm object-cover flex-shrink-0 inline-block"
      style={{ width: dims.w, height: dims.h }}
      unoptimized
    />
  )
}

// ───── Helpers (UI-side) ──────────────────────────────────────────────────

const clamp = (n: number) => Math.max(0, Math.min(20, Math.floor(n)))

function setScore(prev: ScoreMap, id: string, patch: Partial<ScoreEntry>): ScoreMap {
  const cur = prev[id]
  const next: ScoreEntry = {
    home: cur?.home ?? 0,
    away: cur?.away ?? 0,
    et: cur?.et,
    pens: cur?.pens,
    ...patch,
  }
  return { ...prev, [id]: next }
}

// When a regulation/ET edit changes the winner, downstream knockout picks
// referencing the previous winner become stale. Let the engine rebuild and
// drop scores whose home/away no longer exists.
function pruneDownstream(scores: ScoreMap): ScoreMap {
  const bracket = buildBracket(scores)
  if (!bracket) return scores
  const validIds = new Set<string>()
  ;[bracket.r32, bracket.r16, bracket.qf, bracket.sf].forEach((round) => {
    round.forEach((m) => {
      if (m.home && m.away) validIds.add(m.id)
    })
  })
  if (bracket.third.home && bracket.third.away) validIds.add("third")
  if (bracket.final.home && bracket.final.away) validIds.add("final")

  const next: ScoreMap = {}
  for (const [id, s] of Object.entries(scores)) {
    if (id.startsWith("m")) { next[id] = s; continue }            // group-stage match IDs
    if (validIds.has(id)) next[id] = s
  }
  return next
}

// ───── Shareable bracket card ─────────────────────────────────────────────
// Renders the user's completed bracket to a 1200x630 PNG (Twitter/OG ratio)
// entirely client-side, then shares via the Web Share API on mobile or
// downloads as a file on desktop. This is the viral loop: every user who
// finishes a bracket can post their champion + final + semis with the site URL.

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image()   // window.Image, not the next/image default import shadowing the name
    img.crossOrigin = "anonymous"           // flagcdn sends Access-Control-Allow-Origin: *, so the canvas stays untainted
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)       // resolve null on failure so a missing flag never blocks the card
    img.src = src
  })
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startPx: number, weight = ""): number {
  let size = startPx
  ctx.font = `${weight} ${size}px Arial, sans-serif`
  while (ctx.measureText(text).width > maxWidth && size > 12) {
    size -= 1
    ctx.font = `${weight} ${size}px Arial, sans-serif`
  }
  return size
}

async function shareBracket(bracket: Bracket) {
  const W = 1200, H = 630
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Background gradient (brand purple)
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, "#231645")
  grad.addColorStop(1, "#4f1ea1")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const champ = bracket.champion ?? "TBD"
  const finalists = [bracket.final.home?.team, bracket.final.away?.team].filter(Boolean) as string[]
  const runnerUp = finalists.find((t) => t !== champ) ?? "TBD"
  const semis = [
    bracket.sf[0]?.home?.team, bracket.sf[0]?.away?.team,
    bracket.sf[1]?.home?.team, bracket.sf[1]?.away?.team,
  ].filter(Boolean) as string[]

  ctx.textAlign = "center"

  // Title
  ctx.fillStyle = "rgba(255,255,255,0.75)"
  ctx.font = "bold 30px Arial, sans-serif"
  ctx.fillText("MY WORLD CUP 2026 PREDICTION", W / 2, 78)

  // Champion flag
  const code = iso2(champ)
  if (code) {
    const img = await loadImg(`https://flagcdn.com/w320/${code}.png`)
    if (img && img.width > 0) {
      const fw = 170
      const fh = (img.height / img.width) * fw
      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.45)"
      ctx.shadowBlur = 24
      ctx.drawImage(img, W / 2 - fw / 2, 120, fw, fh)
      ctx.restore()
    }
  }

  // CHAMPION label
  ctx.fillStyle = "#FFD24A"
  ctx.font = "bold 26px Arial, sans-serif"
  ctx.fillText("CHAMPION", W / 2, 300)

  // Champion name (auto-fit so long names like "Bosnia and Herzegovina" don't overflow)
  ctx.fillStyle = "#ffffff"
  fitFont(ctx, champ, W - 160, 76, "bold")
  ctx.fillText(champ, W / 2, 372)

  // Final line
  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.font = "bold 18px Arial, sans-serif"
  ctx.fillText("FINAL", W / 2, 428)
  ctx.fillStyle = "#ffffff"
  const finalLine = `${champ}  beat  ${runnerUp}`
  fitFont(ctx, finalLine, W - 160, 30)
  ctx.fillText(finalLine, W / 2, 460)

  // Semifinalists
  if (semis.length) {
    ctx.fillStyle = "rgba(255,255,255,0.55)"
    ctx.font = "bold 18px Arial, sans-serif"
    ctx.fillText("SEMIFINALISTS", W / 2, 516)
    ctx.fillStyle = "#ffffff"
    const semisLine = semis.join("   •   ")
    fitFont(ctx, semisLine, W - 120, 24)
    ctx.fillText(semisLine, W / 2, 546)
  }

  // Footer CTA
  ctx.fillStyle = "#c4a8ff"
  ctx.font = "bold 26px Arial, sans-serif"
  ctx.fillText("Build your own  →  myworldcupguide.com/predictor", W / 2, 602)

  // The caption text shared/copied alongside the image. Plain URL (not bare
  // domain) so it's clickable when pasted into posts.
  const caption =
    `My pick to win the 2026 World Cup: ${champ}` +
    (runnerUp !== "TBD" ? `, beating ${runnerUp} in the final.` : ".") +
    `\n\nBuild your own bracket 👉 https://myworldcupguide.com/predictor`

  // Export → native share (mobile) or download + clipboard caption (desktop)
  canvas.toBlob(async (blob) => {
    if (!blob) return
    const file = new File([blob], "my-wc2026-bracket.png", { type: "image/png" })
    const shareData = {
      files: [file],
      title: "My World Cup 2026 Bracket",
      text: caption,
    }
    // Mobile / supporting browsers: native share sheet with image + caption text
    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        /* user cancelled or share failed . fall through to download */
      }
    }
    // Desktop fallback: download the image AND copy the caption to clipboard
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "my-wc2026-bracket.png"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    let copied = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(caption)
        copied = true
      }
    } catch {
      /* clipboard blocked (no https / permission) . toast just omits the copy note */
    }
    showToast(copied
      ? "Image downloaded + caption copied. Paste it with your post."
      : "Image downloaded. Add a caption with myworldcupguide.com/predictor when you post.")
  }, "image/png")
}

// Lightweight transient toast . no component state needed, self-removes.
function showToast(message: string) {
  if (typeof document === "undefined") return
  const el = document.createElement("div")
  el.textContent = message
  el.setAttribute("role", "status")
  el.style.cssText = [
    "position:fixed", "left:50%", "bottom:28px", "transform:translateX(-50%)",
    "background:#231645", "color:#fff", "padding:12px 20px", "border-radius:9999px",
    "font:600 14px/1.3 Arial,sans-serif", "box-shadow:0 8px 30px rgba(35,22,69,0.35)",
    "z-index:99999", "max-width:90vw", "text-align:center", "opacity:0",
    "transition:opacity 0.25s ease",
  ].join(";")
  document.body.appendChild(el)
  requestAnimationFrame(() => { el.style.opacity = "1" })
  setTimeout(() => {
    el.style.opacity = "0"
    setTimeout(() => el.remove(), 300)
  }, 3500)
}

// ───── Main component ────────────────────────────────────────────────────

export default function PredictorClient() {
  const [scores, setScores] = useState<ScoreMap>({})
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setScores(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  // Persist
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scores)) } catch {}
  }, [scores, hydrated])

  const bracket = useMemo(() => buildBracket(scores), [scores])
  const qualifiers = useMemo(() => getQualifiers(scores), [scores])

  const groupComplete = useMemo(() => {
    const out: Record<string, boolean> = {}
    for (const g of GROUP_LETTERS) {
      out[g] = GROUP_MATCHES.filter((m) => m.group === g).every((m) => !!scores[m.id])
    }
    return out
  }, [scores])

  const simulateAllNow = () => {
    setScores(simulateAll(Math.floor(Math.random() * 2 ** 31)))
  }
  const autoPickAllNow = () => setScores(autoPickAll())
  const marketPickAllNow = () => {
    setScores(marketPickAll())
    const ago = (() => {
      const d = new Date(oddsFetchedAt)
      const hrs = Math.max(1, Math.round((Date.now() - d.getTime()) / 3_600_000))
      return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`
    })()
    showToast(`Bracket filled from Kalshi prediction markets (${ago}).`)
  }
  const resetAll = () => setScores({})

  // Group-stage edit
  const editScore = (id: string, side: "home" | "away", value: number) => {
    setScores((prev) => pruneDownstream(setScore(prev, id, { [side]: clamp(value) })))
  }
  const editET = (id: string, side: "home" | "away", value: number) => {
    setScores((prev) => {
      const cur = prev[id]
      const et = { home: cur?.et?.home ?? 0, away: cur?.et?.away ?? 0, [side]: clamp(value) }
      return pruneDownstream(setScore(prev, id, { et }))
    })
  }
  const editPens = (id: string, side: "home" | "away", value: number) => {
    setScores((prev) => {
      const cur = prev[id]
      const pens = { home: cur?.pens?.home ?? 0, away: cur?.pens?.away ?? 0, [side]: clamp(value) }
      return pruneDownstream(setScore(prev, id, { pens }))
    })
  }

  // Per-match auto-fill (knockout): use deterministic auto-pick, then prune
  const autoFillMatch = (m: BracketMatch) => {
    if (!m.home || !m.away) return
    const s = autoPickKnockout(m.home.team, m.away.team)
    setScores((prev) => pruneDownstream({ ...prev, [m.id]: s }))
  }

  const champion = bracket?.champion ?? null

  return (
    <>
      {/* Toolbar . sticky from sm up; on mobile it stays inline so it can't
          cover the group cards as the user scrolls. */}
      <div className="sm:sticky sm:top-2 z-20 mb-6 rounded-2xl bg-white/95 backdrop-blur border border-black/[0.06] shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF]">Champion</span>
          {champion ? (
            <Link href={`/teams/${slug(champion)}/`} className="flex items-center gap-2 text-[#231645] font-extrabold hover:underline">
              <Flag team={champion} size="sm" />
              <span className="text-base">{champion}</span>
            </Link>
          ) : (
            <span className="text-sm text-[#615E6E] italic">Pick scores below to crown a winner</span>
          )}
        </div>
        <button onClick={simulateAllNow} className="btn-primary text-xs whitespace-nowrap" title="Random Poisson simulation - different every time">
          Simulate
        </button>
        <button onClick={autoPickAllNow} className="btn-outline text-xs whitespace-nowrap" title="Deterministic: favorites win by their expected scoreline">
          Auto-pick
        </button>
        <button
          onClick={marketPickAllNow}
          className="btn-outline text-xs whitespace-nowrap"
          title="Fill bracket from current Kalshi prediction-market prices (real-money implied probabilities)"
        >
          Kalshi pick
        </button>
        {champion && bracket && (
          <button
            onClick={() => shareBracket(bracket)}
            className="text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-2 rounded-full transition-all"
            style={{ background: "#7E43FF", color: "#fff" }}
            title="Generate a shareable image of your bracket"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
        )}
        <button onClick={resetAll} className="text-xs font-bold text-[#615E6E] hover:text-[#231645] px-3 py-2">
          Reset
        </button>
      </div>

      {/* Method explainer */}
      <div className="mb-8 rounded-xl bg-[#f8f7fd] border border-[#7E43FF]/15 px-5 py-4 text-xs text-[#615E6E] leading-relaxed">
        <span className="font-extrabold text-[#231645]">How it works · </span>
        Team strength combines FIFA rank with a confederation adjustment - UEFA and CONMEBOL sides get a bonus (their FIFA points are systematically deflated by playing more competitive matches), AFC and OFC get a small penalty. Expected goals per match come from the rating gap, then scores are sampled from a Poisson distribution - the standard model in football analytics. <span className="font-bold">Simulate</span> rolls a random tournament; <span className="font-bold">Auto-pick</span> shows the deterministic favorite. Edit any score and downstream rounds rebuild automatically. Saves to your browser.
      </div>

      {/* Group stage */}
      <section aria-label="Group stage">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Group stage</h2>
        <p className="text-sm text-[#615E6E] mb-5">12 groups × 6 matches. Top 2 from each group plus the 8 best third-placed teams advance to the Round of 32.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {GROUP_LETTERS.map((g) => (
            <GroupCard
              key={g}
              group={g}
              scores={scores}
              complete={groupComplete[g]}
              onEdit={editScore}
            />
          ))}
        </div>
      </section>

      {/* Best 3rds panel */}
      {qualifiers && (
        <section className="mt-10" aria-label="Qualified teams">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Round of 32 qualifiers</h2>
          <p className="text-sm text-[#615E6E] mb-5">All 24 group winners + runners-up qualify. Top 8 third-placers also advance.</p>
          <ThirdsPanel qualifiers={qualifiers} />
        </section>
      )}

      {/* Knockout */}
      {bracket && qualifiers && (
        <section className="mt-12" aria-label="Knockout bracket">
          <h2 className="text-2xl font-extrabold text-[#231645] mb-1">Knockout bracket</h2>
          <p className="text-sm text-[#615E6E] mb-5">Click into any match to set the score. Tied at 90? Extra-time fields appear. Still tied? Penalty shootout.</p>

          {/* Visual tree-style bracket . regulation scores editable inline. ET/pens still go through the form cards below. */}
          <BracketView bracket={bracket} scores={scores} onEdit={editScore} />

          <KnockoutRound
            title="Round of 32"
            matches={bracket.r32}
            scores={scores}
            onEdit={editScore}
            onET={editET}
            onPens={editPens}
            onAuto={autoFillMatch}
          />
          <KnockoutRound
            title="Round of 16"
            matches={bracket.r16}
            scores={scores}
            onEdit={editScore}
            onET={editET}
            onPens={editPens}
            onAuto={autoFillMatch}
          />
          <KnockoutRound
            title="Quarterfinals"
            matches={bracket.qf}
            scores={scores}
            onEdit={editScore}
            onET={editET}
            onPens={editPens}
            onAuto={autoFillMatch}
          />
          <KnockoutRound
            title="Semi-finals"
            matches={bracket.sf}
            scores={scores}
            onEdit={editScore}
            onET={editET}
            onPens={editPens}
            onAuto={autoFillMatch}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
            <div>
              <FinalBanner title="3rd-place play-off" accent="#7E43FF" eyebrow="Bronze medal" />
              <KnockoutMatchCard
                match={bracket.third}
                accent="#7E43FF"
                score={scores[bracket.third.id]}
                onEdit={editScore}
                onET={editET}
                onPens={editPens}
                onAuto={autoFillMatch}
              />
            </div>
            <div>
              <FinalBanner title="Final" accent="#7E43FF" eyebrow="July 19 · MetLife Stadium" />
              <KnockoutMatchCard
                match={bracket.final}
                accent="#7E43FF"
                score={scores[bracket.final.id]}
                onEdit={editScore}
                onET={editET}
                onPens={editPens}
                onAuto={autoFillMatch}
              />
            </div>
          </div>

          {/* Champion banner + share (bottom of page . the natural "you finished, share it" moment) */}
          {champion && bracket && (
            <div
              className="mt-10 rounded-2xl p-8 text-center text-white"
              style={{
                background: "linear-gradient(135deg, #7E43FF 0%, #4f1ea1 100%)",
                boxShadow: "0 12px 40px rgba(126,67,255,0.35)",
              }}
            >
              <p className="text-xs font-extrabold uppercase tracking-widest opacity-80 mb-2">Your World Cup 2026 champion</p>
              <div className="flex justify-center mb-3">
                <Flag team={champion} size="lg" />
              </div>
              <Link href={`/teams/${slug(champion)}/`} className="text-3xl md:text-4xl font-extrabold hover:underline">
                {champion}
              </Link>
              <div className="mt-6 pt-6 border-t border-white/20 flex flex-col items-center gap-3">
                <p className="text-sm font-bold opacity-90">Share your prediction</p>
                <ShareRow bracket={bracket} />
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}

// ───── Group card ─────────────────────────────────────────────────────────

function GroupCard({
  group,
  scores,
  complete,
  onEdit,
}: {
  group: string
  scores: ScoreMap
  complete: boolean
  onEdit: (id: string, side: "home" | "away", value: number) => void
}) {
  const matches = GROUP_MATCHES.filter((m) => m.group === group)
  const standings = computeStandings(group, scores)
  const playedCount = matches.filter((m) => scores[m.id]).length
  return (
    <div className="rounded-3xl bg-white overflow-hidden shadow-[0_4px_24px_-8px_rgba(35,22,69,0.18)] border border-black/[0.04]">
      {/* Bold header bar . group letter, gradient, completion pill */}
      <div
        className="relative px-4 py-3 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg,#231645,#5b22b8)" }}
      >
        <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl font-black text-white leading-none">
          {group}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/60 leading-none mb-0.5">WC 2026</p>
          <h3 className="text-base font-extrabold text-white leading-tight">Group {group}</h3>
        </div>
        <span
          className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap"
          style={{
            background: complete ? "#10b981" : "rgba(255,255,255,0.18)",
            color: "#fff",
            border: complete ? "none" : "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {complete ? "✓ Done" : `${playedCount}/6`}
        </span>
      </div>

      {/* Match rows */}
      <div className="divide-y divide-black/[0.04]">
        {matches.map((m) => {
          const s = scores[m.id]
          const filled = !!s
          return (
            <div
              key={m.id}
              className="px-3 py-2 flex items-center gap-1.5 transition-colors hover:bg-[#faf9fe]"
              style={filled ? { background: "rgba(126,67,255,0.025)" } : undefined}
            >
              <span className="text-[9px] font-extrabold text-[#7E43FF] bg-[#f1ecff] rounded px-1 py-0.5 flex-shrink-0 tabular-nums w-7 text-center">
                {m.matchNumber}
              </span>
              <div className="flex-1 flex items-center gap-1.5 min-w-0 justify-end text-right">
                <span className="text-xs text-[#231645] font-semibold truncate">{m.homeTeam}</span>
                <Flag team={m.homeTeam} size="xs" />
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={s?.home ?? ""}
                placeholder="-"
                onChange={(e) => onEdit(m.id, "home", Number(e.target.value))}
                className="w-9 h-9 text-center text-sm font-extrabold text-[#231645] bg-white border-2 border-black/[0.08] rounded-md focus:outline-none focus:border-[#7E43FF] focus:ring-2 focus:ring-[#7E43FF]/20 hover:border-[#7E43FF]/40 transition-colors flex-shrink-0"
                aria-label={`${m.homeTeam} goals`}
              />
              <span className="text-[#615E6E] font-bold text-xs">–</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={s?.away ?? ""}
                placeholder="-"
                onChange={(e) => onEdit(m.id, "away", Number(e.target.value))}
                className="w-9 h-9 text-center text-sm font-extrabold text-[#231645] bg-white border-2 border-black/[0.08] rounded-md focus:outline-none focus:border-[#7E43FF] focus:ring-2 focus:ring-[#7E43FF]/20 hover:border-[#7E43FF]/40 transition-colors flex-shrink-0"
                aria-label={`${m.awayTeam} goals`}
              />
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <Flag team={m.awayTeam} size="xs" />
                <span className="text-xs text-[#231645] font-semibold truncate">{m.awayTeam}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Standings . color-banded by qualification status */}
      <div className="px-1.5 py-2 bg-gradient-to-b from-[#faf9fe] to-white border-t border-black/[0.06]">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-[#615E6E] font-extrabold uppercase tracking-wider text-[8px]">
              <th className="text-left py-1 pl-2 pr-1 w-5">#</th>
              <th className="text-left py-1 pr-1">Team</th>
              <th className="text-center py-1 px-0.5 w-5">P</th>
              <th className="text-center py-1 px-0.5 w-5">W</th>
              <th className="text-center py-1 px-0.5 w-5">D</th>
              <th className="text-center py-1 px-0.5 w-5">L</th>
              <th className="text-center py-1 px-0.5 w-7">GD</th>
              <th className="text-right py-1 pl-1 pr-2 w-7">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => {
              const accent = i < 2 ? "#10b981" : i === 2 ? "#f59e0b" : "transparent"
              const rowBg  = i < 2 ? "rgba(16,185,129,0.06)" : i === 2 ? "rgba(245,158,11,0.06)" : "transparent"
              const numBg  = i < 2 ? "#10b981" : i === 2 ? "#f59e0b" : "#e5e3ee"
              const numFg  = i < 2 ? "#fff" : i === 2 ? "#fff" : "#615E6E"
              return (
                <tr
                  key={row.team}
                  className="border-t border-black/[0.04]"
                  style={{ background: rowBg, borderLeft: `3px solid ${accent}` }}
                >
                  <td className="py-1.5 pl-1 pr-1">
                    <span
                      className="inline-flex w-4 h-4 text-[9px] font-extrabold rounded-full items-center justify-center"
                      style={{ background: numBg, color: numFg }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-1.5 pr-1 min-w-0">
                    <span className="inline-flex items-center gap-1 align-middle min-w-0">
                      <Flag team={row.team} size="xs" />
                      <Link href={`/teams/${slug(row.team)}/`} className="font-bold text-[#231645] hover:underline truncate text-[11px]">
                        {row.team}
                      </Link>
                    </span>
                  </td>
                  <td className="text-center py-1.5 px-0.5 tabular-nums">{row.played}</td>
                  <td className="text-center py-1.5 px-0.5 tabular-nums">{row.won}</td>
                  <td className="text-center py-1.5 px-0.5 tabular-nums">{row.drawn}</td>
                  <td className="text-center py-1.5 px-0.5 tabular-nums">{row.lost}</td>
                  <td className="text-center py-1.5 px-0.5 tabular-nums">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td className="text-right py-1.5 pl-1 pr-2 font-extrabold text-[#231645] tabular-nums">{row.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ───── Best thirds panel ──────────────────────────────────────────────────

// Dark gradient banner header for the 3rd-place play-off and Final sections,
// matching the round-header style.
function FinalBanner({ title, accent, eyebrow }: { title: string; accent: string; eyebrow: string }) {
  return (
    <div
      className="rounded-2xl px-5 py-3 mb-4 flex items-center gap-4 text-white"
      style={{ background: `linear-gradient(135deg, #231645, ${accent})` }}
    >
      <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-base font-black leading-none">
        🏆
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/60 leading-none mb-0.5">{eyebrow}</p>
        <h3 className="text-base sm:text-lg font-extrabold leading-tight">{title}</h3>
      </div>
    </div>
  )
}

function ThirdsPanel({ qualifiers }: { qualifiers: Qualifier[] }) {
  const winners = qualifiers.filter((q) => q.position === 1).sort((a, b) => a.rank - b.rank)
  const runnersUp = qualifiers.filter((q) => q.position === 2).sort((a, b) => a.rank - b.rank)
  const thirds = qualifiers.filter((q) => q.position === 3).sort((a, b) => a.rank - b.rank)
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <QualifierColumn title="Group winners (12)" accent="#7E43FF" qualifiers={winners} />
      <QualifierColumn title="Runners-up (12)" accent="#231645" qualifiers={runnersUp} />
      <QualifierColumn title="Best 3rds (8)" accent="#eab308" qualifiers={thirds} />
    </div>
  )
}

function QualifierColumn({ title, accent, qualifiers }: { title: string; accent: string; qualifiers: Qualifier[] }) {
  return (
    <div className="rounded-2xl bg-white overflow-hidden border border-black/[0.04] shadow-[0_2px_12px_-4px_rgba(35,22,69,0.10)]">
      {/* Header bar with accent gradient */}
      <div
        className="px-4 py-3 flex items-center gap-3 text-white"
        style={{ background: `linear-gradient(135deg, #231645, ${accent})` }}
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center text-base font-black leading-none tabular-nums">
          {qualifiers.length}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/60 leading-none mb-0.5">Through</p>
          <h3 className="text-sm font-extrabold leading-tight truncate">{title}</h3>
        </div>
      </div>
      <ul className="divide-y divide-black/[0.04]">
        {qualifiers.map((q) => (
          <li key={`${q.source}-${q.team}`} className="flex items-center gap-2 text-sm px-4 py-2 hover:bg-[#faf9fe] transition-colors">
            <span
              className="w-9 text-center text-[10px] font-extrabold rounded px-1 py-0.5 flex-shrink-0"
              style={{ background: `${accent}18`, color: accent }}
            >
              {q.source}
            </span>
            <Flag team={q.team} size="xs" />
            <Link href={`/teams/${slug(q.team)}/`} className="font-semibold text-[#231645] hover:underline truncate flex-1 text-xs">
              {q.team}
            </Link>
            <span
              className="text-[10px] text-[#615E6E] tabular-nums whitespace-nowrap"
              title={`${q.pts} pts, ${q.gd >= 0 ? "+" : ""}${q.gd} GD, ${q.gf} GF`}
            >
              <span className="font-bold text-[#231645]">{q.pts}</span>p
              <span className="ml-1">{q.gd >= 0 ? "+" : ""}{q.gd}</span>
              <span className="opacity-40 mx-1">·</span>
              #{q.rank}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ───── Knockout round ─────────────────────────────────────────────────────

function KnockoutRound({
  title,
  matches,
  scores,
  onEdit,
  onET,
  onPens,
  onAuto,
}: {
  title: string
  matches: BracketMatch[]
  scores: ScoreMap
  onEdit: (id: string, side: "home" | "away", value: number) => void
  onET: (id: string, side: "home" | "away", value: number) => void
  onPens: (id: string, side: "home" | "away", value: number) => void
  onAuto: (m: BracketMatch) => void
}) {
  // Unified accent for all knockout round headers . keeps the page calm.
  const accent = "#7E43FF"
  const filled = matches.filter((m) => !!scores[m.id]).length
  return (
    <div className="mb-10">
      {/* Round banner . dark purple gradient, white text. Anchors the cards below. */}
      <div
        className="rounded-2xl px-5 py-3 mb-4 flex items-center gap-4 text-white"
        style={{ background: `linear-gradient(135deg, #231645, ${accent})` }}
      >
        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-lg font-black leading-none">
          {matches.length}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/60 leading-none mb-0.5">Knockout</p>
          <h3 className="text-base sm:text-lg font-extrabold leading-tight">{title}</h3>
        </div>
        <span
          className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{
            background: filled === matches.length ? "#10b981" : "rgba(255,255,255,0.18)",
            border: filled === matches.length ? "none" : "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {filled === matches.length ? "✓ Done" : `${filled}/${matches.length}`}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {matches.map((m) => (
          <KnockoutMatchCard
            key={m.id}
            match={m}
            score={scores[m.id]}
            accent={accent}
            onEdit={onEdit}
            onET={onET}
            onPens={onPens}
            onAuto={onAuto}
          />
        ))}
      </div>
    </div>
  )
}

// ───── Knockout match card ────────────────────────────────────────────────

function KnockoutMatchCard({
  match,
  score,
  accent,
  onEdit,
  onET,
  onPens,
  onAuto,
}: {
  match: BracketMatch
  score: ScoreEntry | undefined
  accent?: string
  onEdit: (id: string, side: "home" | "away", value: number) => void
  onET: (id: string, side: "home" | "away", value: number) => void
  onPens: (id: string, side: "home" | "away", value: number) => void
  onAuto: (m: BracketMatch) => void
}) {
  const placeholder = !match.home || !match.away
  const tied90 = score && score.home === score.away
  const totalH = (score?.home ?? 0) + (score?.et?.home ?? 0)
  const totalA = (score?.away ?? 0) + (score?.et?.away ?? 0)
  const tiedET = !!score?.et && totalH === totalA
  const winner = match.home && match.away ? knockoutWinner(match.home.team, match.away.team, score) : null
  const isHomeWinner = winner && match.home && winner === match.home.team
  const isAwayWinner = winner && match.away && winner === match.away.team

  const accentColor = accent ?? "#7E43FF"
  return (
    <div
      className="rounded-2xl bg-white overflow-hidden border border-black/[0.04] shadow-[0_2px_12px_-4px_rgba(35,22,69,0.12)]"
    >
      {/* Match number */}
      <div className="px-3 pt-2 pb-1">
        <span
          className="text-[9px] font-extrabold uppercase tracking-widest rounded px-1.5 py-0.5 tabular-nums inline-block"
          style={{ background: `${accentColor}15`, color: accentColor }}
        >
          M{match.matchNumber}
        </span>
      </div>

      {/* Teams + regulation score */}
      <div className="px-3 pb-3 flex items-center gap-1.5">
        <div
          className={`flex-1 flex items-center gap-1.5 min-w-0 justify-end text-right rounded-lg px-1.5 py-1 transition-colors ${isHomeWinner ? "" : winner ? "opacity-40" : ""}`}
          style={isHomeWinner ? { background: `${accentColor}10` } : undefined}
        >
          <span className="text-[10px] text-[#615E6E] tabular-nums">{match.home?.source ?? ""}</span>
          <span className="text-xs font-bold text-[#231645] truncate">{match.home?.team ?? "TBD"}</span>
          {match.home && <Flag team={match.home.team} size="xs" />}
        </div>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          disabled={placeholder}
          value={score?.home ?? ""}
          placeholder="-"
          onChange={(e) => onEdit(match.id, "home", Number(e.target.value))}
          className="w-9 h-9 text-center text-sm font-extrabold text-[#231645] bg-white border-2 border-black/[0.08] rounded-md focus:outline-none focus:border-[#7E43FF] focus:ring-2 focus:ring-[#7E43FF]/20 hover:border-[#7E43FF]/40 transition-colors disabled:opacity-30 flex-shrink-0"
          aria-label={`${match.home?.team ?? "Home"} goals`}
        />
        <span className="text-[#615E6E] font-bold text-xs">–</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          disabled={placeholder}
          value={score?.away ?? ""}
          placeholder="-"
          onChange={(e) => onEdit(match.id, "away", Number(e.target.value))}
          className="w-9 h-9 text-center text-sm font-extrabold text-[#231645] bg-white border-2 border-black/[0.08] rounded-md focus:outline-none focus:border-[#7E43FF] focus:ring-2 focus:ring-[#7E43FF]/20 hover:border-[#7E43FF]/40 transition-colors disabled:opacity-30 flex-shrink-0"
          aria-label={`${match.away?.team ?? "Away"} goals`}
        />
        <div
          className={`flex-1 flex items-center gap-1.5 min-w-0 rounded-lg px-1.5 py-1 transition-colors ${isAwayWinner ? "" : winner ? "opacity-40" : ""}`}
          style={isAwayWinner ? { background: `${accentColor}10` } : undefined}
        >
          {match.away && <Flag team={match.away.team} size="xs" />}
          <span className="text-xs font-bold text-[#231645] truncate">{match.away?.team ?? "TBD"}</span>
          <span className="text-[10px] text-[#615E6E] tabular-nums">{match.away?.source ?? ""}</span>
        </div>
      </div>

      {/* Extra time row (shown when regulation is a draw and both scores set) */}
      {!placeholder && score && tied90 && (
        <div className="mt-2 pt-2 border-t border-black/[0.05] flex items-center gap-2 text-xs text-[#615E6E]">
          <span className="flex-1 text-right font-extrabold uppercase tracking-widest">Extra time</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={10}
            value={score.et?.home ?? ""}
            placeholder="0"
            onChange={(e) => onET(match.id, "home", Number(e.target.value))}
            className="w-10 h-9 text-center text-base font-bold text-[#231645] bg-[#fbfaff] border border-black/[0.06] rounded-md focus:outline-none focus:border-[#7E43FF]"
          />
          <span>-</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={10}
            value={score.et?.away ?? ""}
            placeholder="0"
            onChange={(e) => onET(match.id, "away", Number(e.target.value))}
            className="w-10 h-9 text-center text-base font-bold text-[#231645] bg-[#fbfaff] border border-black/[0.06] rounded-md focus:outline-none focus:border-[#7E43FF]"
          />
          <span className="flex-1" />
        </div>
      )}

      {/* Penalty shootout row */}
      {!placeholder && score && tiedET && (
        <div className="mt-2 pt-2 border-t border-black/[0.05] flex items-center gap-2 text-xs text-[#615E6E]">
          <span className="flex-1 text-right font-extrabold uppercase tracking-widest">Penalties</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={score.pens?.home ?? ""}
            placeholder="0"
            onChange={(e) => onPens(match.id, "home", Number(e.target.value))}
            className="w-10 h-9 text-center text-base font-bold text-[#231645] bg-[#fbfaff] border border-black/[0.06] rounded-md focus:outline-none focus:border-[#7E43FF]"
          />
          <span>-</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={score.pens?.away ?? ""}
            placeholder="0"
            onChange={(e) => onPens(match.id, "away", Number(e.target.value))}
            className="w-10 h-9 text-center text-base font-bold text-[#231645] bg-[#fbfaff] border border-black/[0.06] rounded-md focus:outline-none focus:border-[#7E43FF]"
          />
          <span className="flex-1" />
        </div>
      )}

      {/* Auto-pick this match */}
      {!placeholder && (
        <div className="mt-2 flex items-center justify-between">
          {winner ? (
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF]">
              ► {winner} {score?.pens ? "(pens)" : score?.et ? "(AET)" : ""}
            </span>
          ) : (
            <span className="text-[10px] text-[#615E6E]">{tied90 ? "Tied - add ET goals" : "Set the score"}</span>
          )}
          <button
            onClick={() => onAuto(match)}
            className="text-[10px] font-bold text-[#615E6E] hover:text-[#7E43FF] uppercase tracking-widest"
            title="Auto-fill with the rating-favorite scoreline"
          >
            Auto-fill →
          </button>
        </div>
      )}

      {placeholder && (
        <p className="mt-2 text-[11px] text-[#615E6E] italic text-center">Awaiting earlier rounds</p>
      )}
    </div>
  )
}

// ───── Visual bracket tree (read-only summary) ────────────────────────────

const ROUND_BORDER: Record<string, string> = {
  "Round of 32":  "#3b82f6",
  "Round of 16":  "#10b981",
  "Quarterfinal": "#f59e0b",
  "Semi-final":   "#ef4444",
  "3rd Place":    "#94a3b8",
  "Final":        "#eab308",
}

function BracketCard({
  match,
  score,
  onEdit,
}: {
  match: BracketMatch
  score: ScoreEntry | undefined
  onEdit: (id: string, side: "home" | "away", value: number) => void
}) {
  const placeholder = !match.home || !match.away
  const winner = match.winner
  const isHomeWinner = winner && match.home && winner === match.home.team
  const isAwayWinner = winner && match.away && winner === match.away.team
  const border = "#7E43FF"
  // Tiebreaker indicator . when both regulation scores are entered but no winner
  // is computed, the match needs ET/pens (edit those in the form cards below).
  const regSet = score && typeof score.home === "number" && typeof score.away === "number"
  const tiedReg = regSet && score!.home === score!.away
  const decidedBy = winner && score?.pens ? "PEN" : winner && score?.et ? "AET" : null
  return (
    <div
      className="self-center rounded-md border bg-white px-2 py-1.5 text-[11px] leading-tight shadow-sm"
      style={{ borderLeft: `3px solid ${border}`, borderTopColor: "rgba(0,0,0,0.06)", borderRightColor: "rgba(0,0,0,0.06)", borderBottomColor: "rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] font-bold text-[#7E43FF] tabular-nums">M{match.matchNumber}</span>
        {decidedBy && (
          <span className="text-[8px] font-extrabold text-[#615E6E] tracking-widest">{decidedBy}</span>
        )}
        {tiedReg && !winner && (
          <span className="text-[8px] font-bold text-[#ef4444] tracking-widest" title="Regulation tied . set ET/pens in the form below">
            TIED
          </span>
        )}
      </div>
      <Row
        qualifier={match.home}
        placeholder={placeholder}
        dimmed={!!winner && !isHomeWinner}
        scoreValue={score?.home}
        onEdit={(v) => onEdit(match.id, "home", v)}
      />
      <Row
        qualifier={match.away}
        placeholder={placeholder}
        dimmed={!!winner && !isAwayWinner}
        scoreValue={score?.away}
        onEdit={(v) => onEdit(match.id, "away", v)}
      />
    </div>
  )
}

function Row({
  qualifier,
  placeholder,
  dimmed,
  scoreValue,
  onEdit,
}: {
  qualifier: Qualifier | null
  placeholder: boolean
  dimmed: boolean
  scoreValue: number | undefined
  onEdit: (value: number) => void
}) {
  return (
    <div className={`flex items-center gap-1.5 py-0.5 ${dimmed ? "opacity-40" : ""}`}>
      {qualifier ? (
        <Flag team={qualifier.team} size="xs" />
      ) : (
        <span className="inline-block w-[18px] h-[12px] bg-[#f5f4fa] rounded-sm flex-shrink-0" aria-hidden />
      )}
      <span className={`truncate flex-1 ${qualifier ? "text-[#231645] font-semibold" : "text-[#615E6E] italic"}`}>
        {qualifier?.team ?? (placeholder ? "TBD" : ".")}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={20}
        disabled={placeholder}
        value={scoreValue ?? ""}
        placeholder="-"
        onChange={(e) => onEdit(Number(e.target.value))}
        onClick={(e) => e.stopPropagation()}
        className="w-7 h-6 text-center text-[11px] font-bold text-[#231645] bg-[#f8f7fd] border border-black/[0.06] rounded focus:outline-none focus:border-[#7E43FF] focus:ring-1 focus:ring-[#7E43FF]/30 disabled:opacity-40 flex-shrink-0 tabular-nums"
        aria-label={`${qualifier?.team ?? "team"} goals`}
      />
    </div>
  )
}

function BracketView({
  bracket,
  scores,
  onEdit,
}: {
  bracket: Bracket
  scores: ScoreMap
  onEdit: (id: string, side: "home" | "away", value: number) => void
}) {
  // Classic FIFA bracket layout: upper half on the left, lower half on the right,
  // Final in the middle column, 3rd-place stacked under the Final.
  const upperR32 = bracket.r32.slice(0, 8)
  const lowerR32 = bracket.r32.slice(8, 16)
  const upperR16 = bracket.r16.slice(0, 4)
  const lowerR16 = bracket.r16.slice(4, 8)
  const upperQF  = bracket.qf.slice(0, 2)
  const lowerQF  = bracket.qf.slice(2, 4)
  const upperSF  = bracket.sf[0]
  const lowerSF  = bracket.sf[1]
  const ROW_H = 38

  // Pan / zoom state . fixed-viewport with internal transform so the page doesn't
  // scroll horizontally. Drag to pan, buttons for zoom in / out / fit / fullscreen.
  const [scale, setScale] = useState(0.7)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const dragRef = useRef<{ x: number; y: number; sx: number; sy: number } | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const clampScale = (s: number) => Math.max(0.3, Math.min(2.5, s))
  const zoomIn  = () => setScale((s) => clampScale(s * 1.2))
  const zoomOut = () => setScale((s) => clampScale(s / 1.2))
  const fit = () => {
    const vp = viewportRef.current
    const ct = contentRef.current
    if (!vp || !ct) { setScale(0.7); setTx(0); setTy(0); return }
    const padding = 24
    const sx = (vp.clientWidth - padding) / ct.scrollWidth
    const sy = (vp.clientHeight - padding) / ct.scrollHeight
    const s = clampScale(Math.min(sx, sy))
    setScale(s)
    setTx((vp.clientWidth - ct.scrollWidth * s) / 2)
    setTy((vp.clientHeight - ct.scrollHeight * s) / 2)
  }
  const enterFullscreen = () => {
    const vp = viewportRef.current?.parentElement
    if (!vp) return
    if (document.fullscreenElement) { document.exitFullscreen?.(); return }
    vp.requestFullscreen?.()
  }
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, sx: tx, sy: ty }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    setTx(dragRef.current.sx + (e.clientX - dragRef.current.x))
    setTy(dragRef.current.sy + (e.clientY - dragRef.current.y))
  }
  const onPointerUp = () => { dragRef.current = null }
  const onWheel = (e: React.WheelEvent) => {
    // Zoom toward cursor position on wheel
    e.preventDefault()
    const vp = viewportRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const next = clampScale(scale * (e.deltaY > 0 ? 1 / 1.1 : 1.1))
    // keep cursor point stationary: new_t = c - (c - t) * (next/scale)
    const k = next / scale
    setTx(cx - (cx - tx) * k)
    setTy(cy - (cy - ty) * k)
    setScale(next)
  }

  // Fit once on mount so the bracket lands centered.
  useEffect(() => {
    const id = window.setTimeout(fit, 50)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mb-8 rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_12px_-4px_rgba(35,22,69,0.10)] overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-black/[0.06] flex items-center gap-3 bg-[#faf9fe]">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF]">Bracket overview</span>
        <span className="text-[10px] text-[#615E6E] hidden sm:inline">drag to pan · scroll to zoom</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button onClick={zoomIn} aria-label="Zoom in" className="w-7 h-7 rounded-md bg-white border border-black/[0.08] text-[#231645] font-bold hover:border-[#7E43FF] hover:text-[#7E43FF] transition-colors">+</button>
          <button onClick={zoomOut} aria-label="Zoom out" className="w-7 h-7 rounded-md bg-white border border-black/[0.08] text-[#231645] font-bold hover:border-[#7E43FF] hover:text-[#7E43FF] transition-colors">−</button>
          <button onClick={fit} aria-label="Fit to view" className="h-7 px-2.5 rounded-md bg-white border border-black/[0.08] text-[#231645] text-[10px] font-bold uppercase tracking-widest hover:border-[#7E43FF] hover:text-[#7E43FF] transition-colors">Fit</button>
          <button onClick={enterFullscreen} aria-label="Fullscreen" className="w-7 h-7 rounded-md bg-white border border-black/[0.08] text-[#231645] hover:border-[#7E43FF] hover:text-[#7E43FF] transition-colors flex items-center justify-center" title="Fullscreen">⛶</button>
        </div>
      </div>

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none bg-[#faf9fe]"
        style={{ height: "min(600px, 70vh)" }}
      >
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            top: 0, left: 0,
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "fit-content",
          }}
        >
          <div
            className="grid gap-x-2 gap-y-1 p-3"
            style={{
              width: 1200,
              gridTemplateColumns: "minmax(120px,1fr) minmax(120px,1fr) minmax(120px,1fr) minmax(120px,1fr) minmax(140px,1.1fr) minmax(120px,1fr) minmax(120px,1fr) minmax(120px,1fr) minmax(120px,1fr)",
              gridTemplateRows: `repeat(8, minmax(${ROW_H}px, auto))`,
            }}
          >
          {/* ───── LEFT HALF ───── */}
          {/* Col 1: R32 upper, 8 matches, 1 row each */}
          {upperR32.map((m, i) => (
            <div key={m.id} className="grid" style={{ gridColumn: 1, gridRow: `${i + 1} / span 1` }}>
              <BracketCard match={m} score={scores[m.id]} onEdit={onEdit} />
            </div>
          ))}
          {/* Col 2: R16 upper, 4 matches, span 2 each */}
          {upperR16.map((m, i) => (
            <div key={m.id} className="grid" style={{ gridColumn: 2, gridRow: `${i * 2 + 1} / span 2` }}>
              <BracketCard match={m} score={scores[m.id]} onEdit={onEdit} />
            </div>
          ))}
          {/* Col 3: QF upper, 2 matches, span 4 each */}
          {upperQF.map((m, i) => (
            <div key={m.id} className="grid" style={{ gridColumn: 3, gridRow: `${i * 4 + 1} / span 4` }}>
              <BracketCard match={m} score={scores[m.id]} onEdit={onEdit} />
            </div>
          ))}
          {/* Col 4: SF upper, span all 8 rows */}
          {upperSF && (
            <div className="grid" style={{ gridColumn: 4, gridRow: "1 / span 8" }}>
              <BracketCard match={upperSF} score={scores[upperSF.id]} onEdit={onEdit} />
            </div>
          )}

          {/* ───── CENTER: FINAL + 3rd PLACE ───── */}
          <div className="grid" style={{ gridColumn: 5, gridRow: "1 / span 5" }}>
            <div className="self-center w-full">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#eab308] text-center mb-1">★ Final</div>
              <BracketCard match={bracket.final} score={scores[bracket.final.id]} onEdit={onEdit} />
            </div>
          </div>
          <div className="grid" style={{ gridColumn: 5, gridRow: "6 / span 3" }}>
            <div className="self-center w-full">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#94a3b8] text-center mb-1">3rd Place</div>
              <BracketCard match={bracket.third} score={scores[bracket.third.id]} onEdit={onEdit} />
            </div>
          </div>

          {/* ───── RIGHT HALF (mirrored) ───── */}
          {/* Col 6: SF lower */}
          {lowerSF && (
            <div className="grid" style={{ gridColumn: 6, gridRow: "1 / span 8" }}>
              <BracketCard match={lowerSF} score={scores[lowerSF.id]} onEdit={onEdit} />
            </div>
          )}
          {/* Col 7: QF lower, 2 matches */}
          {lowerQF.map((m, i) => (
            <div key={m.id} className="grid" style={{ gridColumn: 7, gridRow: `${i * 4 + 1} / span 4` }}>
              <BracketCard match={m} score={scores[m.id]} onEdit={onEdit} />
            </div>
          ))}
          {/* Col 8: R16 lower, 4 matches */}
          {lowerR16.map((m, i) => (
            <div key={m.id} className="grid" style={{ gridColumn: 8, gridRow: `${i * 2 + 1} / span 2` }}>
              <BracketCard match={m} score={scores[m.id]} onEdit={onEdit} />
            </div>
          ))}
          {/* Col 9: R32 lower, 8 matches */}
          {lowerR32.map((m, i) => (
            <div key={m.id} className="grid" style={{ gridColumn: 9, gridRow: `${i + 1} / span 1` }}>
              <BracketCard match={m} score={scores[m.id]} onEdit={onEdit} />
            </div>
          ))}
          </div>
        </div>
      </div>

      {bracket.champion && (
        <div className="px-4 py-3 border-t border-black/[0.06] bg-[#faf9fe] flex items-center justify-center gap-2 text-sm font-extrabold text-[#231645]">
          <span>🏆</span>
          <span className="text-[10px] uppercase tracking-widest text-[#615E6E]">Champion</span>
          <Flag team={bracket.champion} size="xs" />
          <span>{bracket.champion}</span>
        </div>
      )}
    </div>
  )
}

// Share controls shown under the crowned champion. The "Share image" button
// generates the personalized PNG card (native share sheet on mobile, download
// + clipboard caption on desktop). The platform buttons share the predictor
// link + a champion-personalized caption (these carry the page's preview image,
// not the custom card . see note in shareBracket above).
function ShareRow({ bracket }: { bracket: Bracket }) {
  const champ = bracket.champion ?? ""
  const url = "https://myworldcupguide.com/predictor/"
  const text = `My pick to win the 2026 World Cup: ${champ}. Build your own bracket:`
  const enc = encodeURIComponent
  const links = {
    x:        `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    reddit:   `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(`My World Cup 2026 prediction: ${champ} wins it all`)}`,
    whatsapp: `https://wa.me/?text=${enc(`${text} ${url}`)}`,
  }
  const platformBtn = "inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 transition-colors"
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => shareBracket(bracket)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#231645] text-sm font-bold hover:bg-white/90 transition-colors"
        title="Generate a shareable image of your bracket"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share image
      </button>
      <span className="text-[11px] text-white/70 px-1">or post the link:</span>
      <a href={links.x} target="_blank" rel="noopener noreferrer" className={platformBtn} aria-label="Share on X" title="Share on X (Twitter)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a href={links.facebook} target="_blank" rel="noopener noreferrer" className={platformBtn} aria-label="Share on Facebook" title="Share on Facebook">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href={links.reddit} target="_blank" rel="noopener noreferrer" className={platformBtn} aria-label="Share on Reddit" title="Share on Reddit">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
      </a>
      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className={platformBtn} aria-label="Share on WhatsApp" title="Share on WhatsApp">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
      </a>
    </div>
  )
}
