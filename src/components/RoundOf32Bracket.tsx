"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */

/**
 * Interactive 2026 World Cup knockout bracket, seeded with the real Round of
 * 32 fixtures resolved from the final group standings. Columns are laid out in
 * true bracket-tree order so each match sits between the two matches that feed
 * it. The bracket loads pre-filled with the seeded projection (higher FIFA
 * rank advances); tap any team to change a result and everything downstream
 * recomputes, or Reset to fill it in from scratch.
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
  if (!d) return ""
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

type Pick = Record<string, string> // match key -> winning team name

// Pure: the full seeded projection (lower FIFA rank advances each round).
function rankingPicks(data: BracketData): Pick {
  const next: Pick = {}
  const higher = (key: string, a: BracketTeam | null, b: BracketTeam | null): BracketTeam | null => {
    if (!a) return b
    if (!b) return a
    const w = a.rank <= b.rank ? a : b
    next[key] = w.name
    return w
  }
  const r32W = data.r32.map((m, i) => higher(`r32-${i}`, m.home, m.away))
  const r16W = data.structures.r16.map(([a, b], i) => higher(`r16-${i}`, r32W[a], r32W[b]))
  const qfW = data.structures.qf.map(([a, b], i) => higher(`qf-${i}`, r16W[a], r16W[b]))
  const sfW = data.structures.sf.map(([a, b], i) => higher(`sf-${i}`, qfW[a], qfW[b]))
  const [fa, fb] = data.structures.final
  higher("final", sfW[fa], sfW[fb])
  return next
}

function TeamRow({
  team, picked, dimmed, onClick,
}: { team: BracketTeam | null; picked: boolean; dimmed: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={team ? onClick : undefined}
      disabled={!team}
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left transition-colors ${
        picked ? "bg-[#7E43FF] text-white" : dimmed ? "opacity-40 hover:opacity-100 hover:bg-[#f1ecff]" : "hover:bg-[#f1ecff]"
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
      {sub && <div className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#615E6E] bg-[#f8f7fd] border-b border-black/[0.05] truncate">{sub}</div>}
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
  const [picks, setPicks] = useState<Pick>(() => rankingPicks(data))

  const setPick = (key: string, team: string) => setPicks((p) => ({ ...p, [key]: team }))

  const winnerOf = (key: string, a: BracketTeam | null, b: BracketTeam | null): BracketTeam | null => {
    const w = picks[key]
    if (a && w === a.name) return a
    if (b && w === b.name) return b
    return null
  }

  // True bracket-tree leaf order so feeders are adjacent and columns align.
  const order = useMemo(() => {
    const sf = data.structures.final.slice()                       // [0,1]
    const qf = sf.flatMap((si) => data.structures.sf[si])          // sf->qf
    const r16 = qf.flatMap((qi) => data.structures.qf[qi])         // qf->r16
    const r32 = r16.flatMap((ri) => data.structures.r16[ri])       // r16->r32
    return { sf, qf, r16, r32 }
  }, [data])

  const rounds = useMemo(() => {
    const r32W = data.r32.map((m, i) => winnerOf(`r32-${i}`, m.home, m.away))
    const r16 = data.structures.r16.map(([a, b]) => ({ home: r32W[a], away: r32W[b] }))
    const r16W = r16.map((m, i) => winnerOf(`r16-${i}`, m.home, m.away))
    const qf = data.structures.qf.map(([a, b]) => ({ home: r16W[a], away: r16W[b] }))
    const qfW = qf.map((m, i) => winnerOf(`qf-${i}`, m.home, m.away))
    const sf = data.structures.sf.map(([a, b]) => ({ home: qfW[a], away: qfW[b] }))
    const sfW = sf.map((m, i) => winnerOf(`sf-${i}`, m.home, m.away))
    const [fa, fb] = data.structures.final
    const final = { home: sfW[fa], away: sfW[fb] }
    const champion = winnerOf("final", final.home, final.away)
    return { r16, qf, sf, final, champion }
  }, [picks, data])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={() => setPicks(rankingPicks(data))} className="btn-primary text-xs py-1.5 px-4">Reset to seeded projection</button>
        <button onClick={() => setPicks({})} className="text-xs font-semibold text-[#615E6E] hover:text-[#231645] underline">Clear all</button>
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
            {order.r32.map((idx) => {
              const m = data.r32[idx]
              return (
                <MatchCard
                  key={idx}
                  home={m.home}
                  away={m.away}
                  winnerName={picks[`r32-${idx}`] ?? null}
                  onPick={(t) => setPick(`r32-${idx}`, t)}
                  sub={`${fmtDate(m.date)} · ${m.city}`}
                />
              )
            })}
          </Column>

          {/* Round of 16 */}
          <Column title="Round of 16" sub="Jul 4 - Jul 7">
            {order.r16.map((idx) => {
              const m = rounds.r16[idx]
              const meta = data.meta.r16[idx]
              return (
                <MatchCard
                  key={idx}
                  home={m.home}
                  away={m.away}
                  winnerName={picks[`r16-${idx}`] ?? null}
                  onPick={(t) => setPick(`r16-${idx}`, t)}
                  sub={meta ? `${fmtDate(meta.date)} · ${meta.city}` : undefined}
                />
              )
            })}
          </Column>

          {/* Quarter-finals */}
          <Column title="Quarter-finals" sub="Jul 9 - Jul 11">
            {order.qf.map((idx) => {
              const m = rounds.qf[idx]
              const meta = data.meta.qf[idx]
              return (
                <MatchCard
                  key={idx}
                  home={m.home}
                  away={m.away}
                  winnerName={picks[`qf-${idx}`] ?? null}
                  onPick={(t) => setPick(`qf-${idx}`, t)}
                  sub={meta ? `${fmtDate(meta.date)} · ${meta.city}` : undefined}
                />
              )
            })}
          </Column>

          {/* Semi-finals */}
          <Column title="Semi-finals" sub="Jul 14 - Jul 15">
            {order.sf.map((idx) => {
              const m = rounds.sf[idx]
              const meta = data.meta.sf[idx]
              return (
                <MatchCard
                  key={idx}
                  home={m.home}
                  away={m.away}
                  winnerName={picks[`sf-${idx}`] ?? null}
                  onPick={(t) => setPick(`sf-${idx}`, t)}
                  sub={meta ? `${fmtDate(meta.date)} · ${meta.city}` : undefined}
                />
              )
            })}
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
      <p className="text-[11px] text-[#615E6E] mt-2">Loads with the seeded projection (higher FIFA rank advances). Tap any team to change a result and the rest of the bracket updates. Best-third placements follow FIFA&apos;s candidate-group structure.</p>
    </div>
  )
}
