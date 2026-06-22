"use client"

import { useMemo, useState } from "react"

/**
 * Interactive Group B decider calculator for the Bosnia and Qatar do-or-die
 * blog posts. Bosnia and Qatar meet head-to-head in m50, so the loser is out
 * and the winner clings to a best-third hope that their goal difference may
 * already have ruined.
 *
 * Group B after matchday 2 (from matchResults.json):
 *   Canada       4 pts  GD +6  GF 7   (1-1 Bosnia, 6-0 Qatar)
 *   Switzerland  4 pts  GD +3  GF 5   (1-1 Qatar, 4-1 Bosnia)
 *   Bosnia       1 pt   GD -3  GF 2   (1-1 Canada, 1-4 Switzerland)
 *   Qatar        1 pt   GD -6  GF 1   (1-1 Switzerland, 0-6 Canada)
 *
 * Matchday 3 (June 24):
 *   m49  Switzerland vs Canada  (BC Place, Vancouver)
 *   m50  Bosnia       vs Qatar  (Lumen Field, Seattle)
 *
 * Best-third reality: 8 of 12 third-placers advance. A 4-point third has
 * historically always made the top 8 in this 12-group format, BUT the
 * tiebreak after points is goal difference, and both Group B strugglers
 * carry a heavily negative GD even if they win.
 */

type SwissResult = "sui_win" | "draw" | "can_win"
const PILL = "px-3 py-1.5 rounded-full text-xs font-bold transition-colors"

export default function GroupBDecider() {
  const [bihGoals, setBihGoals] = useState(1) // Bosnia goals in m50
  const [qatGoals, setQatGoals] = useState(0) // Qatar goals in m50
  const [m49, setM49] = useState<SwissResult>("draw")

  const margin = bihGoals - qatGoals // + Bosnia win, 0 draw, - Qatar win

  const standings = useMemo(() => {
    let rows = [
      { team: "Canada", pts: 4, gd: 6, gf: 7 },
      { team: "Switzerland", pts: 4, gd: 3, gf: 5 },
      { team: "Bosnia and Herzegovina", pts: 1, gd: -3, gf: 2 },
      { team: "Qatar", pts: 1, gd: -6, gf: 1 },
    ]
    // m50 Bosnia vs Qatar (the decider)
    rows = rows.map((r) => {
      if (r.team === "Bosnia and Herzegovina") {
        const add = margin > 0 ? 3 : margin === 0 ? 1 : 0
        return { ...r, pts: r.pts + add, gd: r.gd + margin, gf: r.gf + bihGoals }
      }
      if (r.team === "Qatar") {
        const add = margin < 0 ? 3 : margin === 0 ? 1 : 0
        return { ...r, pts: r.pts + add, gd: r.gd - margin, gf: r.gf + qatGoals }
      }
      return r
    })
    // m49 Switzerland vs Canada (rarely changes B/Q's fate, included for completeness)
    rows = rows.map((r) => {
      if (m49 === "sui_win") {
        if (r.team === "Switzerland") return { ...r, pts: r.pts + 3, gd: r.gd + 1, gf: r.gf + 1 }
        if (r.team === "Canada") return { ...r, gd: r.gd - 1 }
      } else if (m49 === "draw") {
        if (r.team === "Switzerland" || r.team === "Canada") return { ...r, pts: r.pts + 1, gf: r.gf + 1 }
      } else if (m49 === "can_win") {
        if (r.team === "Canada") return { ...r, pts: r.pts + 3, gd: r.gd + 1, gf: r.gf + 1 }
        if (r.team === "Switzerland") return { ...r, gd: r.gd - 1 }
      }
      return r
    })
    return rows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team))
  }, [margin, bihGoals, qatGoals, m49])

  const survivor = margin > 0 ? "Bosnia and Herzegovina" : margin < 0 ? "Qatar" : null
  const survivorRow = survivor ? standings.find((r) => r.team === survivor)! : null

  // Best-third verdict for the survivor, driven by their final GD. The 4-point
  // third bar is usually safe, but a GD worse than about -2 starts losing
  // tiebreaks to the stronger thirds (Belgium, Portugal, Czechia, Ecuador).
  let verdict: { headline: string; sub: string; tone: "good" | "ok" | "bad" }
  if (!survivor) {
    verdict = {
      headline: "Draw — both eliminated",
      sub: "A draw leaves Bosnia and Qatar on 2 points each, fourth and third with no realistic best-third case. Both go home. This game cannot be drawn if either wants to survive.",
      tone: "bad",
    }
  } else {
    const gd = survivorRow!.gd
    const name = survivor === "Qatar" ? "Qatar" : "Bosnia"
    if (gd >= -1) {
      verdict = {
        headline: `${name} win — 4 points, GD ${gd >= 0 ? "+" : ""}${gd}: live best-third chance`,
        sub: `A big enough win drags the goal difference up to ${gd >= 0 ? "+" : ""}${gd}, which keeps ${name} competitive with the other 4-point thirds. Still need other groups to cooperate, but this is the version where ${name} are genuinely in the mix.`,
        tone: "ok",
      }
    } else if (gd >= -3) {
      verdict = {
        headline: `${name} win — 4 points, GD ${gd}: on the bubble`,
        sub: `${name} reach 4 points, but a GD of ${gd} sits below the stronger 4-point thirds. Survival now depends on at least three other groups failing to produce a healthy 4-point third. Possible, not comfortable.`,
        tone: "ok",
      }
    } else {
      verdict = {
        headline: `${name} win — 4 points, GD ${gd}: almost certainly not enough`,
        sub: `Even winning, ${name} carry a GD of ${gd} into the best-third table. In this format that loses the tiebreak to nearly every other 4-point third. ${name} need a much bigger margin here, not just a win.`,
        tone: "bad",
      }
    }
  }

  const toneClass =
    verdict.tone === "good" ? "bg-[#10b981]/10 border-[#10b981]/40 text-[#065f46]"
      : verdict.tone === "ok" ? "bg-[#7E43FF]/10 border-[#7E43FF]/40 text-[#231645]"
      : "bg-[#ef4444]/10 border-[#ef4444]/40 text-[#7f1d1d]"

  const resLabel = margin > 0 ? "Bosnia win" : margin === 0 ? "Draw — both out" : "Qatar win"

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Interactive · Group B decider</p>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">Bosnia vs Qatar: run the winner-takes-all scenario</h2>
        <p className="text-sm text-[#615E6E]">Set the score of the head-to-head decider (m50) and the Switzerland vs Canada result (m49). The model projects Group B&apos;s final table and tells you whether the survivor&apos;s goal difference is good enough to steal a best-third place.</p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-1.5">Bosnia 🇧🇦 vs Qatar 🇶🇦 (m50 · Jun 24, Seattle)</label>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-lg font-extrabold text-[#231645] tabular-nums">{bihGoals} - {qatGoals}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${margin > 0 ? "bg-[#10b981]/15 text-[#065f46]" : margin === 0 ? "bg-[#ef4444]/15 text-[#7f1d1d]" : "bg-[#10b981]/15 text-[#065f46]"}`}>{resLabel}</span>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Bosnia goals: {bihGoals}</label>
              <input type="range" min={0} max={6} value={bihGoals} onChange={(e) => setBihGoals(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Qatar goals: {qatGoals}</label>
              <input type="range" min={0} max={6} value={qatGoals} onChange={(e) => setQatGoals(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-1.5">Switzerland 🇨🇭 vs Canada 🇨🇦 (m49)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button onClick={() => setM49("sui_win")} className={`${PILL} ${m49 === "sui_win" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Switzerland win</button>
            <button onClick={() => setM49("draw")} className={`${PILL} ${m49 === "draw" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Draw</button>
            <button onClick={() => setM49("can_win")} className={`${PILL} ${m49 === "can_win" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Canada win</button>
          </div>
          <p className="text-[10px] text-[#615E6E] mt-2">Canada and Switzerland are both on 4 points and almost certainly through. This result barely moves Bosnia or Qatar, who are racing for 3rd and a best-third lifeline only.</p>
        </div>
      </div>

      {/* Projected standings */}
      <div className="rounded-xl border border-black/[0.06] overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8f7fd] text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">
              <th className="text-left px-3 py-2.5">#</th>
              <th className="text-left px-3 py-2.5">Group B final</th>
              <th className="px-2 py-2.5 text-center">Pts</th>
              <th className="px-2 py-2.5 text-center">GD</th>
              <th className="px-2 py-2.5 text-center">GF</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((r, i) => (
              <tr key={r.team} className={`border-t border-black/[0.04] ${r.team === survivor ? "bg-[#7E43FF]/8" : ""}`}>
                <td className="px-3 py-2 tabular-nums text-[#615E6E]">{i + 1}{i < 2 ? " ✓" : ""}</td>
                <td className={`px-3 py-2 font-semibold ${r.team === survivor ? "text-[#7E43FF]" : "text-[#231645]"}`}>{r.team}</td>
                <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.pts}</td>
                <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.gd >= 0 ? `+${r.gd}` : r.gd}</td>
                <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.gf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`rounded-xl p-4 border mb-2 ${toneClass}`}>
        <p className="text-sm font-extrabold mb-1">{verdict.headline}</p>
        <p className="text-xs leading-relaxed opacity-80">{verdict.sub}</p>
      </div>
      <p className="text-[11px] text-[#615E6E]">Top 2 qualify automatically (green tick). 3rd place enters the best-third race for the final 8 knockout spots. Simulate the full bracket on the <a href="/predictor/" className="text-[#7E43FF] font-semibold underline">predictor</a>.</p>
    </section>
  )
}
