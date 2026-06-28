"use client"

import { useMemo, useState } from "react"
/* eslint-disable @next/next/no-img-element */

/**
 * Interactive 2026 World Cup knockout bracket in true two-sided form: the left
 * and right halves funnel inward to a centre Final. Seeded with the real Round
 * of 32 fixtures resolved from the final group standings. Starts empty; the
 * reader clicks a team to pick the winner of each tie and the picks cascade
 * inward. Changing an earlier winner recomputes everything downstream.
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
export type RoundMeta = { date: string; time: string; city: string }
export type BracketData = {
  r32: R32Entry[]
  structures: { r16: number[][]; qf: number[][]; sf: number[][]; final: number[] }
  meta: { r16: RoundMeta[]; qf: RoundMeta[]; sf: RoundMeta[]; final: RoundMeta }
}

const FLAG = (iso: string) => `https://flagcdn.com/w40/${iso}.png`

function fmtDate(d: string) {
  if (!d) return ""
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
function fmtTime(t: string) {
  if (!t) return ""
  const [h, m] = t.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`
}

type Pick = Record<string, string>

function TeamRow({
  team, picked, decided, mirror, onClick,
}: { team: BracketTeam | null; picked: boolean; decided: boolean; mirror: boolean; onClick?: () => void }) {
  const dimmed = decided && !picked
  return (
    <button
      onClick={team ? onClick : undefined}
      disabled={!team}
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 transition-colors ${mirror ? "flex-row-reverse text-right" : "text-left"} ${
        picked ? "bg-[#7E43FF] text-white" : dimmed ? "opacity-45 hover:opacity-100 hover:bg-[#f1ecff]" : "hover:bg-[#f1ecff]"
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${picked ? "border-white bg-white" : "border-[#c9c2e0]"}`}>
        {picked && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#7E43FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {team ? (
        <>
          <img src={FLAG(team.iso2)} alt="" width={18} height={13} className="rounded-sm flex-shrink-0" />
          <span className={`text-[11px] font-semibold truncate flex-1 ${picked ? "text-white" : "text-[#231645]"}`}>{team.name}</span>
        </>
      ) : (
        <span className="text-[11px] text-[#615E6E] italic flex-1">TBD</span>
      )}
    </button>
  )
}

function MatchCard({
  home, away, winnerName, onPick, sub, mirror = false,
}: {
  home: BracketTeam | null
  away: BracketTeam | null
  winnerName: string | null
  onPick: (teamName: string) => void
  sub?: string
  mirror?: boolean
}) {
  const decided = !!winnerName
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white overflow-hidden shadow-sm w-[160px] flex-shrink-0">
      <TeamRow team={home} picked={!!home && winnerName === home.name} decided={decided} mirror={mirror} onClick={home ? () => onPick(home.name) : undefined} />
      <div className="h-px bg-black/[0.06]" />
      <TeamRow team={away} picked={!!away && winnerName === away.name} decided={decided} mirror={mirror} onClick={away ? () => onPick(away.name) : undefined} />
      {sub && <div className={`px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#615E6E] bg-[#f8f7fd] border-t border-black/[0.05] truncate ${mirror ? "text-right" : ""}`}>{sub}</div>}
    </div>
  )
}

function Column({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-shrink-0">
      <div className="mb-3 px-1 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#7E43FF]">{title}</p>
        {sub && <p className="text-[10px] text-[#615E6E]">{sub}</p>}
      </div>
      <div className="flex flex-col justify-around flex-1 gap-2">{children}</div>
    </div>
  )
}

const SHARE_URL = "https://myworldcupguide.com/round-of-32/"

export default function RoundOf32Bracket({ data }: { data: BracketData }) {
  const [picks, setPicks] = useState<Pick>({})
  const [copied, setCopied] = useState(false)
  const setPick = (key: string, team: string) => setPicks((p) => ({ ...p, [key]: team }))

  const winnerOf = (key: string, a: BracketTeam | null, b: BracketTeam | null): BracketTeam | null => {
    const w = picks[key]
    if (a && w === a.name) return a
    if (b && w === b.name) return b
    return null
  }

  // Split the bracket tree into left and right halves at the two semi-finals.
  const halves = useMemo(() => {
    const [sfL, sfR] = data.structures.final
    const qfL = data.structures.sf[sfL]
    const qfR = data.structures.sf[sfR]
    const r16L = qfL.flatMap((q) => data.structures.qf[q])
    const r16R = qfR.flatMap((q) => data.structures.qf[q])
    const r32L = r16L.flatMap((r) => data.structures.r16[r])
    const r32R = r16R.flatMap((r) => data.structures.r16[r])
    return { sfL, sfR, qfL, qfR, r16L, r16R, r32L, r32R }
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
    const decided =
      r32W.filter(Boolean).length + r16W.filter(Boolean).length +
      qfW.filter(Boolean).length + sfW.filter(Boolean).length + (champion ? 1 : 0)
    return { r16, qf, sf, final, champion, decided }
  }, [picks, data])

  // Renderers keyed by actual match index.
  const r32Card = (idx: number, mirror: boolean) => {
    const m = data.r32[idx]
    return (
      <MatchCard key={`r32-${idx}`} home={m.home} away={m.away} mirror={mirror}
        winnerName={picks[`r32-${idx}`] ?? null} onPick={(t) => setPick(`r32-${idx}`, t)}
        sub={`${m.city} · ${fmtDate(m.date)} ${fmtTime(m.time)}`} />
    )
  }
  const r16Card = (idx: number, mirror: boolean) => {
    const m = rounds.r16[idx]; const mt = data.meta.r16[idx]
    return (
      <MatchCard key={`r16-${idx}`} home={m.home} away={m.away} mirror={mirror}
        winnerName={picks[`r16-${idx}`] ?? null} onPick={(t) => setPick(`r16-${idx}`, t)}
        sub={mt ? `${mt.city} · ${fmtDate(mt.date)}` : undefined} />
    )
  }
  const qfCard = (idx: number, mirror: boolean) => {
    const m = rounds.qf[idx]; const mt = data.meta.qf[idx]
    return (
      <MatchCard key={`qf-${idx}`} home={m.home} away={m.away} mirror={mirror}
        winnerName={picks[`qf-${idx}`] ?? null} onPick={(t) => setPick(`qf-${idx}`, t)}
        sub={mt ? `${mt.city} · ${fmtDate(mt.date)}` : undefined} />
    )
  }
  const sfCard = (idx: number, mirror: boolean) => {
    const m = rounds.sf[idx]; const mt = data.meta.sf[idx]
    return (
      <MatchCard key={`sf-${idx}`} home={m.home} away={m.away} mirror={mirror}
        winnerName={picks[`sf-${idx}`] ?? null} onPick={(t) => setPick(`sf-${idx}`, t)}
        sub={mt ? `${mt.city} · ${fmtDate(mt.date)}` : undefined} />
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={() => setPicks({})} className="text-xs font-semibold text-[#615E6E] hover:text-[#231645] underline">Clear picks</button>
        <span className="text-xs font-bold text-[#231645] tabular-nums">{rounds.decided}/31 picks made</span>
        {rounds.champion && (
          <span className="ml-auto inline-flex items-center gap-2 text-sm font-extrabold text-[#231645]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E43FF]">Your champion</span>
            <img src={FLAG(rounds.champion.iso2)} alt="" width={22} height={16} className="rounded-sm" />
            {rounds.champion.name} 🏆
          </span>
        )}
      </div>

      <div className="overflow-x-auto pb-4 -mx-1 px-1">
        <div className="flex gap-3 min-w-max items-stretch">
          {/* LEFT half */}
          <Column title="Round of 32" sub="Jun 28 - Jul 3">{halves.r32L.map((i) => r32Card(i, false))}</Column>
          <Column title="Round of 16" sub="Jul 4 - 7">{halves.r16L.map((i) => r16Card(i, false))}</Column>
          <Column title="Quarter-finals" sub="Jul 9 - 11">{halves.qfL.map((i) => qfCard(i, false))}</Column>

          {/* CENTRE: SF left, Final + champion, SF right */}
          <div className="flex flex-col justify-around flex-shrink-0 px-1">
            <div className="text-center mb-1">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#7E43FF]">Semi-final</p>
              <p className="text-[10px] text-[#615E6E]">Jul 14</p>
            </div>
            {sfCard(halves.sfL, false)}
            <div className="my-3 rounded-xl border-2 border-[#7E43FF]/30 bg-[#faf9fe] p-2 w-[170px] flex-shrink-0">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] text-center mb-1">Final · Jul 19</p>
              <MatchCard home={rounds.final.home} away={rounds.final.away}
                winnerName={picks["final"] ?? null} onPick={(t) => setPick("final", t)} />
              <div className="mt-2 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#615E6E]">Champion</p>
                {rounds.champion ? (
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <img src={FLAG(rounds.champion.iso2)} alt="" width={20} height={14} className="rounded-sm" />
                    <span className="text-xs font-extrabold text-[#231645] truncate">{rounds.champion.name} 🏆</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#615E6E] italic">Pick the final</p>
                )}
              </div>
            </div>
            <div className="text-center mb-1">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#7E43FF]">Semi-final</p>
              <p className="text-[10px] text-[#615E6E]">Jul 15</p>
            </div>
            {sfCard(halves.sfR, false)}
          </div>

          {/* RIGHT half (mirrored) */}
          <Column title="Quarter-finals" sub="Jul 9 - 11">{halves.qfR.map((i) => qfCard(i, true))}</Column>
          <Column title="Round of 16" sub="Jul 4 - 7">{halves.r16R.map((i) => r16Card(i, true))}</Column>
          <Column title="Round of 32" sub="Jun 28 - Jul 3">{halves.r32R.map((i) => r32Card(i, true))}</Column>
        </div>
      </div>
      <p className="text-[11px] text-[#615E6E] mt-2">Click a team to pick the winner of each tie. Later rounds update from your picks. Round of 32 matchups follow FIFA&apos;s official bracket and the best-third placement table.</p>

      {/* Share */}
      {(() => {
        const shareText = rounds.champion
          ? `My 2026 World Cup bracket: ${rounds.champion.name} for the trophy 🏆 Build yours:`
          : `Build your 2026 World Cup knockout bracket, pick every winner to the Final:`
        const enc = encodeURIComponent(shareText)
        const encUrl = encodeURIComponent(SHARE_URL)
        const nativeShare = () => {
          if (typeof navigator !== "undefined" && navigator.share) {
            navigator.share({ title: "World Cup 2026 Bracket", text: shareText, url: SHARE_URL }).catch(() => {})
          }
        }
        const copy = () => {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(`${shareText} ${SHARE_URL}`).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }).catch(() => {})
          }
        }
        return (
          <div className="mt-8 rounded-2xl border border-[#7E43FF]/20 bg-[#faf9fe] p-5 text-center">
            <p className="text-sm font-extrabold text-[#231645] mb-1">
              {rounds.champion ? <>Your champion: <span className="text-[#7E43FF]">{rounds.champion.name}</span> 🏆</> : "Make your picks, then share your bracket"}
            </p>
            <p className="text-xs text-[#615E6E] mb-4">Challenge your friends to beat your bracket.</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button onClick={nativeShare} className="btn-primary text-xs py-2 px-4 md:hidden">Share</button>
              <a href={`https://twitter.com/intent/tweet?text=${enc}&url=${encUrl}`} target="_blank" rel="noopener" className="text-xs font-bold py-2 px-4 rounded-full bg-[#231645] text-white hover:opacity-90 transition">Share on X</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${SHARE_URL}`)}`} target="_blank" rel="noopener" className="text-xs font-bold py-2 px-4 rounded-full bg-[#25D366] text-white hover:opacity-90 transition">WhatsApp</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`} target="_blank" rel="noopener" className="text-xs font-bold py-2 px-4 rounded-full bg-[#1877F2] text-white hover:opacity-90 transition">Facebook</a>
              <button onClick={copy} className="text-xs font-bold py-2 px-4 rounded-full border border-[#7E43FF]/30 text-[#231645] hover:bg-[#f1ecff] transition">{copied ? "Copied!" : "Copy link"}</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
