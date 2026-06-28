"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */

/**
 * Interactive 2026 World Cup knockout bracket, seeded with the real Round of
 * 32 fixtures resolved from the final group standings. The reader clicks a
 * team to advance it; picks cascade through R16, QF, SF and the Final. Later
 * rounds recompute from upstream picks, so changing an early winner updates
 * everything downstream automatically.
 */

export type BracketTeam = { name: string; iso2: string; slug?: string; rank: number }
export type R32Entry = {
  matchNumber: number
  date: string
  time: string
  city: string
  home: BracketTeam | null
  away: BracketTeam | null
}
export type RoundMeta = { date: string; city: string }
export type BracketData = {
  r32: R32Entry[]
  structures: { r16: number[][]; qf: number[][]; sf: number[][]; final: number[] }
  meta: { r16: RoundMeta[]; qf: RoundMeta[]; sf: RoundMeta[]; final: RoundMeta }
}

const FLAG = (iso: string) => `https://flagcdn.com/w40/${iso}.png`

function fmtDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

type Pick = Record<string, string> // match key -> winning team name

function TeamRow({
  team, picked, dimmed, onClick,
}: { team: BracketTeam | null; picked: boolean; dimmed: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={team ? onClick : undefined}
      disabled={!team}
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left transition-colors ${
        picked ? "bg-[#7E43FF] text-white" : dimmed ? "opacity-40" : "hover:bg-[#f1ecff]"
      }`}
    >
      {team ? (
        <>
          <img src={FLAG(team.iso2)} alt="" width={18} height={13} className="rounded-sm flex-shrink-0" />
          <span className={`text-[11px] font-semibold truncate ${picked ? "text-white" : "text-[#231645]"}`}>{team.name}</span>
        </>
      ) : (
        <span className="text-[11px] text-[#615E6E] italic">TBD</span>
      )}
    </button>
  )
}

function MatchCard({
  home, away, winnerName, onPick, sub,
}: {
  home: BracketTeam | null
  away: BracketTeam | null
  winnerName: string | null
  onPick: (teamName: string) => void
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white overflow-hidden shadow-sm w-[150px] flex-shrink-0">
      {sub && <div className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#615E6E] bg-[#f8f7fd] border-b border-black/[0.05]">{sub}</div>}
      <TeamRow team={home} picked={!!home && winnerName === home.name} dimmed={!!winnerName && !!home && winnerName !== home.name} onClick={home ? () => onPick(home.name) : undefined} />
      <div className="h-px bg-black/[0.06]" />
      <TeamRow team={away} picked={!!away && winnerName === away.name} dimmed={!!winnerName && !!away && winnerName !== away.name} onClick={away ? () => onPick(away.name) : undefined} />
    </div>
  )
}

function Column({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-shrink-0">
      <div className="mb-3 px-1">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#7E43FF]">{title}</p>
        {sub && <p className="text-[10px] text-[#615E6E]">{sub}</p>}
      </div>
      <div className="flex flex-col justify-around flex-1 gap-2">{children}</div>
    </div>
  )
}

export default function RoundOf32Bracket({ data }: { data: BracketData }) {
  const [picks, setPicks] = useState<Pick>({})

  const setPick = (key: string, team: string) =>
    setPicks((p) => ({ ...p, [key]: team }))

  // Resolve the winner of a match given its stored pick and current teams.
  // If the stored pick is not one of the two present teams (because an upstream
  // change swapped a team out), it is ignored.
  const winnerOf = (key: string, a: BracketTeam | null, b: BracketTeam | null): BracketTeam | null => {
    const w = picks[key]
    if (a && w === a.name) return a
    if (b && w === b.name) return b
    return null
  }

  // Compute each round from upstream picks.
  const rounds = useMemo(() => {
    const r32 = data.r32
    const r32Winners = r32.map((m, i) => winnerOf(`r32-${i}`, m.home, m.away))

    const r16 = data.structures.r16.map(([ai, bi]) => ({ home: r32Winners[ai], away: r32Winners[bi] }))
    const r16Winners = r16.map((m, i) => winnerOf(`r16-${i}`, m.home, m.away))

    const qf = data.structures.qf.map(([ai, bi]) => ({ home: r16Winners[ai], away: r16Winners[bi] }))
    const qfWinners = qf.map((m, i) => winnerOf(`qf-${i}`, m.home, m.away))

    const sf = data.structures.sf.map(([ai, bi]) => ({ home: qfWinners[ai], away: qfWinners[bi] }))
    const sfWinners = sf.map((m, i) => winnerOf(`sf-${i}`, m.home, m.away))

    const [fa, fb] = data.structures.final
    const final = { home: sfWinners[fa], away: sfWinners[fb] }
    const champion = winnerOf("final", final.home, final.away)

    return { r16, qf, sf, final, champion }
  }, [picks, data])

  // Auto-fill the whole bracket by higher FIFA seed (lower rank number wins).
  const autoFill = () => {
    const next: Pick = {}
    const pickHigher = (key: string, a: BracketTeam | null, b: BracketTeam | null): BracketTeam | null => {
      if (!a) return b
      if (!b) return a
      const w = a.rank <= b.rank ? a : b
      next[key] = w.name
      return w
    }
    const r32W = data.r32.map((m, i) => pickHigher(`r32-${i}`, m.home, m.away))
    const r16W = data.structures.r16.map(([ai, bi], i) => pickHigher(`r16-${i}`, r32W[ai], r32W[bi]))
    const qfW = data.structures.qf.map(([ai, bi], i) => pickHigher(`qf-${i}`, r16W[ai], r16W[bi]))
    const sfW = data.structures.sf.map(([ai, bi], i) => pickHigher(`sf-${i}`, qfW[ai], qfW[bi]))
    const [fa, fb] = data.structures.final
    pickHigher("final", sfW[fa], sfW[fb])
    setPicks(next)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={autoFill} className="btn-primary text-xs py-1.5 px-4">Auto-fill by ranking</button>
        <button onClick={() => setPicks({})} className="text-xs font-semibold text-[#615E6E] hover:text-[#231645] underline">Reset</button>
        {rounds.champion && (
          <span className="ml-auto inline-flex items-center gap-2 text-sm font-extrabold text-[#231645]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF]">Your champion</span>
            <img src={FLAG(rounds.champion.iso2)} alt="" width={22} height={16} className="rounded-sm" />
            {rounds.champion.name} 🏆
          </span>
        )}
      </div>

      <div className="overflow-x-auto pb-4 -mx-1 px-1">
        <div className="flex gap-4 min-w-max items-stretch">
          {/* Round of 32 */}
          <Column title="Round of 32" sub="Jun 28 - Jul 3">
            {data.r32.map((m, i) => (
              <MatchCard
                key={i}
                home={m.home}
                away={m.away}
                winnerName={picks[`r32-${i}`] ?? null}
                onPick={(t) => setPick(`r32-${i}`, t)}
                sub={`${fmtDate(m.date)} · ${m.city}`}
              />
            ))}
          </Column>

          {/* Round of 16 */}
          <Column title="Round of 16" sub="Jul 4 - Jul 7">
            {rounds.r16.map((m, i) => (
              <MatchCard
                key={i}
                home={m.home}
                away={m.away}
                winnerName={picks[`r16-${i}`] ?? null}
                onPick={(t) => setPick(`r16-${i}`, t)}
                sub={data.meta.r16[i] ? `${fmtDate(data.meta.r16[i].date)} · ${data.meta.r16[i].city}` : undefined}
              />
            ))}
          </Column>

          {/* Quarter-finals */}
          <Column title="Quarter-finals" sub="Jul 9 - Jul 11">
            {rounds.qf.map((m, i) => (
              <MatchCard
                key={i}
                home={m.home}
                away={m.away}
                winnerName={picks[`qf-${i}`] ?? null}
                onPick={(t) => setPick(`qf-${i}`, t)}
                sub={data.meta.qf[i] ? `${fmtDate(data.meta.qf[i].date)} · ${data.meta.qf[i].city}` : undefined}
              />
            ))}
          </Column>

          {/* Semi-finals */}
          <Column title="Semi-finals" sub="Jul 14 - Jul 15">
            {rounds.sf.map((m, i) => (
              <MatchCard
                key={i}
                home={m.home}
                away={m.away}
                winnerName={picks[`sf-${i}`] ?? null}
                onPick={(t) => setPick(`sf-${i}`, t)}
                sub={data.meta.sf[i] ? `${fmtDate(data.meta.sf[i].date)} · ${data.meta.sf[i].city}` : undefined}
              />
            ))}
          </Column>

          {/* Final */}
          <Column title="Final" sub={`${fmtDate(data.meta.final.date)} · ${data.meta.final.city}`}>
            <MatchCard
              home={rounds.final.home}
              away={rounds.final.away}
              winnerName={picks["final"] ?? null}
              onPick={(t) => setPick("final", t)}
              sub="World Cup Final"
            />
            <div className="rounded-lg border-2 border-dashed border-[#7E43FF]/40 bg-[#faf9fe] p-3 text-center w-[150px] flex-shrink-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#7E43FF] mb-1">Champion</p>
              {rounds.champion ? (
                <div className="flex items-center justify-center gap-1.5">
                  <img src={FLAG(rounds.champion.iso2)} alt="" width={20} height={14} className="rounded-sm" />
                  <span className="text-xs font-extrabold text-[#231645] truncate">{rounds.champion.name}</span>
                </div>
              ) : (
                <p className="text-[11px] text-[#615E6E] italic">Pick the final</p>
              )}
            </div>
          </Column>
        </div>
      </div>
      <p className="text-[11px] text-[#615E6E] mt-2">Tap a team to send it through. Later rounds update from your picks. Best-third placements follow FIFA&apos;s candidate-group structure for the eight qualifying third-placed teams.</p>
    </div>
  )
}
