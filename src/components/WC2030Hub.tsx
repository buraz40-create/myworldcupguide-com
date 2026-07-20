"use client"

import { useEffect, useState } from "react"
/* eslint-disable @next/next/no-img-element */
import { WC2030 } from "@/data/wc2030"

const FLAG = (c: string) => `https://flagcdn.com/w80/${c}.png`
const fmt = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

function useCountdown(target: string) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  if (now == null) return null
  const diff = new Date(target + "T12:00:00Z").getTime() - now
  const days = Math.max(0, Math.floor(diff / 86400000))
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000))
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000))
  return { days, hours, mins }
}

export default function WC2030Hub() {
  const cd = useCountdown(WC2030.estimatedOpening)
  const [format, setFormat] = useState<48 | 64>(48)

  return (
    <div>
      {/* Countdown */}
      <div className="max-w-3xl mx-auto px-6 mb-10">
        <div className="rounded-2xl bg-gradient-to-br from-[#231645] to-[#7E43FF] text-white p-6 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mb-2">Countdown to kickoff (estimated)</p>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {cd ? [["Days", cd.days], ["Hours", cd.hours], ["Mins", cd.mins]].map(([l, v]) => (
              <div key={l}>
                <p className="text-3xl md:text-5xl font-extrabold tabular-nums leading-none">{v}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">{l}</p>
              </div>
            )) : <p className="text-2xl font-extrabold">Summer 2030</p>}
          </div>
          <p className="text-xs text-white/70 mt-3">Estimated opening {fmt(WC2030.estimatedOpening)}. Exact dates to be confirmed by FIFA.</p>
        </div>
      </div>

      {/* Hosts */}
      <div className="max-w-3xl mx-auto px-6 mb-10">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-4">The hosts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-2">Main hosts</p>
            <div className="flex flex-wrap gap-2">
              {WC2030.hostsMain.map((h) => (
                <span key={h.name} className="inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 bg-[#f8f7fd] border border-black/[0.06]">
                  <img src={FLAG(h.iso2)} alt="" width={22} height={16} className="rounded-sm" /><span className="text-sm font-bold text-[#231645]">{h.name}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#f59e0b] mb-2">Centenary opening matches</p>
            <div className="flex flex-wrap gap-2">
              {WC2030.hostsCentenary.map((h) => (
                <span key={h.name} className="inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 bg-[#fffbeb] border border-[#f59e0b]/20">
                  <img src={FLAG(h.iso2)} alt="" width={22} height={16} className="rounded-sm" /><span className="text-sm font-bold text-[#231645]">{h.name}</span>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#615E6E] mt-2">Marking 100 years since the first World Cup, held in Uruguay in 1930.</p>
          </div>
        </div>
      </div>

      {/* Format: 48 vs 64 */}
      <div className="max-w-3xl mx-auto px-6 mb-10">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-1">How many teams? 48 vs 64</h2>
        <p className="text-sm text-[#615E6E] mb-4">The confirmed format is 48 teams, as in 2026. A one-off expansion to 64 for the centenary has been proposed and is under review. Toggle to compare.</p>
        <div className="flex gap-2 mb-4">
          {([48, 64] as const).map((n) => (
            <button key={n} onClick={() => setFormat(n)} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${format === n ? "bg-[#7E43FF] text-white shadow-md" : "bg-[#f8f7fd] text-[#231645] hover:bg-[#f1ecff]"}`}>
              {n} teams{n === 48 ? " (confirmed)" : " (proposed)"}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
          {format === 48 ? (
            <div>
              <p className="text-sm text-[#231645] leading-relaxed"><strong>48 teams</strong> is the confirmed baseline, the same format used at the 2026 World Cup: 12 groups of four, with a 104-match schedule running through a Round of 32. This is what qualifying is currently being planned around.</p>
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                {[["48", "Teams"], ["104", "Matches"], ["12", "Groups"]].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-[#f8f7fd] p-3"><p className="text-2xl font-extrabold text-[#231645] tabular-nums">{v}</p><p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">{l}</p></div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#231645] leading-relaxed"><strong>64 teams</strong> is a proposed one-off expansion to mark the centenary, floated by CONMEBOL in 2025. It would roughly double the field and the match count, and has drawn strong pushback from UEFA and CONCACAF over player workload and dilution. <strong>It is not confirmed</strong> and remains under FIFA review.</p>
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                {[["64", "Teams"], ["~128", "Matches"], ["16", "Groups"]].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-[#fffbeb] border border-[#f59e0b]/20 p-3"><p className="text-2xl font-extrabold text-[#231645] tabular-nums">{v}</p><p className="text-[10px] font-bold uppercase tracking-widest text-[#615E6E]">{l}</p></div>
                ))}
              </div>
              <p className="text-[11px] text-[#615E6E] mt-3">Match count is indicative; no bracket has been finalised for a 64-team format.</p>
            </div>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-extrabold text-[#231645] mb-4">Key dates and milestones</h2>
        <div className="space-y-3">
          {WC2030.milestones.map((m, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${m.status === "confirmed" ? "bg-[#10b981]" : "bg-[#f59e0b]"}`} />
                {i < WC2030.milestones.length - 1 && <div className="w-px flex-1 bg-black/[0.1] my-1" />}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-extrabold text-[#231645]">{m.label}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${m.status === "confirmed" ? "bg-[#10b981]/15 text-[#065f46]" : "bg-[#f59e0b]/15 text-[#92400e]"}`}>{m.status === "confirmed" ? "Confirmed" : "Expected"}</span>
                </div>
                <p className="text-[11px] text-[#615E6E] tabular-nums">{fmt(m.date)}</p>
                <p className="text-sm text-[#615E6E] mt-1 leading-relaxed">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#615E6E] mt-4">Dates marked &quot;expected&quot; are estimates and not yet officially confirmed by FIFA. This page is reviewed monthly and updated as real news lands.</p>
      </div>
    </div>
  )
}
