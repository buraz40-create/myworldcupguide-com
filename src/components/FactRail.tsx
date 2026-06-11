"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

// Horizontal-scroll wrapper for fact cards. Renders compact left/right scroll
// buttons in a toolbar above the rail (only when there's overflow). Buttons
// disable when the rail is at an edge.
export default function FactRail({ children }: { children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [canL, setCanL] = useState(false)
  const [canR, setCanR] = useState(false)
  const showControls = canL || canR

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const update = () => {
      setCanL(el.scrollLeft > 4)
      setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const scroll = (dir: "left" | "right") => {
    const el = railRef.current
    if (!el) return
    const dx = el.clientWidth * 0.8
    el.scrollBy({ left: dir === "left" ? -dx : dx, behavior: "smooth" })
  }

  const btn =
    "w-8 h-8 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[#231645] hover:bg-[#7E43FF] hover:text-white hover:border-[#7E43FF] transition-all duration-200 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#231645] disabled:hover:border-black/[0.08] disabled:cursor-not-allowed"

  return (
    <div>
      {/* Scroll controls . only present when the rail overflows */}
      <div className="flex justify-end gap-1.5 mb-3" style={{ visibility: showControls ? "visible" : "hidden" }}>
        <button aria-label="Scroll left" onClick={() => scroll("left")} disabled={!canL} className={btn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button aria-label="Scroll right" onClick={() => scroll("right")} disabled={!canR} className={btn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div
        ref={railRef}
        className="fact-rail flex gap-4 overflow-x-auto -mx-2 px-2 snap-x snap-mandatory scroll-smooth"
      >
        {children}
      </div>
    </div>
  )
}
