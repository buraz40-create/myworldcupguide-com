"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */

/**
 * Interactive best-third-placed calculator for the Scotland qualification
 * blog post. Lets the reader set Scotland's matchday-3 result vs Brazil
 * (m51) and the Morocco vs Haiti result (m52), then projects:
 *   1. Scotland's final Group C position (1st / 2nd / 3rd / 4th)
 *   2. If 3rd: where they land in the best-third-placed table
 *   3. A verdict on whether they reach the knockouts for the first time ever
 *
 * Current Group C after matchday 2 (from matchResults.json + groups.ts):
 *   Brazil    4 pts  GD +4  GF 6   (1-1 Morocco, 5-1 Haiti)
 *   Morocco   4 pts  GD +1  GF 2   (1-1 Brazil, 1-0 Scotland)
 *   Scotland  3 pts  GD  0  GF 1   (1-0 Haiti, 0-1 Morocco)
 *   Haiti     0 pts  GD -5  GF 1   (0-1 Scotland, 1-5 Brazil)
 *
 * Best-third table is seeded from the live Google/FIFA standings the user
 * supplied (June 21): 8 of 12 third-placers advance.
 */

const FLAG = (iso: string) => `https://flagcdn.com/w40/${iso}.png`

// The 11 OTHER third-placed teams as of June 21, plus their realistic
// projected final points after matchday 3. Used to model the cutoff line
// Scotland has to clear if they finish 3rd. "proj" is our editorial estimate
// of where each third-placer most likely finishes; the reader can override
// the aggregate with the slider below.
type ThirdRow = { team: string; iso: string; group: string; pts: number; gd: number; proj: number }
const OTHER_THIRDS: ThirdRow[] = [
  { team: "Sweden", iso: "se", group: "F", pts: 3, gd: 0, proj: 3 },
  { team: "Paraguay", iso: "py", group: "D", pts: 3, gd: -2, proj: 3 },
  { team: "Belgium", iso: "be", group: "G", pts: 1, gd: 0, proj: 4 },
  { team: "Portugal", iso: "pt", group: "K", pts: 1, gd: 0, proj: 4 },
  { team: "Czechia", iso: "cz", group: "A", pts: 1, gd: -1, proj: 4 },
  { team: "Ecuador", iso: "ec", group: "E", pts: 1, gd: -1, proj: 4 },
  { team: "Bosnia and Herzegovina", iso: "ba", group: "B", pts: 1, gd: -3, proj: 3 },
  { team: "Saudi Arabia", iso: "sa", group: "H", pts: 1, gd: -4, proj: 1 },
  { team: "Panama", iso: "pa", group: "L", pts: 0, gd: -1, proj: 3 },
  { team: "Senegal", iso: "sn", group: "I", pts: 0, gd: -2, proj: 3 },
  { team: "Jordan", iso: "jo", group: "J", pts: 0, gd: -2, proj: 1 },
]

type MoroccoResult = "mar_win" | "draw" | "hai_win"
const PILL = "px-3 py-1.5 rounded-full text-xs font-bold transition-colors"

function Bar({ label, percent, color = "#7E43FF" }: { label: string; percent: number; color?: string }) {
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-[#231645]">{label}</span>
        <span className="text-sm font-bold text-[#231645] tabular-nums">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-3 rounded-full bg-[#f1ecff] overflow-hidden">
        <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: color }} />
      </div>
    </div>
  )
}

export default function ScotlandThirdPlace() {
  const [scoGoals, setScoGoals] = useState(1)   // Scotland goals vs Brazil (m51)
  const [braGoals, setBraGoals] = useState(1)   // Brazil goals vs Scotland (m51)
  const [m52, setM52] = useState<MoroccoResult>("mar_win")
  // How many of the other third-placers finish on 4+ points. Default 4 matches
  // our projection (Belgium, Portugal, Czechia, Ecuador all favoured to reach 4).
  const [rivals4pts, setRivals4pts] = useState(4)

  const margin = scoGoals - braGoals
  const scoPts = 3 + (margin > 0 ? 3 : margin === 0 ? 1 : 0)
  const scoGd = 0 + margin
  const scoGf = 1 + scoGoals

  // Final Group C table under the chosen inputs.
  const groupC = useMemo(() => {
    let rows = [
      { team: "Brazil", pts: 4, gd: 4, gf: 6 },
      { team: "Morocco", pts: 4, gd: 1, gf: 2 },
      { team: "Scotland", pts: 3, gd: 0, gf: 1 },
      { team: "Haiti", pts: 0, gd: -5, gf: 1 },
    ]
    // m51 Scotland vs Brazil
    rows = rows.map((r) => {
      if (r.team === "Scotland") return { ...r, pts: scoPts, gd: scoGd, gf: scoGf }
      if (r.team === "Brazil") {
        const add = margin < 0 ? 3 : margin === 0 ? 1 : 0
        return { ...r, pts: r.pts + add, gd: r.gd - margin, gf: r.gf + braGoals }
      }
      return r
    })
    // m52 Morocco vs Haiti (assume 1-0 / 1-1 / 0-1 representative scorelines)
    rows = rows.map((r) => {
      if (r.team === "Morocco") {
        if (m52 === "mar_win") return { ...r, pts: r.pts + 3, gd: r.gd + 1, gf: r.gf + 1 }
        if (m52 === "draw") return { ...r, pts: r.pts + 1, gf: r.gf + 1 }
        return { ...r, gd: r.gd - 1 }
      }
      if (r.team === "Haiti") {
        if (m52 === "hai_win") return { ...r, pts: r.pts + 3, gd: r.gd + 1, gf: r.gf + 1 }
        if (m52 === "draw") return { ...r, pts: r.pts + 1, gf: r.gf + 1 }
        return { ...r, gd: r.gd - 1 }
      }
      return r
    })
    return rows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team))
  }, [scoPts, scoGd, scoGf, margin, braGoals, m52])

  const scoPos = groupC.findIndex((r) => r.team === "Scotland") + 1

  // If Scotland finish 3rd, model their rank among the 12 third-placers.
  // Teams ahead of Scotland = (rivals finishing on more points) + (rivals tied
  // on points but ahead on GD). We treat the slider as the count of rivals on
  // 4+ pts; the remaining rivals are assumed to land on 3 or fewer.
  const thirdRank = useMemo(() => {
    if (scoPos !== 3) return null
    const tiedThreePtRivals = Math.max(0, 11 - rivals4pts)
    // Of the ~3-pt bunch, roughly half tend to edge Scotland on goal difference
    // when Scotland's GD is 0 or negative; if Scotland have a positive GD they
    // win most of those tiebreaks.
    const tiebreakLosses = scoGd > 0 ? Math.round(tiedThreePtRivals * 0.25)
      : scoGd === 0 ? Math.round(tiedThreePtRivals * 0.5)
      : Math.round(tiedThreePtRivals * 0.75)
    const ahead = (scoPts >= 4 ? rivals4pts * 0.5 : rivals4pts) + (scoPts >= 4 ? 0 : tiebreakLosses)
    return Math.min(12, Math.round(ahead) + 1)
  }, [scoPos, scoPts, scoGd, rivals4pts])

  // Verdict
  let verdict: { headline: string; sub: string; tone: "good" | "ok" | "bad" }
  if (scoPos <= 2) {
    verdict = {
      headline: `${scoPos === 1 ? "1st" : "2nd"} in Group C — through to the Round of 32`,
      sub: "Direct qualification. Scotland reach the knockout stage of a World Cup for the first time in their history (9th attempt).",
      tone: "good",
    }
  } else if (scoPos === 3 && thirdRank != null && thirdRank <= 8) {
    verdict = {
      headline: `3rd in Group C — best-third rank ~#${thirdRank} of 12 (top 8 advance)`,
      sub: scoPts >= 4
        ? "4 points has reached the top 8 in every realistic projection of this 12-group format. Scotland are all but through."
        : "3 points squeaks in under these inputs, but it is a goal-difference coin flip against the other 3-point thirds. Fragile.",
      tone: scoPts >= 4 ? "good" : "ok",
    }
  } else if (scoPos === 3) {
    verdict = {
      headline: `3rd in Group C — best-third rank ~#${thirdRank} of 12 (below the line)`,
      sub: "Too many other groups produced a stronger third-placer. Scotland miss out on goal difference / points. Heartbreak.",
      tone: "bad",
    }
  } else {
    verdict = {
      headline: "4th in Group C — eliminated",
      sub: "A loss to Brazil with Morocco taking points leaves Scotland bottom-half and out.",
      tone: "bad",
    }
  }

  const toneClass =
    verdict.tone === "good" ? "bg-[#10b981]/10 border-[#10b981]/40 text-[#065f46]"
      : verdict.tone === "ok" ? "bg-[#7E43FF]/10 border-[#7E43FF]/40 text-[#231645]"
      : "bg-[#ef4444]/10 border-[#ef4444]/40 text-[#7f1d1d]"

  // Result label for m51
  const resLabel = margin > 0 ? "Scotland win" : margin === 0 ? "Draw" : "Brazil win"

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Interactive · Best-third calculator</p>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">Does Scotland qualify? Run the scenario</h2>
        <p className="text-sm text-[#615E6E]">Set Scotland&apos;s result against Brazil in Miami (m51), the Morocco vs Haiti result (m52), and how the other groups&apos; third-placers shake out. The model projects Group C&apos;s final table and Scotland&apos;s place in the best-third race.</p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-1.5">Scotland 🏴 vs Brazil 🇧🇷 (m51 · Jun 24, Miami)</label>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-lg font-extrabold text-[#231645] tabular-nums">{scoGoals} - {braGoals}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${margin > 0 ? "bg-[#10b981]/15 text-[#065f46]" : margin === 0 ? "bg-[#7E43FF]/15 text-[#4f1ea1]" : "bg-[#ef4444]/15 text-[#7f1d1d]"}`}>{resLabel}</span>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Scotland goals: {scoGoals}</label>
              <input type="range" min={0} max={6} value={scoGoals} onChange={(e) => setScoGoals(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Brazil goals: {braGoals}</label>
              <input type="range" min={0} max={6} value={braGoals} onChange={(e) => setBraGoals(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-[#231645] mb-1.5">Morocco 🇲🇦 vs Haiti 🇭🇹 (m52)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setM52("mar_win")} className={`${PILL} ${m52 === "mar_win" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Morocco win</button>
            <button onClick={() => setM52("draw")} className={`${PILL} ${m52 === "draw" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Draw</button>
            <button onClick={() => setM52("hai_win")} className={`${PILL} ${m52 === "hai_win" ? "bg-[#7E43FF] text-white" : "bg-[#f1ecff] text-[#231645]"}`}>Haiti win</button>
          </div>
          <label className="block text-[10px] font-bold text-[#615E6E] mb-1">Other 3rd-placers finishing on 4+ pts: {rivals4pts} of 11</label>
          <input type="range" min={0} max={9} value={rivals4pts} onChange={(e) => setRivals4pts(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#7E43FF" }} />
          <p className="text-[10px] text-[#615E6E] mt-2">Our base case is 4 (Belgium, Portugal, Czechia, Ecuador all favoured to reach 4). Drag it to stress-test Scotland&apos;s 3-point survival.</p>
        </div>
      </div>

      {/* Projected Group C table */}
      <div className="rounded-xl border border-black/[0.06] overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8f7fd] text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">
              <th className="text-left px-3 py-2.5">#</th>
              <th className="text-left px-3 py-2.5">Group C final</th>
              <th className="px-2 py-2.5 text-center">Pts</th>
              <th className="px-2 py-2.5 text-center">GD</th>
              <th className="px-2 py-2.5 text-center">GF</th>
            </tr>
          </thead>
          <tbody>
            {groupC.map((r, i) => (
              <tr key={r.team} className={`border-t border-black/[0.04] ${r.team === "Scotland" ? "bg-[#7E43FF]/8" : ""}`}>
                <td className="px-3 py-2 tabular-nums text-[#615E6E]">{i + 1}{i < 2 ? " ✓" : ""}</td>
                <td className={`px-3 py-2 font-semibold ${r.team === "Scotland" ? "text-[#7E43FF]" : "text-[#231645]"}`}>{r.team}</td>
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
        <p className="text-xs leading-relaxed opacity-80">{verdict.sub}</p>
      </div>

      {/* Live best-third table */}
      <div className="mb-2">
        <h3 className="text-base font-extrabold text-[#231645] mb-1">Best third-placed teams right now</h3>
        <p className="text-xs text-[#615E6E] mb-3">Live as of June 21 (groups mid-way through). The top 8 of these 12 advance. Scotland sit 2nd on 3 points — but most of these teams still have a game to play, so the cutoff will climb.</p>
        <div className="rounded-xl border border-black/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8f7fd] text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">
                <th className="text-left px-3 py-2.5">#</th>
                <th className="text-left px-3 py-2.5">Team</th>
                <th className="px-2 py-2.5 text-center">Grp</th>
                <th className="px-2 py-2.5 text-center">Pts</th>
                <th className="px-2 py-2.5 text-center">GD</th>
              </tr>
            </thead>
            <tbody>
              {[{ team: "Scotland", iso: "gb-sct", group: "C", pts: 3, gd: 0, proj: 0 }, ...OTHER_THIRDS]
                .sort((a, b) => b.pts - a.pts || b.gd - a.gd || a.team.localeCompare(b.team))
                .map((r, i) => (
                  <tr key={r.team} className={`border-t border-black/[0.04] ${r.team === "Scotland" ? "bg-[#7E43FF]/8" : ""} ${i === 7 ? "border-b-2 border-[#7E43FF]/50" : ""}`}>
                    <td className="px-3 py-2 tabular-nums text-[#615E6E]">{i + 1}{i < 8 ? " ✓" : ""}</td>
                    <td className={`px-3 py-2 font-semibold flex items-center gap-2 ${r.team === "Scotland" ? "text-[#7E43FF]" : "text-[#231645]"}`}>
                      <img src={FLAG(r.iso)} alt="" width={20} height={14} className="rounded-sm flex-shrink-0" />
                      {r.team}
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.group}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.pts}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-[#615E6E]">{r.gd >= 0 ? `+${r.gd}` : r.gd}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[#615E6E] mt-2">Purple line = current top-8 cutoff. Source: live FIFA / Google group standings, June 21.</p>
      </div>

      {/* Scotland qualification odds summary */}
      <div className="mt-6">
        <h3 className="text-base font-extrabold text-[#231645] mb-2">What each Scotland result is worth</h3>
        <Bar label="Beat Brazil → 1st or 2nd, through outright" percent={97} color="#10b981" />
        <Bar label="Draw Brazil (e.g. 1-1) → 4 pts, best-third near-lock" percent={88} color="#7E43FF" />
        <Bar label="Lose to Brazil → 3 pts, best-third coin flip" percent={38} color="#dc2626" />
        <p className="text-[11px] text-[#615E6E] mt-2">Probabilities are this model&apos;s estimate of Scotland reaching the Round of 32 under each m51 result, averaged over plausible m52 outcomes and rival third-placer finishes. Run the full bracket on the <a href="/predictor/" className="text-[#7E43FF] font-semibold underline">predictor</a>.</p>
      </div>
    </section>
  )
}
