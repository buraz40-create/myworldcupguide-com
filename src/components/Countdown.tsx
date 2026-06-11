"use client"

import { useEffect, useState } from "react"

const KICKOFF_MS = new Date("2026-06-11T16:00:00-05:00").getTime()

type Parts = { d: number; h: number; m: number; s: number }

function diff(now: number): Parts {
  let ms = Math.max(0, KICKOFF_MS - now)
  const d = Math.floor(ms / 86_400_000); ms -= d * 86_400_000
  const h = Math.floor(ms / 3_600_000);  ms -= h * 3_600_000
  const m = Math.floor(ms / 60_000);     ms -= m * 60_000
  const s = Math.floor(ms / 1_000)
  return { d, h, m, s }
}

const pad = (n: number) => n.toString().padStart(2, "0")

function Cell({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span
        className="font-mono text-3xl md:text-5xl font-extrabold text-white tabular-nums"
        style={{ textShadow: "0 0 24px rgba(176,122,255,0.6), 0 2px 12px rgba(0,0,0,0.4)" }}
      >
        {n}
      </span>
      <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a9ff] mt-2">
        {label}
      </span>
    </div>
  )
}

export default function Countdown() {
  const [mounted, setMounted] = useState(false)
  const [t, setT] = useState<Parts>({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    setMounted(true)
    setT(diff(Date.now()))
    const id = setInterval(() => setT(diff(Date.now())), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="inline-flex items-center gap-3 md:gap-5 px-5 md:px-8 py-3 md:py-4 rounded-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(126,67,255,0.18) 0%, rgba(35,22,69,0.35) 100%)",
        border: "1px solid rgba(176,122,255,0.4)",
        boxShadow: "0 0 40px rgba(126,67,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
        backdropFilter: "blur(8px)",
      }}
      aria-label={
        mounted
          ? `Countdown to opening match: ${t.d} days, ${t.h} hours, ${t.m} minutes, ${t.s} seconds`
          : "Countdown to opening match"
      }
    >
      <Cell n={mounted ? t.d.toString() : "-"} label="Days" />
      <span className="text-[#c9a9ff] font-mono text-2xl md:text-4xl font-bold pb-4 md:pb-5 animate-pulse">:</span>
      <Cell n={mounted ? pad(t.h) : "-"} label="Hours" />
      <span className="text-[#c9a9ff] font-mono text-2xl md:text-4xl font-bold pb-4 md:pb-5 animate-pulse">:</span>
      <Cell n={mounted ? pad(t.m) : "-"} label="Min" />
      <span className="text-[#c9a9ff] font-mono text-2xl md:text-4xl font-bold pb-4 md:pb-5 animate-pulse">:</span>
      <Cell n={mounted ? pad(t.s) : "-"} label="Sec" />
    </div>
  )
}
