"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { iso2, R16_STRUCTURE, QF_STRUCTURE, SF_STRUCTURE } from "@/lib/predictorEngine"

export type Tie = { matchNumber: number; home: string; away: string }

const FLAG = (code: string) => `https://flagcdn.com/w80/${code}.png`
const TAU = Math.PI * 2
const CX = 500, CY = 500
// radius of each ring (outer teams -> centre)
const R = [442, 350, 262, 178, 96]
const pt = (radius: number, ang: number) => ({ x: CX + radius * Math.cos(ang), y: CY + radius * Math.sin(ang) })
const pct = (v: number) => `${(v / 1000) * 100}%`

export default function RadialBracket({ ties }: { ties: Tie[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const active = hover ?? picked

  // Leaf order: arrange the 16 R32 matches so the tree funnels cleanly inward.
  const layout = useMemo(() => {
    const sf = [0, 1]
    const qf = sf.flatMap((i) => SF_STRUCTURE[i])
    const r16 = qf.flatMap((i) => QF_STRUCTURE[i])
    const leaf = r16.flatMap((i) => R16_STRUCTURE[i]) // 16 match indices, leaf order

    // 32 team slots: each match contributes home (2L) and away (2L+1).
    const teams: { name: string; code: string }[] = []
    leaf.forEach((mi) => {
      const t = ties[mi]
      teams.push({ name: t.home, code: iso2(t.home) })
      teams.push({ name: t.away, code: iso2(t.away) })
    })

    // Angles per ring (ring0 = 32 teams), each inner node = mean of its two children.
    const a0 = Array.from({ length: 32 }, (_, p) => -Math.PI / 2 + (p / 32) * TAU)
    const mean = (arr: number[]) => Array.from({ length: arr.length / 2 }, (_, q) => (arr[2 * q] + arr[2 * q + 1]) / 2)
    const a1 = mean(a0), a2 = mean(a1), a3 = mean(a2), a4 = mean(a3)
    const angs = [a0, a1, a2, a3, a4]
    return { teams, angs }
  }, [ties])

  // Highlighted path for the active team: slot -> inward nodes -> centre.
  const pathPts = useMemo(() => {
    if (active == null) return null
    const p = active
    const pts = [
      pt(R[0], layout.angs[0][p]),
      pt(R[1], layout.angs[1][p >> 1]),
      pt(R[2], layout.angs[2][p >> 2]),
      pt(R[3], layout.angs[3][p >> 3]),
      pt(R[4], layout.angs[4][p >> 4]),
      { x: CX, y: CY },
    ]
    return pts.map((q) => `${q.x},${q.y}`).join(" ")
  }, [active, layout])

  const activeTeam = active != null ? layout.teams[active] : null

  // recompute connector segs (memo above returned only via layout; rebuild here for render)
  const segs = useMemo(() => {
    const angs = layout.angs
    const out: { x1: number; y1: number; x2: number; y2: number }[] = []
    for (let r = 0; r < 4; r++) for (let q = 0; q < angs[r].length; q++) {
      const a = pt(R[r], angs[r][q]); const b = pt(R[r + 1], angs[r + 1][q >> 1])
      out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
    }
    for (let q = 0; q < 2; q++) { const a = pt(R[4], angs[4][q]); out.push({ x1: a.x, y1: a.y, x2: CX, y2: CY }) }
    return out
  }, [layout])

  return (
    <div className="relative w-full max-w-[640px] mx-auto aspect-square select-none">
      {/* Connectors + glow */}
      <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="rb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffcf6b" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={150} fill="url(#rb-glow)" />
        {segs.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#ffffff" strokeOpacity={0.14} strokeWidth={2} />
        ))}
        {/* node dots */}
        {layout.angs.map((ring, r) => ring.map((a, q) => {
          const p = pt(R[r], a)
          return <circle key={`${r}-${q}`} cx={p.x} cy={p.y} r={3.5} fill="#ffffff" fillOpacity={0.25} />
        }))}
        {/* highlighted path */}
        {pathPts && (
          <polyline points={pathPts} fill="none" stroke="#ffcf6b" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,207,107,0.8))" }} />
        )}
      </svg>

      {/* Centre: trophy or active team */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        {activeTeam ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 ring-[#ffcf6b] shadow-[0_0_20px_rgba(255,207,107,0.7)]">
              <img src={FLAG(activeTeam.code)} alt={activeTeam.name} className="w-full h-full object-cover" />
            </div>
            <p className="mt-1.5 text-xs md:text-sm font-extrabold text-white drop-shadow">{activeTeam.name}</p>
            <p className="text-[9px] md:text-[10px] text-[#ffcf6b] font-bold uppercase tracking-widest">Path to glory</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-5xl" style={{ filter: "drop-shadow(0 0 14px rgba(255,207,107,0.9))" }}>🏆</span>
            <p className="mt-1 text-[9px] md:text-[11px] font-extrabold uppercase tracking-widest text-[#ffcf6b]">Tap a team</p>
          </div>
        )}
      </div>

      {/* Team flags */}
      {layout.teams.map((t, p) => {
        const a = layout.angs[0][p]
        const pos = pt(R[0], a)
        const isActive = active === p
        return (
          <button
            key={p}
            onMouseEnter={() => setHover(p)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(p)}
            onBlur={() => setHover(null)}
            onClick={() => setPicked((cur) => (cur === p ? null : p))}
            aria-label={t.name}
            title={t.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden transition-transform hover:scale-110 focus:scale-110 focus:outline-none"
            style={{
              left: pct(pos.x), top: pct(pos.y),
              width: "clamp(26px, 7.5vw, 46px)", height: "clamp(26px, 7.5vw, 46px)",
              boxShadow: isActive ? "0 0 0 2px #ffcf6b, 0 0 14px rgba(255,207,107,0.8)" : "0 0 0 1px rgba(255,255,255,0.25)",
              opacity: active != null && !isActive ? 0.55 : 1,
            }}
          >
            <img src={FLAG(t.code)} alt={t.name} className="w-full h-full object-cover" />
          </button>
        )
      })}

      {/* CTA */}
      <Link href="/round-of-32/" className="absolute left-1/2 -bottom-1 -translate-x-1/2 translate-y-full text-xs font-bold text-[#ffcf6b] hover:text-white transition-colors whitespace-nowrap">
        Build the full bracket →
      </Link>
    </div>
  )
}
