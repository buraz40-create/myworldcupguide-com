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
  const [bihGoals, setBihGoals] = useState(2)        // Bosnia goals in m50
  const [qatGoals, setQatGoals] = useState(0)        // Qatar goals in m50
  const bihMargin = bihGoals - qatGoals              // derived: + = win, 0 = draw, - = loss
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

    // Apply Bosnia vs Qatar. Each team gets points based on the scoreline,
    // and GF/GA always update by the goals scored/conceded.
    cand = cand.map((r) => {
      if (r.team === "Bosnia") {
        const ptsAdd = bihMargin > 0 ? 3 : bihMargin === 0 ? 1 : 0
        return { ...r, pts: r.pts + ptsAdd, gd: r.gd + bihMargin, gf: r.gf + bihGoals }
      }
      if (r.team === "Qatar") {
        const ptsAdd = bihMargin < 0 ? 3 : bihMargin === 0 ? 1 : 0
        return { ...r, pts: r.pts + ptsAdd, gd: r.gd - bihMargin, gf: r.gf + qatGoals }
      }
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

  // Detect tiebreak situations involving Bosnia for explanation text.
  const tiedWith = standings.filter((r) => r.team !== "Bosnia" && r.pts === bosnia.pts)
  const tiebreakNote = tiedWith.length > 0
    ? (() => {
        const aheadOf = tiedWith.filter((t) => {
          const tIdx = standings.findIndex((r) => r.team === t.team)
          const bIdx = standings.findIndex((r) => r.team === "Bosnia")
          return tIdx < bIdx
        })
        if (aheadOf.length === 0) return null
        const opp = aheadOf[0]
        // Identify which tiebreak step decides it.
        let step: string
        if (bosnia.gd < opp.gd) {
          step = `GD: ${opp.team} ${opp.gd >= 0 ? "+" : ""}${opp.gd} vs Bosnia ${bosnia.gd >= 0 ? "+" : ""}${bosnia.gd}`
        } else if (bosnia.gd === opp.gd && bosnia.gf < opp.gf) {
          step = `GF (GD tied): ${opp.team} ${opp.gf} vs Bosnia ${bosnia.gf}`
        } else {
          step = `head-to-head / FIFA rank`
        }
        return `Tied with ${opp.team} on ${bosnia.pts} pts — FIFA tiebreak (Article 12.5) goes points → GD → GF → H2H. ${opp.team} wins on ${step}.`
      })()
    : null

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
      sub: `${bosnia.pts} pts is a strong best-third total. FIFA Annex C slots Group B's 3rd into Match 81.${tiebreakNote ? " " + tiebreakNote : ""}`,
      r32: "Match 81 vs Group D winner (likely USA) · Lumen Field, Seattle · Wed Jul 1 · 4 PM PT / 7 PM ET",
      tone: "ok",
    }
  } else if (bosniaPos === 3) {
    verdict = {
      headline: "3rd in Group B — marginal best-third chance",
      sub: `${bosnia.pts} pts may not be enough; depends on other groups' 3rd-placers.${tiebreakNote ? " " + tiebreakNote : ""}`,
      r32: "If they slip in, Match 81 vs Group D winner (likely USA) at Lumen Field, Seattle on July 1.",
      tone: "bad",
    }
  } else {
    verdict = {
      headline: "4th in Group B — eliminated",
      sub: `Below 3rd-place threshold.${tiebreakNote ? " " + tiebreakNote : ""}`,
      r32: "—",
      tone: "bad",
    }
  }

  // Bracket path depends on which finishing position Bosnia projects to.
  type PathStep = { round: string; match: string; venue: string; date: string }
  const bracketPath: PathStep[] = bosniaPos === 1
    ? [
        { round: "R32", match: "M85 vs best-3rd from E/F/G/I/J", venue: "BC Place, Vancouver", date: "Thu Jul 2 · 8 PM PT" },
        { round: "R16", match: "M97 · W(M85) vs W(M86)", venue: "Mercedes-Benz Stadium, Atlanta", date: "Tue Jul 7 · 5 PM ET" },
        { round: "QF", match: "Path leads to the Brazil/Argentina side of the bracket", venue: "TBD", date: "Jul 10-11" },
      ]
    : bosniaPos === 2
    ? [
        { round: "R32", match: "M73 vs Runner-up of Group A (likely South Korea)", venue: "SoFi Stadium, Los Angeles", date: "Sun Jun 28 · 3 PM PT" },
        { round: "R16", match: "M89 · W(M73) vs W(M74)", venue: "NRG Stadium, Houston", date: "Sun Jul 5 · 12 PM CT" },
        { round: "QF", match: "Path crosses into the Germany/England side", venue: "TBD", date: "Jul 9-10" },
      ]
    : bosniaPos === 3 && bosnia.pts >= 4
    ? [
        { round: "R32", match: "M81 vs Group D winner (likely USA)", venue: "Lumen Field, Seattle", date: "Wed Jul 1 · 4 PM PT" },
        { round: "R16", match: "M93 · W(M81) vs W(M82)", venue: "AT&T Stadium, Dallas", date: "Mon Jul 6 · 3 PM CT" },
        { round: "QF", match: "Path likely meets the Brazil/Argentina side", venue: "TBD", date: "Jul 10-11" },
      ]
    : []

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
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-1.5">Bosnia 🇧🇦 vs Qatar 🇶🇦 (m50)</label>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-lg font-extrabold text-[#231645] tabular-nums">{bihGoals} - {qatGoals}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${bihMargin > 0 ? "bg-[#10b981]/15 text-[#065f46]" : bihMargin === 0 ? "bg-[#7E43FF]/15 text-[#4f1ea1]" : "bg-[#ef4444]/15 text-[#7f1d1d]"}`}>
              {bihMargin > 0 ? "Bosnia win" : bihMargin === 0 ? "Draw" : "Qatar win"}
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Bosnia goals: {bihGoals}</label>
              <input type="range" min={0} max={9} value={bihGoals} onChange={(e) => setBihGoals(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Qatar goals: {qatGoals}</label>
              <input type="range" min={0} max={9} value={qatGoals} onChange={(e) => setQatGoals(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
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

      {/* Bracket path tree . dynamic based on Bosnia's projected position */}
      {bracketPath.length > 0 ? (
        <div className="rounded-xl bg-[#f8f7fd] p-4">
          <h3 className="text-base font-extrabold text-[#231645] mb-1">Bracket path if Bosnia finish {bosniaPos === 1 ? "1st" : bosniaPos === 2 ? "2nd" : "3rd"}</h3>
          <p className="text-xs text-[#615E6E] mb-3">Updates live based on the sliders above.</p>
          <ol className="space-y-2 text-sm">
            {bracketPath.map((step, i) => {
              const badge = step.round === "R32" ? "bg-[#7E43FF]" : step.round === "R16" ? "bg-[#4f1ea1]" : "bg-[#231645]"
              return (
                <li key={i} className="flex items-start gap-2">
                  <span className={`text-[10px] font-extrabold text-white ${badge} rounded-full px-2 py-0.5 mt-0.5 flex-shrink-0`}>{step.round}</span>
                  <span className="text-[#231645]">
                    <strong>{step.match}</strong>
                    <span className="block text-[11px] text-[#615E6E] mt-0.5">{step.venue} · {step.date}</span>
                  </span>
                </li>
              )
            })}
          </ol>
          <p className="text-[10px] text-[#615E6E] mt-3">Exact downstream paths depend on later results — simulate the full bracket on the <a href="/predictor/" className="text-[#7E43FF] font-semibold underline">predictor</a>.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-[#fef2f2] border border-[#ef4444]/30 p-4">
          <p className="text-sm font-bold text-[#7f1d1d]">No bracket path under these inputs.</p>
          <p className="text-xs text-[#7f1d1d]/80 mt-1">Bosnia would be eliminated or below the best-third cutoff. Try a bigger margin vs Qatar or a different m49 result.</p>
        </div>
      )}
    </section>
  )
}
