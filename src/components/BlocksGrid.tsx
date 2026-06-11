"use client"

import { useEffect, useRef } from "react"

type Props = { count?: number; className?: string }

export default function BlocksGrid({ count = 30, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 768) return
    const container = ref.current
    if (!container) return

    const w = container.offsetWidth
    const h = container.offsetHeight
    const SIZE = 52
    const GAP = 12
    const STEP = SIZE + GAP

    // Generate random grid positions
    const cols = Math.floor(w / STEP)
    const rows = Math.floor(h / STEP)
    const total = cols * rows

    const chosen: number[] = []
    while (chosen.length < Math.min(count, total)) {
      const idx = Math.floor(Math.random() * total)
      if (!chosen.includes(idx)) chosen.push(idx)
    }

    const cells: HTMLDivElement[] = chosen.map((idx) => {
      const col = idx % cols
      const row = Math.floor(idx / cols)
      const el = document.createElement("div")
      el.className = "block-cell"
      el.style.left = `${col * STEP + Math.random() * GAP}px`
      el.style.top = `${row * STEP + Math.random() * GAP}px`
      container.appendChild(el)
      return el
    })

    // Animate cells randomly
    const timers: ReturnType<typeof setTimeout>[] = []

    const animateCell = (el: HTMLDivElement) => {
      const delay = Math.random() * 4000
      const t1 = setTimeout(() => {
        el.style.opacity = `${Math.random() * 0.7 + 0.15}`
        const t2 = setTimeout(() => {
          el.style.opacity = "0"
          const t3 = setTimeout(() => animateCell(el), Math.random() * 3000 + 1000)
          timers.push(t3)
        }, Math.random() * 2000 + 1000)
        timers.push(t2)
      }, delay)
      timers.push(t1)
    }

    cells.forEach(animateCell)

    return () => {
      timers.forEach(clearTimeout)
      cells.forEach((el) => el.remove())
    }
  }, [count])

  return <div ref={ref} className={`blocks-grid ${className}`} />
}
