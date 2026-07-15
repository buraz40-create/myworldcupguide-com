"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import { matches } from "@/data/matches"
import results from "@/data/matchResults.json"
import { iso2 } from "@/lib/predictorEngine"

/**
 * Interactive "final four" tracker. Reads the two semi-finals, the final and the
 * third-place game from live data. Completed games are locked to the real
 * result; for anything still to play, the reader picks the winner and the final
 * (and third-place game) update live.
 */

type Res = { homeScore?: number; awayScore?: number; status?: string; penaltyHome?: number; penaltyAway?: number }
const R = results as Record<string, Res>
const FLAG = (c: string) => `https://flagcdn.com/w80/${c}.png`
const byNum = new Map(matches.map((m) => [m.matchNumber, m]))

function game(n: number) {
  const m = byNum.get(n)
  if (!m) return null
  const home = m.homeTeam !== "TBD" ? m.homeTeam : null
  const away = m.awayTeam !== "TBD" ? m.awayTeam : null
  const r = R[m.id]
  const played = !!r && ["FT", "AET", "PEN"].includes(r.status ?? "") && r.homeScore != null && r.awayScore != null
  let winner: string | null = null, loser: string | null = null, score = ""
  if (played && home && away) {
    const hw = r!.homeScore! > r!.awayScore! || (r!.homeScore! === r!.awayScore! && (r!.penaltyHome ?? 0) > (r!.penaltyAway ?? 0))
    winner = hw ? home : away
    loser = hw ? away : home
    score = `${r!.homeScore}-${r!.awayScore}` + (r!.status === "AET" ? " AET" : r!.status === "PEN" ? ` (${r!.penaltyHome}-${r!.penaltyAway}p)` : "")
  }
  return { m, home, away, played, winner, loser, score }
}

function Pill({ team, picked, dimmed, onClick, locked }: { team: string | null; picked: boolean; dimmed: boolean; onClick?: () => void; locked: boolean }) {
  return (
    <button
      onClick={team && !locked ? onClick : undefined}
      disabled={!team || locked}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${picked ? "bg-[#7E43FF] text-white" : dimmed ? "opacity-40" : "bg-[#f8f7fd] hover:bg-[#f1ecff]"}`}
    >
      {team ? <img src={FLAG(iso2(team))} alt="" width={22} height={16} className="rounded-sm flex-shrink-0" /> : null}
      <span className={`text-sm font-bold truncate ${picked ? "text-white" : "text-[#231645]"}`}>{team ?? "TBD"}</span>
      {picked && <span className="ml-auto text-[10px] font-extrabold">{locked ? "✓" : "→"}</span>}
    </button>
  )
}

export default function SemifinalCentre() {
  const sf1 = useMemo(() => game(101), [])
  const sf2 = useMemo(() => game(102), [])
  const finalGame = useMemo(() => game(104), [])
  const third = useMemo(() => game(103), [])

  const [sf2Pick, setSf2Pick] = useState<string | null>(null)
  const [finalPick, setFinalPick] = useState<string | null>(null)

  if (!sf1 || !sf2 || !finalGame) return null

  const sf1Winner = sf1.winner
  const sf2Winner = sf2.played ? sf2.winner : sf2Pick
  const finalTeams = [sf1Winner, sf2Winner] as (string | null)[]
  const champion = finalGame.played ? finalGame.winner : finalPick
  const thirdTeams = [sf1.loser, sf2.played ? sf2.loser : (sf2Pick && sf2.home && sf2.away ? (sf2Pick === sf2.home ? sf2.away : sf2.home) : null)]

  const SemiCard = ({ g, pick, setPick, title }: { g: NonNullable<ReturnType<typeof game>>; pick: string | null; setPick: (t: string) => void; title: string }) => (
    <div className="rounded-xl border border-black/[0.08] bg-white overflow-hidden">
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#615E6E] bg-[#f8f7fd] border-b border-black/[0.05] flex justify-between">
        <span>{title}</span>{g.played ? <span className="text-[#231645]">{g.score}</span> : <span>Your pick</span>}
      </div>
      <div className="p-2 space-y-1.5">
        {[g.home, g.away].map((t, i) => {
          const w = g.played ? g.winner : pick
          return <Pill key={i} team={t} picked={!!t && w === t} dimmed={!!w && !!t && w !== t} locked={g.played} onClick={() => t && setPick(t)} />
        })}
      </div>
    </div>
  )

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 md:p-7 my-8">
      <div className="mb-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">Interactive · Final four</p>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#231645] mb-2">Build the road to the trophy</h2>
        <p className="text-sm text-[#615E6E]">Played games are locked to the real result. For anything still to come, tap a team to send it through, and the final and third-place game update live.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <SemiCard g={sf1} pick={sf2Pick} setPick={() => {}} title="Semi-final 1" />
        <SemiCard g={sf2} pick={sf2Pick} setPick={setSf2Pick} title="Semi-final 2" />
      </div>

      {/* Final */}
      <div className="rounded-xl border-2 border-[#eab308]/40 bg-[#fffbeb] overflow-hidden mb-4">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#a16207] bg-[#eab30815] border-b border-[#eab308]/20 flex justify-between">
          <span>🏆 Final · Jul 19 · MetLife</span>{finalGame.played ? <span>{finalGame.score}</span> : null}
        </div>
        <div className="p-2 space-y-1.5">
          {finalTeams.map((t, i) => {
            const w = finalGame.played ? finalGame.winner : finalPick
            return <Pill key={i} team={t} picked={!!t && w === t} dimmed={!!w && !!t && w !== t} locked={finalGame.played} onClick={() => t && setFinalPick(t)} />
          })}
        </div>
      </div>

      {/* Champion + third */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-[#231645] to-[#7E43FF] text-white p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Champion</p>
          {champion ? (
            <div className="flex items-center justify-center gap-2"><img src={FLAG(iso2(champion))} alt="" width={26} height={19} className="rounded-sm" /><span className="text-lg font-extrabold">{champion}</span> 🏆</div>
          ) : <p className="text-sm text-white/70 italic">Pick the final</p>}
        </div>
        <div className="rounded-xl bg-[#f8f7fd] p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E] mb-1">Third-place game · Jul 18</p>
          <p className="text-sm font-bold text-[#231645]">{thirdTeams[0] ?? "TBD"} vs {thirdTeams[1] ?? "TBD"}</p>
          {third?.played && <p className="text-xs text-[#615E6E] mt-1">{third.score} · {third.winner} take bronze</p>}
        </div>
      </div>
    </section>
  )
}
