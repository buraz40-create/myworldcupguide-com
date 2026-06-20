"use client"

import { useMemo, useState } from "react"

/**
 * Interactive scenario calculator for the Bosnia vs USA R32 preview blog post.
 *
 * Current Group B going into matchday 3 (from matchResults.json):
 *   Canada       4 pts  GD +6  GF 7
 *   Switzerland  4 pts  GD +3  GF 5
 *   Bosnia       1 pt   GD -3  GF 2
 *   Qatar        1 pt   GD -6  GF 1
 *
 * Remaining matches (June 24):
 *   m49  Switzerland vs Canada  (BC Place, Vancouver)
 *   m50  Bosnia       vs Qatar  (Lumen Field, Seattle)
 */

type SwissCanResult = "sui_wins" | "draw" | "can_wins"

const PILL_BASE = "px-3 py-1.5 rounded-full text-xs font-bold transition-colors"

function Bar({ label, percent, color = "#7E43FF" }: { label: string; percent: number; color?: string }) {
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-[#231645]">{label}</span>
        <span className="text-sm font-bold text-[#231645] tabular-nums">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-3 rounded-full bg-[#f1ecff] overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function BosniaUsaCalculator() {
  const [bihMargin, setBihMargin] = useState(1)      // Bosnia goals over Qatar (0..7)
  const [bihGoals, setBihGoals] = useState(2)        // Bosnia total goals scored
  const [m49, setM49] = useState<SwissCanResult>("sui_wins")
  const [m49CanMargin, setM49CanMargin] = useState(1) // if Canada wins, by how many

  // Final standings after applying the inputs.
  const standings = useMemo(() => {
    // Start from current MD2 standings.
    let cand = [
      { team: "Canada", pts: 4, gd: 6, gf: 7 },
      { team: "Switzerland", pts: 4, gd: 3, gf: 5 },
      { team: "Bosnia", pts: 1, gd: -3, gf: 2 },
      { team: "Qatar", pts: 1, gd: -6, gf: 1 },
    ]

    // Apply Bosnia vs Qatar (Bosnia wins by bihMargin, scoring bihGoals).
    const qatGoals = Math.max(0, bihGoals - bihMargin)
    cand = cand.map((r) => {
      if (r.team === "Bosnia") return { ...r, pts: r.pts + 3, gd: r.gd + bihMargin, gf: r.gf + bihGoals }
      if (r.team === "Qatar") return { ...r, gd: r.gd - bihMargin, gf: r.gf + qatGoals }
      return r
    })

    // Apply Switzerland vs Canada (m49).
    cand = cand.map((r) => {
      if (m49 === "sui_wins") {
        if (r.team === "Switzerland") return { ...r, pts: r.pts + 3, gd: r.gd + 1, gf: r.gf + 1 }
        if (r.team === "Canada") return { ...r, gd: r.gd - 1 }
      } else if (m49 === "draw") {
        if (r.team === "Switzerland") return { ...r, pts: r.pts + 1, gf: r.gf + 1 }
        if (r.team === "Canada") return { ...r, pts: r.pts + 1, gf: r.gf + 1 }
      } else if (m49 === "can_wins") {
        if (r.team === "Canada") return { ...r, pts: r.pts + 3, gd: r.gd + m49CanMargin, gf: r.gf + m49CanMargin }
        if (r.team === "Switzerland") return { ...r, gd: r.gd - m49CanMargin }
      }
      return r
    })

    return cand.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team))
  }, [bihMargin, bihGoals, m49, m49CanMargin])

  const bosniaPos = standings.findIndex((r) => r.team === "Bosnia") + 1
  const bosnia = standings.find((r) => r.team === "Bosnia")!

  // Qualification verdict
  let verdict: { headline: string; sub: string; r32: string; tone: "good" | "ok" | "bad" }
  if (bosniaPos === 1) {
    verdict = {
      headline: "1st in Group B — direct R32 qualification",
      sub: "Wins Group B outright.",
      r32: "Match 85 vs best-3rd from Groups E/F/G/I/J · BC Place, Vancouver · Thu Jul 2 · 8 PM PT / 11 PM ET",
      tone: "good",
    }
  } else if (bosniaPos === 2) {
    verdict = {
      headline: "2nd in Group B — direct R32 qualification",
      sub: "Finishes runner-up.",
      r32: "Match 73 vs Runner-up of Group A (likely South Korea) · SoFi Stadium, Los Angeles · Sun Jun 28 · 3 PM PT / 6 PM ET",
      tone: "good",
    }
  } else if (bosniaPos === 3 && bosnia.pts >= 4) {
    verdict = {
      headline: "3rd in Group B — likely advances as best-third",
      sub: `${bosnia.pts} pts is a strong best-third total. FIFA Annex C slots Group B's 3rd into Match 81.`,
      r32: "Match 81 vs Group D winner (likely USA) · Lumen Field, Seattle · Wed Jul 1 · 4 PM PT / 7 PM ET",
      tone: "ok",
    }
  } else if (bosniaPos === 3) {
    verdict = {
      headline: "3rd in Group B — marginal best-third chance",
      sub: `${bosnia.pts} pts may not be enough; depends on other groups' 3rd-placers.`,
      r32: "If they slip in, Match 81 vs Group D winner (likely USA) at Lumen Field, Seattle on July 1.",
      tone: "bad",
    }
  } else {
    verdict = {
      headline: "4th in Group B — eliminated",
      sub: "Below 3rd-place threshold.",
      r32: "—",
      tone: "bad",
    }
  }

  const toneClass =
    verdict.tone === "good" ? "bg-[#10b981]/10 border-[#10b981]/40 text-[#065f46]"
      : verdict.tone === "ok" ? "bg-[#7E43FF]/10 border-[#7E43FF]/40 text-[#231645]"
      : "bg-[#ef4444]/10 border-[#ef4444]/40 text-[#7f1d1d]"

  // Group D winner probabilities (Kalshi-adjusted given current scores).
  // USA already 6 pts +5 GD locks it; small chance of late slip.
  const groupD = [
    { team: "United States", pct: 92, color: "#7E43FF" },
    { team: "Australia", pct: 6, color: "#615E6E" },
    { team: "Türkiye", pct: 1.5, color: "#615E6E" },
    { team: "Paraguay", pct: 0.5, color: "#615E6E" },
  ]

  // Match outcome priors (90 min only).
  const matchOutcome = [
    { team: "USA win", pct: 58, color: "#7E43FF" },
    { team: "Draw → ET/Pens", pct: 27, color: "#4f1ea1" },
    { team: "Bosnia win", pct: 15, color: "#dc2626" },
  ]

  // Combined probability that Bosnia actually plays USA in M81.
  // P(Bosnia qualifies as 3rd best-3rd) × P(USA wins Group D)
  const bosniaBest3rd = 75 // FMD baseline
  const probMatchupHappens = (bosniaBest3rd / 100) * (groupD[0].pct / 100) * 100

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Interactive</p>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">Run the Bosnia vs USA R32 scenario</h2>
        <p className="text-sm text-[#615E6E]">Move the sliders below to project Group B&apos;s final table and see whether Bosnia gets through to face the USA at Lumen Field on July 1.</p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-1.5">Bosnia 🇧🇦 score vs Qatar 🇶🇦</label>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs text-[#615E6E] w-12 text-right">{bihGoals} - {Math.max(0, bihGoals - bihMargin)}</span>
            <span className="text-[10px] text-[#615E6E]">(BIH {bihMargin >= 0 ? `wins by ${bihMargin}` : "loses"})</span>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Bosnia goals: {bihGoals}</label>
              <input type="range" min={0} max={9} value={bihGoals} onChange={(e) => setBihGoals(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Win margin: {bihMargin}</label>
              <input type="range" min={0} max={bihGoals} value={Math.min(bihMargin, bihGoals)} onChange={(e) => setBihMargin(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-1.5">Switzerland 🇨🇭 vs Canada 🇨🇦 (m49)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button onClick={() => setM49("sui_wins")} className={`${PILL_BASE} ${m49 === "sui_wins" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Switzerland wins</button>
            <button onClick={() => setM49("draw")} className={`${PILL_BASE} ${m49 === "draw" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Draw</button>
            <button onClick={() => setM49("can_wins")} className={`${PILL_BASE} ${m49 === "can_wins" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Canada wins</button>
          </div>
          {m49 === "can_wins" && (
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Canada win margin: {m49CanMargin}</label>
              <input type="range" min={1} max={5} value={m49CanMargin} onChange={(e) => setM49CanMargin(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
            </div>
          )}
          <p className="text-[10px] text-[#615E6E] mt-2">Bosnia&apos;s only path to 2nd is a Canada win + Bosnia thrashing Qatar.</p>
        </div>
      </div>

      {/* Projected standings */}
      <div className="rounded-xl border border-black/[0.06] overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8f7fd] text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">
              <th className="text-left px-3 py-2.5">#</th>
              <th className="text-left px-3 py-2.5">Team</th>
              <th className="px-2 py-2.5 text-center">Pts</th>
              <th className="px-2 py-2.5 text-center">GD</th>
              <th className="px-2 py-2.5 text-center">GF</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((r, i) => (
              <tr key={r.team} className={`border-t border-black/[0.04] ${r.team === "Bosnia" ? "bg-[#7E43FF]/8" : ""}`}>
                <td className="px-3 py-2 tabular-nums text-[#615E6E]">{i + 1}</td>
                <td className={`px-3 py-2 font-semibold ${r.team === "Bosnia" ? "text-[#7E43FF]" : "text-[#231645]"}`}>{r.team}</td>
                <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.pts}</td>
                <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.gd >= 0 ? `+${r.gd}` : r.gd}</td>
                <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.gf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`rounded-xl p-4 border mb-6 ${toneClass}`}>
        <p className="text-sm font-extrabold mb-1">{verdict.headline}</p>
        <p className="text-xs leading-relaxed opacity-80 mb-1.5">{verdict.sub}</p>
        <p className="text-xs leading-relaxed font-semibold">{verdict.r32}</p>
      </div>

      {/* Group D winner probabilities */}
      <div className="mb-6">
        <h3 className="text-base font-extrabold text-[#231645] mb-2">Group D winner — who Bosnia would face</h3>
        <p className="text-xs text-[#615E6E] mb-3">Based on current points (USA 6, +5 GD), Australia (3 pts), Türkiye (0), Paraguay (3 pts).</p>
        {groupD.map((g) => <Bar key={g.team} label={g.team} percent={g.pct} color={g.color} />)}
      </div>

      {/* Combined probability of matchup */}
      <div className="rounded-xl bg-[#7E43FF]/8 border border-[#7E43FF]/20 p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Combined probability</p>
        <p className="text-2xl font-extrabold text-[#231645] tabular-nums">{probMatchupHappens.toFixed(1)}%</p>
        <p className="text-xs text-[#615E6E] mt-1">that Bosnia vs USA actually happens at M81 = P(Bosnia best-3rd: {bosniaBest3rd}%) × P(USA wins Group D: {groupD[0].pct}%).</p>
      </div>

      {/* Match outcome probabilities */}
      <div className="mb-6">
        <h3 className="text-base font-extrabold text-[#231645] mb-2">If it happens — match outcome in 90 minutes</h3>
        <p className="text-xs text-[#615E6E] mb-3">Hosts advantage + USMNT current form + Bosnia&apos;s defensive vulnerability gives USA the heavy edge, but penalties are a real lever.</p>
        {matchOutcome.map((m) => <Bar key={m.team} label={m.team} percent={m.pct} color={m.color} />)}
      </div>

      {/* Bracket path tree */}
      <div className="rounded-xl bg-[#f8f7fd] p-4">
        <h3 className="text-base font-extrabold text-[#231645] mb-3">Bracket path if Bosnia advance</h3>
        <ol className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-[10px] font-extrabold text-white bg-[#7E43FF] rounded-full px-2 py-0.5 mt-0.5 flex-shrink-0">R32</span>
            <span className="text-[#231645]"><strong>M81</strong> · Bosnia vs USA · Lumen Field, Seattle · Jul 1, 7 PM ET</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[10px] font-extrabold text-white bg-[#4f1ea1] rounded-full px-2 py-0.5 mt-0.5 flex-shrink-0">R16</span>
            <span className="text-[#231645]"><strong>M93</strong> · Winner(M81) vs Winner(M82) · NRG Stadium, Houston · Jul 6, 3 PM ET</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[10px] font-extrabold text-white bg-[#231645] rounded-full px-2 py-0.5 mt-0.5 flex-shrink-0">QF</span>
            <span className="text-[#231645]">Would likely face winner of (Brazil/Argentina bracket) at AT&amp;T Stadium · Jul 10-11</span>
          </li>
        </ol>
        <p className="text-[10px] text-[#615E6E] mt-3">Exact downstream paths depend on M82, M93 outcomes — simulate the full bracket on the <a href="/predictor/" className="text-[#7E43FF] font-semibold underline">predictor</a>.</p>
      </div>
    </section>
  )
}
