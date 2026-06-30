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
const R = [448, 356, 268, 184, 102]
const pt = (radius: number, ang: number) => ({ x: CX + radius * Math.cos(ang), y: CY + radius * Math.sin(ang) })
const pctL = (v: number) => `${(v / 1000) * 100}%`

// Quadratic curve from child node toward parent node, bowed gently inward so
// the connectors read like a real bracket funnelling to the centre.
function curve(c: { x: number; y: number }, p: { x: number; y: number }): string {
  const mx = (c.x + p.x) / 2, my = (c.y + p.y) / 2
  const ctrlX = CX + (mx - CX) * 0.82, ctrlY = CY + (my - CY) * 0.82
  return `M ${c.x.toFixed(1)} ${c.y.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
}

export default function RadialBracket({ ties }: { ties: Tie[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const active = hover ?? picked

  const layout = useMemo(() => {
    // Leaf order so the tree funnels cleanly inward.
    const sf = [0, 1]
    const qf = sf.flatMap((i) => SF_STRUCTURE[i])
    const r16 = qf.flatMap((i) => QF_STRUCTURE[i])
    const leaf = r16.flatMap((i) => R16_STRUCTURE[i])

    const teams: { name: string; code: string }[] = []
    leaf.forEach((mi) => {
      const t = ties[mi]
      teams.push({ name: t.home, code: iso2(t.home) })
      teams.push({ name: t.away, code: iso2(t.away) })
    })

    const a0 = Array.from({ length: 32 }, (_, p) => -Math.PI / 2 + (p / 32) * TAU)
    const mean = (arr: number[]) => Array.from({ length: arr.length / 2 }, (_, q) => (arr[2 * q] + arr[2 * q + 1]) / 2)
    const a1 = mean(a0), a2 = mean(a1), a3 = mean(a2), a4 = mean(a3)
    const angs = [a0, a1, a2, a3, a4]

    // Faint connector paths.
    const conns: string[] = []
    for (let r = 0; r < 4; r++) for (let q = 0; q < angs[r].length; q++) {
      conns.push(curve(pt(R[r], angs[r][q]), pt(R[r + 1], angs[r + 1][q >> 1])))
    }
    for (let q = 0; q < 2; q++) conns.push(curve(pt(R[4], angs[4][q]), { x: CX, y: CY }))

    return { teams, angs, conns }
  }, [ties])

  // Highlighted path for the active team.
  const activePath = useMemo(() => {
    if (active == null) return null
    const p = active
    const nodes = [
      pt(R[0], layout.angs[0][p]),
      pt(R[1], layout.angs[1][p >> 1]),
      pt(R[2], layout.angs[2][p >> 2]),
      pt(R[3], layout.angs[3][p >> 3]),
      pt(R[4], layout.angs[4][p >> 4]),
      { x: CX, y: CY },
    ]
    return nodes.slice(0, -1).map((n, i) => curve(n, nodes[i + 1])).join(" ")
  }, [active, layout])

  const activeTeam = active != null ? layout.teams[active] : null

  return (
    <div
      className="relative w-full max-w-[680px] mx-auto aspect-square select-none rounded-[28px] overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 50%, #241a4d 0%, #160f33 45%, #0c0820 100%)", boxShadow: "0 30px 90px -20px rgba(12,8,32,0.6)" }}
    >
      <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="rb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd884" stopOpacity="0.95" />
            <stop offset="38%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={200} fill="url(#rb-glow)" />

        {/* faint connectors */}
        {layout.conns.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#b9a6e8" strokeOpacity={0.28} strokeWidth={1.8} />
        ))}
        {/* node dots */}
        {layout.angs.map((ring, r) => ring.map((a, q) => {
          const p = pt(R[r], a)
          return <circle key={`${r}-${q}`} cx={p.x} cy={p.y} r={3} fill="#cdbcf2" fillOpacity={0.4} />
        }))}
        {/* highlighted path */}
        {activePath && (
          <path d={activePath} fill="none" stroke="#ffd884" strokeWidth={4.5} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,216,132,0.85))" }} />
        )}
      </svg>

      {/* Centre */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-32">
        {activeTeam ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 ring-[#ffd884] shadow-[0_0_22px_rgba(255,216,132,0.8)]">
              <img src={FLAG(activeTeam.code)} alt={activeTeam.name} className="w-full h-full object-cover" />
            </div>
            <p className="mt-1.5 text-xs md:text-sm font-extrabold text-white drop-shadow">{activeTeam.name}</p>
            <p className="text-[9px] md:text-[10px] text-[#ffd884] font-bold uppercase tracking-widest">Path to glory</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-6xl" style={{ filter: "drop-shadow(0 0 16px rgba(255,216,132,0.9))" }}>🏆</span>
            <p className="mt-1 text-[9px] md:text-[11px] font-extrabold uppercase tracking-widest text-[#ffd884]">Tap a team</p>
          </div>
        )}
      </div>

      {/* Team flags */}
      {layout.teams.map((t, p) => {
        const pos = pt(R[0], layout.angs[0][p])
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
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden transition-all duration-150 hover:scale-110 focus:scale-110 focus:outline-none"
            style={{
              left: pctL(pos.x), top: pctL(pos.y),
              width: "clamp(28px, 6.4vw, 44px)", height: "clamp(28px, 6.4vw, 44px)",
              boxShadow: isActive ? "0 0 0 2px #ffd884, 0 0 16px rgba(255,216,132,0.85)" : "0 0 0 1.5px rgba(255,255,255,0.35)",
              opacity: active != null && !isActive ? 0.45 : 1,
              zIndex: isActive ? 5 : 2,
            }}
          >
            <img src={FLAG(t.code)} alt={t.name} className="w-full h-full object-cover" />
          </button>
        )
      })}

      <Link href="/round-of-32/" className="absolute left-1/2 bottom-3 -translate-x-1/2 text-[11px] font-bold text-[#ffd884]/90 hover:text-white transition-colors whitespace-nowrap z-10">
        Build the full bracket →
      </Link>
    </div>
  )
}
