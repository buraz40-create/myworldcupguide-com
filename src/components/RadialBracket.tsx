"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { iso2, R16_STRUCTURE, QF_STRUCTURE, SF_STRUCTURE } from "@/lib/predictorEngine"

export type Tie = { matchNumber: number; home: string; away: string }
type Team = { name: string; code: string }

// Traversal orders are fixed (depend only on the bracket structure). They map a
// radial ring node (in draw order) back to the real match index in each round.
const QF_TRAVERSAL: number[] = [0, 1].flatMap((i) => SF_STRUCTURE[i])          // ring3 node q -> QF match
const R16_TRAVERSAL: number[] = QF_TRAVERSAL.flatMap((i) => QF_STRUCTURE[i])   // ring2 node q -> R16 match
const LEAF: number[] = R16_TRAVERSAL.flatMap((i) => R16_STRUCTURE[i])          // ring1 node q -> R32 match

export type WinnersByRound = {
  r32?: (string | null)[]; r16?: (string | null)[]; qf?: (string | null)[]
  sf?: (string | null)[]; final?: string | null
}

const FLAG = (code: string) => `https://flagcdn.com/w80/${code}.png`
const TAU = Math.PI * 2
const CX = 500, CY = 500
const R = [450, 360, 272, 186, 104] // rings 0..4; centre (ring 5) = 0
const SIZES = [32, 16, 8, 4, 2, 1]
const ROUND = ["Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Final", "Champion"]
const pt = (radius: number, ang: number) => ({ x: CX + radius * Math.cos(ang), y: CY + radius * Math.sin(ang) })
const posOf = (angs: number[][], r: number, q: number) => (r < 5 ? pt(R[r], angs[r][q]) : { x: CX, y: CY })
const pctL = (v: number) => `${(v / 1000) * 100}%`

function curve(c: { x: number; y: number }, p: { x: number; y: number }): string {
  const mx = (c.x + p.x) / 2, my = (c.y + p.y) / 2
  const cxp = CX + (mx - CX) * 0.82, cyp = CY + (my - CY) * 0.82
  return `M ${c.x.toFixed(1)} ${c.y.toFixed(1)} Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
}

// r32Winners[i] = winner name of the i-th Round of 32 match (matchNumber order,
// m73..m88) if that game has already been played, else null. These are
// pre-filled and locked in the bracket.
export default function RadialBracket({ ties, winners = {} }: { ties: Tie[]; winners?: WinnersByRound }) {
  // Locked picks for every completed round, mapped to radial ring nodes.
  const lockedPicks = useMemo(() => {
    const lp: Record<string, string> = {}
    LEAF.forEach((mi, q) => { const w = winners.r32?.[mi]; if (w) lp[`1-${q}`] = w })
    R16_TRAVERSAL.forEach((mi, q) => { const w = winners.r16?.[mi]; if (w) lp[`2-${q}`] = w })
    QF_TRAVERSAL.forEach((mi, q) => { const w = winners.qf?.[mi]; if (w) lp[`3-${q}`] = w })
    ;[0, 1].forEach((q) => { const w = winners.sf?.[q]; if (w) lp[`4-${q}`] = w })
    if (winners.final) lp["5-0"] = winners.final
    return lp
  }, [winners])
  const locked = useMemo(() => new Set(Object.keys(lockedPicks)), [lockedPicks])

  const [picks, setPicks] = useState<Record<string, string>>(lockedPicks)

  const base = useMemo(() => {
    const teams: Team[] = []
    LEAF.forEach((mi) => {
      const t = ties[mi]
      teams.push({ name: t.home, code: iso2(t.home) })
      teams.push({ name: t.away, code: iso2(t.away) })
    })
    const a0 = Array.from({ length: 32 }, (_, p) => -Math.PI / 2 + (p / 32) * TAU)
    const mean = (arr: number[]) => Array.from({ length: arr.length / 2 }, (_, q) => (arr[2 * q] + arr[2 * q + 1]) / 2)
    const a1 = mean(a0), a2 = mean(a1), a3 = mean(a2), a4 = mean(a3)
    const angs = [a0, a1, a2, a3, a4]
    // Faint static connectors.
    const conns: string[] = []
    for (let r = 0; r < 4; r++) for (let q = 0; q < angs[r].length; q++) conns.push(curve(pt(R[r], angs[r][q]), pt(R[r + 1], angs[r + 1][q >> 1])))
    for (let q = 0; q < 2; q++) conns.push(curve(pt(R[4], angs[4][q]), { x: CX, y: CY }))
    return { teams, angs, conns }
  }, [ties])

  // Resolve who occupies each node, invalidating stale downstream picks.
  const nodes = useMemo(() => {
    const grid: (Team | null)[][] = [base.teams]
    for (let r = 1; r < 6; r++) {
      grid[r] = []
      for (let q = 0; q < SIZES[r]; q++) {
        const a = grid[r - 1][2 * q], b = grid[r - 1][2 * q + 1], w = picks[`${r}-${q}`]
        grid[r][q] = a && w === a.name ? a : b && w === b.name ? b : null
      }
    }
    return grid
  }, [base, picks])

  // Gold "won" edges (winners so far).
  const wonPaths: string[] = []
  for (let r = 1; r < 6; r++) for (let q = 0; q < SIZES[r]; q++) {
    const w = nodes[r][q]; if (!w) continue
    const c = nodes[r - 1][2 * q]?.name === w.name ? 2 * q : 2 * q + 1
    wonPaths.push(curve(posOf(base.angs, r - 1, c), posOf(base.angs, r, q)))
  }

  const advance = (r: number, q: number, name: string) => {
    if (r >= 5) return
    const key = `${r + 1}-${q >> 1}`
    if (locked.has(key)) return // result already decided on the pitch
    setPicks((p) => ({ ...p, [key]: name }))
  }
  const champion = nodes[5][0]
  const picksMade = Object.keys(picks).filter((k) => {
    const [r, q] = k.split("-").map(Number); return !!nodes[r]?.[q]
  }).length
  const userPicks = Math.max(0, picksMade - locked.size)

  return (
    <div
      className="relative w-full max-w-[680px] mx-auto aspect-square select-none rounded-[28px] overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 50%, #241a4d 0%, #160f33 45%, #0c0820 100%)", boxShadow: "0 30px 90px -20px rgba(12,8,32,0.6)" }}
    >
      {/* Top bar */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-20">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
          {locked.size > 0 ? `${locked.size} played · ${userPicks} picked` : `${picksMade}/31 picked`}
        </span>
        {userPicks > 0 && (
          <button onClick={() => setPicks({ ...lockedPicks })} className="text-[10px] font-bold uppercase tracking-widest text-[#ffd884]/90 hover:text-white transition">Reset picks</button>
        )}
      </div>

      <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="rb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd884" stopOpacity="0.95" />
            <stop offset="38%" stopColor="#f59e0b" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={200} fill="url(#rb-glow)" />
        {base.conns.map((d, i) => <path key={i} d={d} fill="none" stroke="#b9a6e8" strokeOpacity={0.26} strokeWidth={1.8} />)}
        {base.angs.map((ring, r) => ring.map((a, q) => { const p = pt(R[r], a); return <circle key={`${r}-${q}`} cx={p.x} cy={p.y} r={3} fill="#cdbcf2" fillOpacity={0.35} /> }))}
        {wonPaths.map((d, i) => <path key={`w${i}`} d={d} fill="none" stroke="#ffd884" strokeWidth={4.5} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px rgba(255,216,132,0.8))" }} />)}
      </svg>

      {/* Centre: trophy or champion */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-32 z-10">
        {champion ? (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-[68px] md:h-[68px] rounded-full overflow-hidden ring-2 ring-[#ffd884] shadow-[0_0_26px_rgba(255,216,132,0.9)]">
              <img src={FLAG(champion.code)} alt={champion.name} className="w-full h-full object-cover" />
            </div>
            <p className="mt-1.5 text-xs md:text-sm font-extrabold text-white drop-shadow">{champion.name}</p>
            <p className="text-[9px] md:text-[10px] text-[#ffd884] font-bold uppercase tracking-widest">Champion 🏆</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-6xl" style={{ filter: "drop-shadow(0 0 16px rgba(255,216,132,0.9))" }}>🏆</span>
            <p className="mt-1 text-[9px] md:text-[11px] font-extrabold uppercase tracking-widest text-[#ffd884]">Pick winners</p>
          </div>
        )}
      </div>

      {/* Flags at every occupied node */}
      {[0, 1, 2, 3, 4].map((r) =>
        nodes[r].map((t, q) => {
          if (!t) return null
          const pos = posOf(base.angs, r, q)
          const winner = nodes[r + 1]?.[q >> 1]
          const eliminated = !!winner && winner.name !== t.name
          const advanced = !!winner && winner.name === t.name
          return (
            <button
              key={`${r}-${q}`}
              onClick={() => advance(r, q, t.name)}
              aria-label={`${t.name} — advance from ${ROUND[r]}`}
              title={`${t.name} (${ROUND[r]})`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden transition-all duration-150 hover:scale-110 focus:scale-110 focus:outline-none"
              style={{
                left: pctL(pos.x), top: pctL(pos.y),
                width: "clamp(26px, 6vw, 42px)", height: "clamp(26px, 6vw, 42px)",
                boxShadow: advanced ? "0 0 0 2px #ffd884, 0 0 14px rgba(255,216,132,0.85)" : "0 0 0 1.5px rgba(255,255,255,0.35)",
                opacity: eliminated ? 0.3 : 1,
                zIndex: advanced ? 6 : 3,
              }}
            >
              <img src={FLAG(t.code)} alt={t.name} className="w-full h-full object-cover" />
            </button>
          )
        })
      )}

      <Link href="/round-of-32/" className="absolute left-1/2 bottom-3 -translate-x-1/2 text-[11px] font-bold text-[#ffd884]/90 hover:text-white transition-colors whitespace-nowrap z-20">
        Full bracket & odds →
      </Link>
    </div>
  )
}
