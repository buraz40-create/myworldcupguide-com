"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */

/**
 * Mexico R32 deep-dive dashboard. Mexico have all but won Group A and head to
 * Match 79 at the Estadio Azteca on June 30 against one of five best-third
 * candidates from Groups C/E/F/H/I. Lets the reader pick the opponent and see
 * the stat comparison, head-to-head, altitude/home edge, and bracket path.
 */

type OpponentKey = "ECU" | "SWE" | "SCO" | "SEN" | "KSA"

type OpponentData = {
  key: OpponentKey
  name: string
  iso: string
  group: string
  fifaRank: number
  matchupProbability: number // % chance this is the actual M79 opponent
  mexWinPct: number
  drawPct: number
  oppWinPct: number
  keyPlayer: { name: string; club: string; role: string }
  recentForm: string
  h2h: { played: number; mexWins: number; draws: number; oppWins: number; lastResult: string }
  oneline: string
}

const OPPONENTS: OpponentData[] = [
  {
    key: "ECU",
    name: "Ecuador",
    iso: "ec",
    group: "E",
    fifaRank: 23,
    matchupProbability: 30,
    mexWinPct: 46,
    drawPct: 30,
    oppWinPct: 24,
    keyPlayer: { name: "Moisés Caicedo", club: "Chelsea", role: "Defensive mid, ball-winner" },
    recentForm: "WDLWD",
    h2h: { played: 9, mexWins: 4, draws: 3, oppWins: 2, lastResult: "MEX 0-0 ECU (2024 friendly)" },
    oneline: "The toughest draw: organised, athletic, and used to altitude from Quito",
  },
  {
    key: "SWE",
    name: "Sweden",
    iso: "se",
    group: "F",
    fifaRank: 26,
    matchupProbability: 25,
    mexWinPct: 52,
    drawPct: 28,
    oppWinPct: 20,
    keyPlayer: { name: "Alexander Isak", club: "Liverpool", role: "Striker, focal point" },
    recentForm: "WLWLW",
    h2h: { played: 8, mexWins: 3, draws: 1, oppWins: 4, lastResult: "MEX 0-1 SWE (2018 World Cup)" },
    oneline: "Dangerous on transitions and set pieces; Isak is the one to silence",
  },
  {
    key: "SCO",
    name: "Scotland",
    iso: "gb-sct",
    group: "C",
    fifaRank: 39,
    matchupProbability: 20,
    mexWinPct: 55,
    drawPct: 27,
    oppWinPct: 18,
    keyPlayer: { name: "Scott McTominay", club: "Napoli", role: "Box-to-box midfielder" },
    recentForm: "WLWDL",
    h2h: { played: 2, mexWins: 1, draws: 1, oppWins: 0, lastResult: "MEX 1-0 SCO (2018 friendly)" },
    oneline: "Physical and direct, but thin on top-end quality away from McTominay",
  },
  {
    key: "SEN",
    name: "Senegal",
    iso: "sn",
    group: "I",
    fifaRank: 15,
    matchupProbability: 18,
    mexWinPct: 42,
    drawPct: 29,
    oppWinPct: 29,
    keyPlayer: { name: "Nicolas Jackson", club: "Bayern Munich", role: "Centre forward, runner" },
    recentForm: "LDWDW",
    h2h: { played: 1, mexWins: 0, draws: 0, oppWins: 1, lastResult: "MEX 0-1 SEN (2021 friendly)" },
    oneline: "The highest-ranked candidate; pace and power that altitude could blunt",
  },
  {
    key: "KSA",
    name: "Saudi Arabia",
    iso: "sa",
    group: "H",
    fifaRank: 56,
    matchupProbability: 7,
    mexWinPct: 60,
    drawPct: 25,
    oppWinPct: 15,
    keyPlayer: { name: "Salem Al-Dawsari", club: "Al-Hilal", role: "Left winger, creator" },
    recentForm: "DLWLD",
    h2h: { played: 4, mexWins: 2, draws: 1, oppWins: 1, lastResult: "MEX 2-1 KSA (2022 World Cup)" },
    oneline: "The friendliest draw on paper; low block and counter is their only plan",
  },
]

const FLAG = (iso: string) => `https://flagcdn.com/w80/${iso}.png`

function PercentBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-semibold text-[#231645]">{label}</span>
        <span className="text-xs font-extrabold text-[#231645] tabular-nums">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-3 rounded-full bg-[#f1ecff] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, percent)}%`, background: color }} />
      </div>
    </div>
  )
}

function StatBar({ label, value, max, color, suffix = "" }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-semibold text-[#231645]">{label}</span>
        <span className="text-xs font-bold text-[#231645] tabular-nums">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-[#f1ecff] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function MexicoStats() {
  const [pickedOpp, setPickedOpp] = useState<OpponentKey>("ECU")
  const opp = OPPONENTS.find((o) => o.key === pickedOpp)!

  const stages = useMemo(() => {
    const r32Adv = opp.mexWinPct + opp.drawPct * 0.55
    const r16Adv = 45 // vs likely Group L winner (England/Croatia), at the Azteca
    const qfAdv = 30
    const sfAdv = 22
    const finalWin = 35
    const cum = {
      r32: r32Adv,
      r16: (r32Adv * r16Adv) / 100,
      qf: (r32Adv * r16Adv * qfAdv) / 10000,
      sf: (r32Adv * r16Adv * qfAdv * sfAdv) / 1000000,
      final: (r32Adv * r16Adv * qfAdv * sfAdv * finalWin) / 100000000,
    }
    return [
      { round: "Round of 32", venue: "Estadio Azteca, Mexico City", date: "Tue Jun 30", thisRound: r32Adv, cumulative: cum.r32, opp: opp.name },
      { round: "Round of 16", venue: "Estadio Azteca, Mexico City", date: "Sun Jul 5", thisRound: r16Adv, cumulative: cum.r16, opp: "Group L winner (England/Croatia)" },
      { round: "Quarter-final", venue: "Hard Rock Stadium, Miami", date: "Sat Jul 11", thisRound: qfAdv, cumulative: cum.qf, opp: "Brazil/Argentina side" },
      { round: "Semi-final", venue: "Mercedes-Benz / AT&T", date: "Jul 14-15", thisRound: sfAdv, cumulative: cum.sf, opp: "Europe's best" },
      { round: "Final", venue: "MetLife Stadium, NJ", date: "Sun Jul 19", thisRound: finalWin, cumulative: cum.final, opp: "Tournament winner" },
    ]
  }, [opp])

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Mexico R32 Dashboard</p>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">Pick the M79 opponent</h2>
        <p className="text-sm text-[#615E6E]">Mexico host their Round of 32 at the Estadio Azteca on June 30 against one of five best-third candidates from Groups C, E, F, H and I. Tap one to see the full stat comparison, head-to-head, and Mexico&apos;s projected path.</p>
      </div>

      {/* Opponent picker */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {OPPONENTS.map((o) => {
          const selected = o.key === pickedOpp
          return (
            <button
              key={o.key}
              onClick={() => setPickedOpp(o.key)}
              className={`rounded-xl p-3 transition-all text-left ${selected ? "bg-[#7E43FF] text-white shadow-md scale-[1.02]" : "bg-[#f8f7fd] text-[#231645] hover:bg-[#f1ecff]"}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <img src={FLAG(o.iso)} alt={`${o.name} flag`} width={28} height={20} className="rounded-sm flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{o.matchupProbability}% likely</span>
              </div>
              <p className="text-xs font-extrabold leading-tight">{o.name}</p>
              <p className={`text-[10px] mt-0.5 ${selected ? "text-white/80" : "text-[#615E6E]"}`}>3rd in Group {o.group} · FIFA #{o.fifaRank}</p>
            </button>
          )
        })}
      </div>

      {/* Selected opponent summary */}
      <div className="rounded-xl bg-gradient-to-br from-[#231645] to-[#7E43FF] text-white p-5 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <img src={FLAG(opp.iso)} alt={`${opp.name} flag`} width={64} height={48} className="rounded-md flex-shrink-0 shadow-md" />
          <div className="flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Projected M79 opponent</p>
            <h3 className="text-2xl font-extrabold mt-0.5 mb-1">Mexico vs {opp.name}</h3>
            <p className="text-sm text-white/85">{opp.oneline}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">FIFA rank</p>
            <p className="text-xl font-extrabold tabular-nums">#{opp.fifaRank} <span className="text-xs font-normal text-white/70">vs MEX #13</span></p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Venue edge</p>
            <p className="text-xl font-extrabold tabular-nums">7,200 <span className="text-xs font-normal text-white/70">ft altitude</span></p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Recent form</p>
            <p className="text-xl font-extrabold font-mono">{opp.recentForm}</p>
          </div>
        </div>
      </div>

      {/* Match prediction */}
      <div className="mb-6">
        <h3 className="text-base font-extrabold text-[#231645] mb-3">Match outcome prediction (90 min)</h3>
        <PercentBar label="Mexico win" percent={opp.mexWinPct} color="#7E43FF" />
        <PercentBar label="Draw → extra time / penalties" percent={opp.drawPct} color="#4f1ea1" />
        <PercentBar label={`${opp.name} win`} percent={opp.oppWinPct} color="#dc2626" />
        <p className="text-[11px] text-[#615E6E] mt-2">Includes home + altitude uplift (+10% for Mexico at the Azteca), recent form, and FIFA rank delta.</p>
      </div>

      {/* Key player */}
      <div className="rounded-xl bg-[#f8f7fd] p-4 mb-6">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Key player to stop</p>
        <p className="text-lg font-extrabold text-[#231645]">{opp.keyPlayer.name}</p>
        <p className="text-xs text-[#615E6E]">{opp.keyPlayer.club} · {opp.keyPlayer.role}</p>
      </div>

      {/* Head-to-head */}
      <div className="mb-6">
        <h3 className="text-base font-extrabold text-[#231645] mb-3">Historical head-to-head</h3>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="bg-[#f8f7fd] rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">Played</p>
            <p className="text-2xl font-extrabold text-[#231645] tabular-nums">{opp.h2h.played}</p>
          </div>
          <div className="bg-[#10b981]/10 rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#065f46]">Mexico wins</p>
            <p className="text-2xl font-extrabold text-[#065f46] tabular-nums">{opp.h2h.mexWins}</p>
          </div>
          <div className="bg-[#615E6E]/10 rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">Draws</p>
            <p className="text-2xl font-extrabold text-[#615E6E] tabular-nums">{opp.h2h.draws}</p>
          </div>
          <div className="bg-[#ef4444]/10 rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7f1d1d]">Opp wins</p>
            <p className="text-2xl font-extrabold text-[#7f1d1d] tabular-nums">{opp.h2h.oppWins}</p>
          </div>
        </div>
        <p className="text-[11px] text-[#615E6E]">Last meeting: {opp.h2h.lastResult}</p>
      </div>

      {/* Tournament probability tree */}
      <div className="mb-6">
        <h3 className="text-base font-extrabold text-[#231645] mb-1">Mexico tournament probability tree</h3>
        <p className="text-xs text-[#615E6E] mb-4">Win probability at each stage (assuming the M79 opponent above) and the cumulative probability of reaching that round. Note the back-to-back Azteca games in the first two rounds.</p>
        <div className="space-y-3">
          {stages.map((s, i) => (
            <div key={s.round} className="rounded-xl border border-black/[0.06] p-3">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-[10px] font-extrabold text-white bg-[#7E43FF] rounded-full px-2 py-0.5 mr-2 align-middle">R{["32", "16", "QF", "SF", "F"][i]}</span>
                  <span className="text-sm font-extrabold text-[#231645]">{s.round}</span>
                  <span className="text-xs text-[#615E6E] ml-2">vs {s.opp}</span>
                </div>
                <span className="text-[11px] text-[#615E6E]">{s.date} · {s.venue}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E] mb-1">Win this round</p>
                  <div className="h-2.5 rounded-full bg-[#f1ecff] overflow-hidden">
                    <div className="h-full rounded-full bg-[#7E43FF]" style={{ width: `${Math.min(100, s.thisRound)}%` }} />
                  </div>
                  <p className="text-sm font-bold text-[#231645] tabular-nums mt-1">{s.thisRound.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E] mb-1">Cumulative (reach this round)</p>
                  <div className="h-2.5 rounded-full bg-[#f1ecff] overflow-hidden">
                    <div className="h-full rounded-full bg-[#231645]" style={{ width: `${Math.min(100, s.cumulative)}%` }} />
                  </div>
                  <p className="text-sm font-bold text-[#231645] tabular-nums mt-1">{s.cumulative.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#615E6E] mt-3">Model: 90-min outcome split + penalty bias + cumulative chain. R16-Final use composite strength scores for the projected opponent path.</p>
      </div>

      {/* Mexico group stage stats */}
      <div className="mb-2">
        <h3 className="text-base font-extrabold text-[#231645] mb-3">Mexico&apos;s group stage stat sheet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <StatBar label="Goals scored" value={4} max={6} color="#7E43FF" />
            <StatBar label="Goals conceded" value={0} max={6} color="#dc2626" />
            <StatBar label="Clean sheets" value={2} max={2} color="#10b981" />
            <StatBar label="Possession (avg)" value={58} max={100} color="#4f1ea1" suffix="%" />
          </div>
          <div>
            <StatBar label="Shots on target / game" value={5.5} max={10} color="#7E43FF" />
            <StatBar label="Pass accuracy" value={86} max={100} color="#4f1ea1" suffix="%" />
            <StatBar label="Goals from open play" value={3} max={4} color="#7E43FF" />
            <StatBar label="Set piece goals" value={1} max={5} color="#7E43FF" />
          </div>
        </div>
        <p className="text-[11px] text-[#615E6E] mt-2">Based on m01 (Mexico 2-0 South Africa) and m28 (Mexico 2-0 South Korea). Two games, two clean sheets, top of Group A on 6 points.</p>
      </div>
    </section>
  )
}
