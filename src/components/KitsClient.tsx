"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { kits, kitImagePath, flagClass, flagCdnCode, type Kit } from "@/data/kits"

const VOTE_ENDPOINT = "/api/vote.php"
const SITE = "https://myworldcupguide.com"

type VoteCounts = Record<string, { up: number; down: number }>

// ───── Shareable kit-takes cards ───────────────────────────────────────────
// Two viral loops, both rendering a 1200x630 PNG client-side:
//   1. Personal: your Top 5 + Bottom 5 team kits.
//   2. Community: the live thumbs leaderboard ("the internet's verdict").
// Card is shared via the Web Share API on mobile or downloaded + caption copied
// on desktop, same pattern as the predictor bracket card.

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous" // flagcdn sends ACAO:* so the canvas stays untainted
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startPx: number, weight = ""): number {
  let size = startPx
  ctx.font = `${weight} ${size}px Arial, sans-serif`
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 1
    ctx.font = `${weight} ${size}px Arial, sans-serif`
  }
  return size
}

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
  setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300) }, 3500)
}

type CardRow = { iso3: string; label: string; sub?: string }

// Draws a "TOP 5 / BOTTOM 5" two-column card and shares/downloads it.
async function shareTakesCard(opts: {
  title: string
  top: CardRow[]
  bottom: CardRow[]
  caption: string
  filename: string
  footer: string
}) {
  const W = 1200, H = 630
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, "#231645")
  grad.addColorStop(1, "#4f1ea1")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Title
  ctx.textAlign = "center"
  ctx.fillStyle = "#ffffff"
  fitFont(ctx, opts.title, W - 120, 40, "bold")
  ctx.fillText(opts.title, W / 2, 70)

  // Column headers
  const colW = W / 2
  ctx.font = "bold 30px Arial, sans-serif"
  ctx.fillStyle = "#3ddc84"
  ctx.fillText("👍  TOP 5", colW / 2, 138)
  ctx.fillStyle = "#ff6b6b"
  ctx.fillText("👎  BOTTOM 5", colW + colW / 2, 138)

  // Pre-load all flags in parallel
  const all = [...opts.top, ...opts.bottom]
  const flags = await Promise.all(
    all.map((r) => {
      const code = flagCdnCode(r.iso3)
      return code ? loadImg(`https://flagcdn.com/w80/${code}.png`) : Promise.resolve(null)
    }),
  )
  const flagFor = new Map<string, HTMLImageElement | null>()
  all.forEach((r, i) => { if (!flagFor.has(r.iso3)) flagFor.set(r.iso3, flags[i]) })

  const rowH = 76
  const startY = 180
  const drawColumn = (rows: CardRow[], cx: number) => {
    ctx.textAlign = "left"
    const flagW = 54
    const flagH = 36
    const numX = cx - colW / 2 + 34
    const flagX = numX + 34
    const textX = flagX + flagW + 18
    rows.forEach((r, i) => {
      const y = startY + i * rowH
      // rank number
      ctx.fillStyle = "rgba(255,255,255,0.45)"
      ctx.font = "bold 30px Arial, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(String(i + 1), numX, y + 8)
      // flag
      const img = flagFor.get(r.iso3)
      if (img && img.width > 0) {
        ctx.save()
        ctx.shadowColor = "rgba(0,0,0,0.35)"
        ctx.shadowBlur = 8
        ctx.drawImage(img, flagX, y - flagH / 2 - 2, flagW, flagH)
        ctx.restore()
      }
      // label (+ optional sub)
      ctx.textAlign = "left"
      ctx.fillStyle = "#ffffff"
      const maxText = colW / 2 + 80
      const size = fitFont(ctx, r.label, maxText, 26, "bold")
      ctx.font = `bold ${size}px Arial, sans-serif`
      ctx.fillText(r.label, textX, y + (r.sub ? -2 : 6))
      if (r.sub) {
        ctx.fillStyle = "rgba(255,255,255,0.55)"
        ctx.font = "600 15px Arial, sans-serif"
        ctx.fillText(r.sub, textX, y + 18)
      }
    })
  }
  drawColumn(opts.top, colW / 2)
  drawColumn(opts.bottom, colW + colW / 2)

  // divider
  ctx.strokeStyle = "rgba(255,255,255,0.15)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(colW, 110)
  ctx.lineTo(colW, H - 70)
  ctx.stroke()

  // Footer CTA
  ctx.textAlign = "center"
  ctx.fillStyle = "#c4a8ff"
  ctx.font = "bold 25px Arial, sans-serif"
  ctx.fillText(opts.footer, W / 2, H - 28)

  canvas.toBlob(async (blob) => {
    if (!blob) return
    const file = new File([blob], opts.filename, { type: "image/png" })

    // ALWAYS download the file. Native share sheets on Windows desktop don't list
    // Reddit/X/etc., and users end up unable to actually post the card. The file
    // in Downloads + image on clipboard combo is the most reliable cross-platform path.
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = opts.filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    // Put the image (and caption as a fallback text representation) on the clipboard
    // so the user can paste directly into Reddit's image uploader with Ctrl+V.
    let imageOnClipboard = false
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        const captionBlob = new Blob([opts.caption], { type: "text/plain" })
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob, "text/plain": captionBlob }),
        ])
        imageOnClipboard = true
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(opts.caption)
      }
    } catch { /* clipboard blocked . file download is still the safety net */ }

    // On mobile, also offer the native share sheet where it actually includes useful apps.
    const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: opts.title, text: opts.caption }) } catch { /* user cancelled */ }
    }

    showToast(imageOnClipboard
      ? "Saved to Downloads + image copied. Paste (Ctrl+V) straight into Reddit."
      : "Saved to Downloads. Drag the file into Reddit's upload area when you post.")
  }, "image/png")
}

const GROUP_TABS = ["All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const
type GroupTab = typeof GROUP_TABS[number]

// Buy-this-kit link. Until you sign up to Awin and get your own affiliate ID
// + plug it in via NEXT_PUBLIC_AWIN_AFFID, we fall back to a generic search
// that still earns nothing but at least points somewhere relevant.
const AWIN_AFFID = process.env.NEXT_PUBLIC_AWIN_AFFID || ""
function buyUrl(kit: Kit, side: "home" | "away"): string {
  const mid = side === "home" ? kit.buyHomeMid : kit.buyAwayMid
  if (AWIN_AFFID && mid) {
    // Awin click URL . user-provided merchant IDs route to the real retailer
    return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${AWIN_AFFID}&clickref=mywcg-kits&campaign=`
  }
  // Fallback: Amazon search for "{team} 2026 {home|away} kit"
  const q = encodeURIComponent(`${kit.team} 2026 ${side} kit jersey`)
  return `https://www.amazon.com/s?k=${q}`
}

export default function KitsClient() {
  const [activeGroup, setActiveGroup] = useState<GroupTab>("All")
  const [counts, setCounts] = useState<VoteCounts>({})
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const [topPicks, setTopPicks] = useState<string[]>([])
  const [bottomPicks, setBottomPicks] = useState<string[]>([])
  const [picksHydrated, setPicksHydrated] = useState(false)
  const [zoom, setZoom] = useState<{ kit: Kit; side: "home" | "away" } | null>(null)

  // Hydrate vote counts from backend on mount
  useEffect(() => {
    // Load locally-remembered votes first (sync), then reconcile against the server.
    let localVoted = new Set<string>()
    try {
      const raw = localStorage.getItem("mywcg-kit-votes")
      if (raw) localVoted = new Set<string>(JSON.parse(raw))
    } catch { /* ignore */ }

    // Load existing personal picks. Picks are shirt keys (e.g. "BIH_home");
    // drop anything that doesn't match (old chip-picker data was iso3-only).
    const validShirt = (x: unknown): x is string => typeof x === "string" && /^[A-Z]{3}_(home|away)$/.test(x)
    let localTop: string[] = []
    let localBottom: string[] = []
    try {
      const raw = localStorage.getItem("mywcg-kit-picks")
      if (raw) {
        const p = JSON.parse(raw)
        if (Array.isArray(p?.top)) localTop = p.top.filter(validShirt).slice(0, 5)
        if (Array.isArray(p?.bottom)) localBottom = p.bottom.filter(validShirt).slice(0, 5)
      }
    } catch { /* ignore */ }

    fetch(VOTE_ENDPOINT, { method: "GET" })
      .then((r) => r.json())
      .then((d) => {
        const counts: VoteCounts = (d?.counts && !Array.isArray(d.counts)) ? d.counts : {}
        setCounts(counts)
        // Self-heal: drop any locally-remembered vote the server has no record of.
        // These are votes lost to the earlier www/CORS bug or a counter reset . if we
        // keep them, the button stays "voted" (disabled) at a count of 0 and the user
        // can never make their vote actually register. Pruning re-enables the button.
        const pruned = new Set<string>(
          [...localVoted].filter((vk) => {
            const m = vk.match(/^([A-Z]{3}_(?:home|away))_(up|down)$/)
            if (!m) return false
            const c = counts[m[1]]
            return !!c && (c as Record<string, number>)[m[2]] > 0
          }),
        )
        setVoted(pruned)
        try { localStorage.setItem("mywcg-kit-votes", JSON.stringify(Array.from(pruned))) } catch { /* ignore */ }

        // Backfill picks from past votes. Users who voted before the auto-fill code
        // shipped (or whose picks list was cleared) would otherwise see locked thumbs
        // with empty Top 5 / Bottom 5 slots and no way to fix it. Walk every persisted
        // vote and drop it into the matching picks list if there's room.
        const topSet = new Set(localTop)
        const bottomSet = new Set(localBottom)
        let backfilledTop = [...localTop]
        let backfilledBottom = [...localBottom]
        for (const vk of pruned) {
          const m = vk.match(/^([A-Z]{3}_(?:home|away))_(up|down)$/)
          if (!m) continue
          const shirtKey = m[1]
          const dir = m[2]
          if (dir === "up" && !topSet.has(shirtKey) && !bottomSet.has(shirtKey) && backfilledTop.length < 5) {
            backfilledTop = [...backfilledTop, shirtKey]
            topSet.add(shirtKey)
          } else if (dir === "down" && !bottomSet.has(shirtKey) && !topSet.has(shirtKey) && backfilledBottom.length < 5) {
            backfilledBottom = [...backfilledBottom, shirtKey]
            bottomSet.add(shirtKey)
          }
        }
        setTopPicks(backfilledTop)
        setBottomPicks(backfilledBottom)
        try { localStorage.setItem("mywcg-kit-picks", JSON.stringify({ top: backfilledTop, bottom: backfilledBottom })) } catch { /* ignore */ }
      })
      .catch(() => {
        // Offline . keep local marks and picks unchanged.
        setVoted(localVoted)
        setTopPicks(localTop)
        setBottomPicks(localBottom)
      })

    setPicksHydrated(true)
  }, [])

  // Persist personal picks
  useEffect(() => {
    if (!picksHydrated) return
    try { localStorage.setItem("mywcg-kit-picks", JSON.stringify({ top: topPicks, bottom: bottomPicks })) } catch {}
  }, [topPicks, bottomPicks, picksHydrated])

  const filtered = useMemo(() => {
    const list = activeGroup === "All" ? kits : kits.filter((k) => k.group === activeGroup)
    return [...list].sort((a, b) => a.team.localeCompare(b.team))
  }, [activeGroup])

  async function castVote(kit: Kit, side: "home" | "away", direction: "up" | "down") {
    const id = `${kit.iso3}_${side}`
    const voteKey = `${id}_${direction}`
    if (voted.has(voteKey)) return // already cast this vote on this device

    // Optimistic update
    setCounts((prev) => {
      const cur = prev[id] ?? { up: 0, down: 0 }
      return { ...prev, [id]: { ...cur, [direction]: cur[direction] + 1 } }
    })
    const nextVoted = new Set(voted)
    nextVoted.add(voteKey)
    setVoted(nextVoted)
    try { localStorage.setItem("mywcg-kit-votes", JSON.stringify(Array.from(nextVoted))) } catch {}

    // Feed the personal Top 5 / Bottom 5 card. A 👍 makes the shirt a top pick,
    // a 👎 a bottom pick (capped at 5 each; the community vote still always counts).
    if (direction === "up") {
      if (!topPicks.includes(id) && topPicks.length >= 5) {
        showToast("Your Top 5 is full . remove one to feature this kit.")
      }
      setTopPicks((prev) => (prev.includes(id) || prev.length >= 5 ? prev : [...prev, id]))
      setBottomPicks((prev) => prev.filter((x) => x !== id))
    } else {
      if (!bottomPicks.includes(id) && bottomPicks.length >= 5) {
        showToast("Your Bottom 5 is full . remove one to feature this kit.")
      }
      setBottomPicks((prev) => (prev.includes(id) || prev.length >= 5 ? prev : [...prev, id]))
      setTopPicks((prev) => prev.filter((x) => x !== id))
    }

    // POST to backend; on success, replace with authoritative count
    try {
      const res = await fetch(VOTE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      })
      const data = await res.json()
      // Adopt the server's authoritative count, but never below the optimistic
      // value the user just saw (a "duplicate" reply must not snap the count to 0).
      if (data?.ok && data.counts && !data.duplicate) {
        setCounts((prev) => ({ ...prev, [id]: data.counts }))
      }
    } catch {
      // Network failure . leave the optimistic value, user still sees their click
    }
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-20">
      {/* Header */}
      <div className="text-center px-6 mb-8">
        <div className="pill inline-flex mb-5">Kits 2026</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-2">
          Rank the World Cup 2026 Kits
        </h1>
        <p className="text-[#615E6E] text-sm max-w-2xl mx-auto">
          Vote thumbs-up or thumbs-down on every home and away shirt at the 2026 World Cup. Hover any shirt to see the back.
        </p>
      </div>

      {/* Shareable kit takes */}
      <ShareTakes
        counts={counts}
        topPicks={topPicks}
        bottomPicks={bottomPicks}
        setTopPicks={setTopPicks}
        setBottomPicks={setBottomPicks}
      />

      {/* Group filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 px-6 mb-8 max-w-4xl mx-auto">
        {GROUP_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveGroup(tab)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={
              activeGroup === tab
                ? { background: "#231645", color: "#ffffff" }
                : { background: "#f5f4fa", color: "#615E6E" }
            }
          >
            {tab === "All" ? "All groups" : `Group ${tab}`}
          </button>
        ))}
      </div>

      {/* Cards grid . auto-rows-fr stretches every card in a row to the same height */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
        {filtered.map((kit) => (
          <KitCard
            key={kit.iso3}
            kit={kit}
            counts={counts}
            voted={voted}
            onVote={castVote}
            onZoom={(side) => setZoom({ kit, side })}
          />
        ))}
      </div>

      {zoom && <ZoomModal kit={zoom.kit} initialSide={zoom.side} onClose={() => setZoom(null)} />}
    </div>
  )
}

// ───── Share-takes panel ───────────────────────────────────────────────────

// Picks are shirt keys like "BIH_home". Resolve to a display team name + side.
function parseShirt(key: string): { iso3: string; team: string; side: "home" | "away" } | null {
  const m = key.match(/^([A-Z]{3})_(home|away)$/)
  if (!m) return null
  const iso3 = m[1]
  const side = m[2] as "home" | "away"
  const team = kits.find((k) => k.iso3 === iso3)?.team ?? iso3
  return { iso3, team, side }
}

function ShareTakes({
  counts,
  topPicks,
  bottomPicks,
  setTopPicks,
  setBottomPicks,
}: {
  counts: VoteCounts
  topPicks: string[]
  bottomPicks: string[]
  setTopPicks: (f: (prev: string[]) => string[]) => void
  setBottomPicks: (f: (prev: string[]) => string[]) => void
}) {
  const [mode, setMode] = useState<"personal" | "community">("personal")

  function sharePersonal() {
    if (!topPicks.length && !bottomPicks.length) {
      showToast("Vote 👍 / 👎 on the shirts below to build your card first.")
      return
    }
    const toRows = (keys: string[]) =>
      keys.map((k) => {
        const s = parseShirt(k)
        return s ? { iso3: s.iso3, label: s.team, sub: s.side === "home" ? "Home" : "Away" } : null
      }).filter((x): x is { iso3: string; label: string; sub: string } => !!x)
    const top = toRows(topPicks)
    const bottom = toRows(bottomPicks)
    const best = top[0]
    const worst = bottom[0]
    const caption =
      `My World Cup 2026 kit rankings 👕` +
      (best ? `\n\nFavourite: ${best.label} (${best.sub}).` : "") +
      (worst ? ` Worst: ${worst.label} (${worst.sub}).` : "") +
      `\n\nRank yours 👉 ${SITE}/kits`
    shareTakesCard({
      title: "MY WORLD CUP 2026 KIT RANKINGS",
      top, bottom, caption,
      filename: "my-wc2026-kits.png",
      footer: "Rank yours  →  myworldcupguide.com/kits",
    })
  }

  // Live leaderboard across all 96 shirts (home + away per team).
  const leaderboard = useMemo(() => {
    const entries = kits.flatMap((k) =>
      (["home", "away"] as const).map((side) => {
        const c = counts[`${k.iso3}_${side}`] ?? { up: 0, down: 0 }
        return { iso3: k.iso3, team: k.team, side, score: c.up - c.down, total: c.up + c.down }
      }),
    )
    const voted = entries.filter((e) => e.total > 0)
    const byBest = [...voted].sort((a, b) => b.score - a.score || b.total - a.total)
    const byWorst = [...voted].sort((a, b) => a.score - b.score || b.total - a.total)
    return { top: byBest.slice(0, 5), bottom: byWorst.slice(0, 5), totalVoted: voted.length }
  }, [counts])

  function shareCommunity() {
    if (leaderboard.totalVoted < 2) {
      showToast("Not enough votes yet . cast a few thumbs first.")
      return
    }
    const fmt = (s: number) => (s > 0 ? `+${s}` : String(s))
    const top = leaderboard.top.map((e) => ({
      iso3: e.iso3, label: e.team, sub: `${e.side === "home" ? "Home" : "Away"} · ${fmt(e.score)}`,
    }))
    const bottom = leaderboard.bottom.map((e) => ({
      iso3: e.iso3, label: e.team, sub: `${e.side === "home" ? "Home" : "Away"} · ${fmt(e.score)}`,
    }))
    const bestTeam = leaderboard.top[0]
    const worstTeam = leaderboard.bottom[0]
    const caption =
      `The internet has spoken on the World Cup 2026 kits 👕\n\nBest: ${bestTeam.team} (${bestTeam.side}). Worst: ${worstTeam.team} (${worstTeam.side}).\n\nVote 👉 ${SITE}/kits`
    shareTakesCard({
      title: "THE INTERNET'S WORLD CUP 2026 KIT VERDICT",
      top, bottom, caption,
      filename: "wc2026-kit-verdict.png",
      footer: "Cast your vote  →  myworldcupguide.com/kits",
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-6 mb-10">
      <div className="card overflow-hidden">
        {/* Mode tabs */}
        <div className="flex border-b border-black/[0.06]">
          {(["personal", "community"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-3 text-sm font-bold transition-colors"
              style={mode === m
                ? { background: "#231645", color: "#fff" }
                : { background: "#fff", color: "#615E6E" }}
            >
              {m === "personal" ? "Build my Top 5 / Bottom 5" : "The internet's verdict"}
            </button>
          ))}
        </div>

        {mode === "personal" ? (
          <div className="p-5">
            <p className="text-center text-xs text-[#615E6E] mb-4">
              Vote 👍 / 👎 on the shirts below and they fill your Top 5 and Bottom 5 automatically. Tap × to drop a pick.
            </p>
            {/* Auto-filled slots, driven by your thumbs votes */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <PickColumn title="👍 Top 5" accent="#10b981" picks={topPicks}
                onRemove={(key) => setTopPicks((p) => p.filter((x) => x !== key))} />
              <PickColumn title="👎 Bottom 5" accent="#ef4444" picks={bottomPicks}
                onRemove={(key) => setBottomPicks((p) => p.filter((x) => x !== key))} />
            </div>

            <div className="flex flex-col items-center">
              <button onClick={sharePersonal}
                className="px-6 py-3 rounded-xl text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#7E43FF,#231645)" }}>
                Download my kit card 📥
              </button>
              <PlatformShare
                redditTitle="Ranked every 2026 World Cup kit. My top 5 and bottom 5, come fight me"
                shortText={(() => {
                  const best = topPicks[0] ? parseShirt(topPicks[0]) : null
                  const worst = bottomPicks[0] ? parseShirt(bottomPicks[0]) : null
                  const b = best ? `Best: ${best.team} (${best.side}).` : ""
                  const w = worst ? ` Worst: ${worst.team} (${worst.side}).` : ""
                  return `My 2026 World Cup kit rankings 👕 ${b}${w}`.trim()
                })()}
                fullCaption={(() => {
                  const best = topPicks[0] ? parseShirt(topPicks[0]) : null
                  const worst = bottomPicks[0] ? parseShirt(bottomPicks[0]) : null
                  const b = best ? `Favourite: ${best.team} (${best.side}).` : ""
                  const w = worst ? ` Worst: ${worst.team} (${worst.side}).` : ""
                  return `My World Cup 2026 kit rankings 👕 ${b}${w} Build yours 👇`.trim()
                })()}
              />
            </div>
          </div>
        ) : (
          <div className="p-5">
            {leaderboard.totalVoted < 2 ? (
              <p className="text-center text-sm text-[#615E6E] py-6">
                Not enough votes yet. Cast a few thumbs below and the live Top 5 / Bottom 5 fills in here.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <LeaderColumn title="👍 Top 5" accent="#10b981" rows={leaderboard.top} />
                  <LeaderColumn title="👎 Bottom 5" accent="#ef4444" rows={leaderboard.bottom} />
                </div>
                <div className="flex flex-col items-center">
                  <button onClick={shareCommunity}
                    className="px-6 py-3 rounded-xl text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg,#7E43FF,#231645)" }}>
                    Download the verdict 📥
                  </button>
                  <PlatformShare
                    redditTitle="The internet's verdict on every 2026 World Cup kit"
                    shortText={(() => {
                      const b = leaderboard.top[0]; const w = leaderboard.bottom[0]
                      const bs = b ? `Best: ${b.team} (${b.side}).` : ""
                      const ws = w ? ` Worst: ${w.team} (${w.side}).` : ""
                      return `The internet has spoken on the WC 2026 kits 👕 ${bs}${ws}`.trim()
                    })()}
                    fullCaption={(() => {
                      const b = leaderboard.top[0]; const w = leaderboard.bottom[0]
                      const bs = b ? `Best: ${b.team} (${b.side}).` : ""
                      const ws = w ? ` Worst: ${w.team} (${w.side}).` : ""
                      return `The internet's verdict on World Cup 2026 kits 👕 ${bs}${ws} Cast your vote 👇`.trim()
                    })()}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Platform-specific share buttons. Web intent URLs share text + URL only (no image),
// so the user still attaches the downloaded PNG from Downloads / their clipboard.
function PlatformShare({
  redditTitle,
  shortText,
  fullCaption,
}: {
  redditTitle: string
  shortText: string  // X has a 280 char limit; keep this terse
  fullCaption: string
}) {
  const url = `${SITE}/kits`
  const enc = encodeURIComponent
  const links = {
    x:        `https://twitter.com/intent/tweet?text=${enc(shortText)}&url=${enc(url)}`,
    reddit:   `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(redditTitle)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    whatsapp: `https://wa.me/?text=${enc(`${fullCaption} ${url}`)}`,
    threads:  `https://www.threads.net/intent/post?text=${enc(`${fullCaption} ${url}`)}`,
  } as const

  const btn = (href: string, label: string, bg: string) => (
    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
      style={{ background: bg }}>
      {label}
    </a>
  )

  return (
    <div className="flex flex-col items-center gap-2 mt-3 pt-3 border-t border-black/[0.05] w-full">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">Post to</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {btn(links.reddit,   "Reddit",   "#ff4500")}
        {btn(links.x,        "𝕏",        "#000000")}
        {btn(links.facebook, "Facebook", "#1877f2")}
        {btn(links.whatsapp, "WhatsApp", "#25d366")}
        {btn(links.threads,  "Threads",  "#231645")}
      </div>
      <p className="text-[10px] text-[#615E6E] mt-1 text-center max-w-xs leading-snug">
        Opens the post composer pre-filled. Attach the downloaded image (it&apos;s in your Downloads folder, or paste with Ctrl+V).
      </p>
    </div>
  )
}

function PickColumn({
  title, accent, picks, onRemove,
}: {
  title: string; accent: string; picks: string[]
  onRemove: (key: string) => void
}) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: accent }}>{title}</p>
      <div className="space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const key = picks[i]
          const shirt = key ? parseShirt(key) : null
          return (
            <div key={i} className="flex items-center gap-2 h-8 px-2 rounded-lg text-sm"
              style={{ background: key ? "#faf9fe" : "#f5f4fa", border: "1px solid rgba(0,0,0,0.04)" }}>
              <span className="text-[10px] font-bold w-3 text-[#615E6E]">{i + 1}</span>
              {shirt ? (
                <>
                  <span className={flagClass(shirt.iso3)} style={{ fontSize: "1em" }} aria-hidden />
                  <span className="font-semibold text-[#231645] truncate flex-1">
                    {shirt.team} <span className="text-[#615E6E] font-normal text-xs">{shirt.side === "home" ? "home" : "away"}</span>
                  </span>
                  <button onClick={() => onRemove(key)} aria-label={`Remove ${shirt.team} ${shirt.side}`}
                    className="text-[#615E6E] hover:text-[#ef4444] font-bold px-1">×</button>
                </>
              ) : (
                <span className="text-[#615E6E] opacity-50 text-xs italic">empty</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LeaderColumn({
  title, accent, rows,
}: {
  title: string; accent: string
  rows: { iso3: string; team: string; side: "home" | "away"; score: number }[]
}) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: accent }}>{title}</p>
      <div className="space-y-1.5">
        {rows.map((e, i) => (
          <div key={`${e.iso3}_${e.side}`} className="flex items-center gap-2 h-8 px-2 rounded-lg text-sm"
            style={{ background: "#faf9fe", border: "1px solid rgba(0,0,0,0.04)" }}>
            <span className="text-[10px] font-bold w-3 text-[#615E6E]">{i + 1}</span>
            <span className={flagClass(e.iso3)} style={{ fontSize: "1em" }} aria-hidden />
            <span className="font-semibold text-[#231645] truncate flex-1">
              {e.team} <span className="text-[#615E6E] font-normal text-xs">{e.side}</span>
            </span>
            <span className="tabular-nums font-bold text-xs" style={{ color: accent }}>
              {e.score > 0 ? `+${e.score}` : e.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function KitCard({
  kit,
  counts,
  voted,
  onVote,
  onZoom,
}: {
  kit: Kit
  counts: VoteCounts
  voted: Set<string>
  onVote: (kit: Kit, side: "home" | "away", direction: "up" | "down") => void
  onZoom: (side: "home" | "away") => void
}) {
  const homeCounts = counts[`${kit.iso3}_home`] ?? { up: 0, down: 0 }
  const awayCounts = counts[`${kit.iso3}_away`] ?? { up: 0, down: 0 }
  return (
    <article className="card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-black/[0.06]" style={{ borderTop: "4px solid #ef4444" }}>
        <span className={flagClass(kit.iso3)} style={{ fontSize: "1.5em", flexShrink: 0 }} aria-hidden />
        <h2 className="text-lg font-extrabold text-[#231645] flex-1 truncate">{kit.team}</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E] bg-[#f5f4fa] px-2 py-0.5 rounded-full">
          Group {kit.group}
        </span>
      </div>

      {/* Blurb . clamped to 4 lines so every card has the same blurb height */}
      <p
        className="px-5 py-4 text-sm text-[#615E6E] leading-relaxed"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "7.5rem",
        }}
      >
        {kit.blurb || (
          <span className="italic opacity-70">{kit.team} kit review coming soon. Vote on the design below.</span>
        )}
      </p>

      {/* Kit images side-by-side, fixed-height area so shirts align baselines */}
      <div className="grid grid-cols-2 gap-3 px-5">
        <KitImagePair kit={kit} side="home" onZoom={() => onZoom("home")} />
        <KitImagePair kit={kit} side="away" onZoom={() => onZoom("away")} />
      </div>

      {/* Vote buttons row . 4 buttons (home-up, home-down, away-up, away-down) */}
      <div className="px-5 py-4 grid grid-cols-4 gap-2">
        <VoteButton
          label="👍"
          count={homeCounts.up}
          active={voted.has(`${kit.iso3}_home_up`)}
          onClick={() => onVote(kit, "home", "up")}
          ariaLabel={`Thumbs up for ${kit.team} home kit`}
        />
        <VoteButton
          label="👎"
          count={homeCounts.down}
          active={voted.has(`${kit.iso3}_home_down`)}
          onClick={() => onVote(kit, "home", "down")}
          ariaLabel={`Thumbs down for ${kit.team} home kit`}
        />
        <VoteButton
          label="👍"
          count={awayCounts.up}
          active={voted.has(`${kit.iso3}_away_up`)}
          onClick={() => onVote(kit, "away", "up")}
          ariaLabel={`Thumbs up for ${kit.team} away kit`}
        />
        <VoteButton
          label="👎"
          count={awayCounts.down}
          active={voted.has(`${kit.iso3}_away_down`)}
          onClick={() => onVote(kit, "away", "down")}
          ariaLabel={`Thumbs down for ${kit.team} away kit`}
        />
      </div>

      {/* Footer with buy-this-kit links */}
      <div className="px-5 py-3 border-t border-black/[0.06] flex items-center gap-3 mt-auto">
        <span className="text-xs text-[#615E6E] mr-auto">Buy this kit</span>
        <a
          href={buyUrl(kit, "home")}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="text-xs font-bold text-white px-3 py-1.5 rounded-md transition-colors"
          style={{ background: "#231645" }}
        >
          Home
        </a>
        <a
          href={buyUrl(kit, "away")}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="text-xs font-bold text-white px-3 py-1.5 rounded-md transition-colors"
          style={{ background: "#231645" }}
        >
          Away
        </a>
      </div>
    </article>
  )
}

function VoteButton({
  label,
  count,
  active,
  onClick,
  ariaLabel,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  ariaLabel: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={active}
      aria-label={ariaLabel}
      className="flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-bold transition-all border"
      style={
        active
          ? { background: "#7E43FF", color: "#fff", borderColor: "#7E43FF", cursor: "default" }
          : { background: "#fff", color: "#231645", borderColor: "rgba(0,0,0,0.08)" }
      }
    >
      <span>{label}</span>
      <span className="tabular-nums">{count.toLocaleString()}</span>
    </button>
  )
}

// Crossfades between front and back kit images on hover. Falls back to a
// "Not yet released" placeholder if the file is missing.
//
// Images are anchored to the bottom of the container (object-bottom) so that
// shirts always stand on the same baseline regardless of how the source image
// was cropped. Without this, taller and shorter source images render at wildly
// different vertical positions and the row looks jagged.
function KitImagePair({ kit, side, onZoom }: { kit: Kit; side: "home" | "away"; onZoom: () => void }) {
  const front = kitImagePath(kit, side, "front")
  const back  = kitImagePath(kit, side, "back")
  const [frontOk, setFrontOk] = useState(true)
  const [backOk,  setBackOk]  = useState(true)
  return (
    <button
      type="button"
      onClick={onZoom}
      aria-label={`Zoom ${kit.team} ${side} kit`}
      className="relative w-full bg-[#f8f7fd] rounded-md overflow-hidden group cursor-zoom-in p-0 border-0"
      style={{ height: "220px" }}
    >
      <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white px-2 py-0.5 rounded">
        {side === "home" ? "Home" : "Away"}
      </span>
      <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>
        🔍
      </span>
      {frontOk ? (
        <Image
          src={front}
          alt={`${kit.team} ${side} kit front`}
          fill
          sizes="(max-width: 768px) 50vw, 220px"
          style={{ objectFit: "cover", objectPosition: "center center" }}
          className="transition-opacity duration-300 group-hover:opacity-0"
          unoptimized
          onError={() => setFrontOk(false)}
        />
      ) : (
        <KitPlaceholder team={kit.team} side={side} />
      )}
      {frontOk && backOk && (
        <Image
          src={back}
          alt={`${kit.team} ${side} kit back`}
          fill
          sizes="(max-width: 768px) 50vw, 220px"
          style={{ objectFit: "cover", objectPosition: "center center" }}
          className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          unoptimized
          onError={() => setBackOk(false)}
        />
      )}
    </button>
  )
}

// Click-to-zoom lightbox. Shows the selected shirt at native resolution (up to
// ~600px wide per our image-optimization pipeline), with front/back/home/away
// toggles so users can inspect detail without leaving the grid.
function ZoomModal({
  kit,
  initialSide,
  onClose,
}: {
  kit: Kit
  initialSide: "home" | "away"
  onClose: () => void
}) {
  const [side, setSide] = useState<"home" | "away">(initialSide)
  const [view, setView] = useState<"front" | "back">("front")

  // ESC to close, body scroll lock while open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const src = kitImagePath(kit, side, view)
  const [imgOk, setImgOk] = useState(true)
  // Reset image state when the source changes (toggling home/away/front/back).
  useEffect(() => { setImgOk(true) }, [src])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${kit.team} ${side} kit zoom`}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(15,8,40,0.85)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl overflow-hidden flex flex-col max-w-[95vw] max-h-[95vh]"
        style={{ width: "min(700px, 95vw)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-black/[0.08]">
          <span className={flagClass(kit.iso3)} style={{ fontSize: "1.5em" }} aria-hidden />
          <h2 className="text-lg font-extrabold text-[#231645] flex-1 truncate">{kit.team}</h2>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-[#f5f4fa] hover:bg-[#e8e5f4] text-[#231645] text-xl font-bold flex items-center justify-center">×</button>
        </div>

        {/* Image area */}
        <div className="relative bg-[#f8f7fd] flex items-center justify-center" style={{ minHeight: "60vh", maxHeight: "70vh" }}>
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={`${kit.team} ${side} kit ${view}`} className="max-w-full max-h-[70vh] object-contain" onError={() => setImgOk(false)} />
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12">
              <span className="text-5xl mb-3 opacity-40">👕</span>
              <p className="text-sm font-bold text-[#231645]">{view === "back" ? "Back view not available" : "Image not available"}</p>
              <p className="text-xs text-[#615E6E] mt-1">{view === "back" ? "Tap Front to see the kit." : ""}</p>
            </div>
          )}
        </div>

        {/* Toggle bar */}
        <div className="grid grid-cols-2 gap-3 p-4 border-t border-black/[0.06]">
          <div className="inline-flex rounded-lg bg-[#f5f4fa] p-1">
            {(["home", "away"] as const).map((s) => (
              <button key={s} onClick={() => setSide(s)}
                className="flex-1 px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors"
                style={side === s ? { background: "#231645", color: "#fff" } : { color: "#615E6E" }}>
                {s}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg bg-[#f5f4fa] p-1">
            {(["front", "back"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="flex-1 px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors"
                style={view === v ? { background: "#7E43FF", color: "#fff" } : { color: "#615E6E" }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KitPlaceholder({ team, side }: { team: string; side: "home" | "away" }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
      <span className="text-3xl mb-2 opacity-50">👕</span>
      <span className="text-xs font-bold text-[#231645]">{team}</span>
      <span className="text-[10px] text-[#615E6E] mt-1">{side === "home" ? "Home" : "Away"} kit not yet released</span>
    </div>
  )
}
