"use client"

import { useEffect, useRef } from "react"

// Small + marks and floating dots like Wiza's solution section
export default function HeroParticles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 768) return
    const container = containerRef.current
    if (!container) return

    const COUNT = 40
    const particles: { el: HTMLDivElement; x: number; y: number; vy: number; life: number; maxLife: number; baseOpacity: number }[] = []

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement("div")
      // Mix of plus signs, dots, and small bright dots
      const kind = i % 4
      const isPlus = kind === 0
      const isBright = kind === 1
      el.style.position = "absolute"
      el.style.pointerEvents = "none"
      el.style.userSelect = "none"
      el.style.opacity = "0"
      el.style.color = isBright ? "rgba(255,255,255,0.95)" : "rgba(176,122,255,0.85)"
      el.style.textShadow = isBright ? "0 0 8px rgba(255,255,255,0.6)" : "0 0 6px rgba(126,67,255,0.5)"
      el.style.fontWeight = isPlus ? "300" : "400"
      el.style.fontSize = isPlus ? "16px" : isBright ? "7px" : "5px"
      el.style.lineHeight = "1"
      el.textContent = isPlus ? "+" : "•"
      el.style.transition = "opacity 1s ease"
      container.appendChild(el)

      particles.push({
        el,
        x: Math.random() * 90 + 5,
        y: Math.random() * 70 + 15,
        vy: -(Math.random() * 0.05 + 0.02),
        life: Math.random() * 300,
        maxLife: Math.random() * 200 + 200,
        baseOpacity: isBright ? 1 : 0.7,
      })
    }

    let raf: number
    const animate = () => {
      particles.forEach((p) => {
        p.life++
        if (p.life > p.maxLife) {
          p.life = 0
          p.maxLife = Math.random() * 200 + 200
          p.x = Math.random() * 90 + 5
          p.y = Math.random() * 50 + 40
          p.vy = -(Math.random() * 0.03 + 0.01)
        }
        p.y += p.vy
        const progress = p.life / p.maxLife
        const opacity = progress < 0.15 ? progress / 0.15 : progress > 0.75 ? (1 - progress) / 0.25 : 1
        p.el.style.left = `${p.x}%`
        p.el.style.top = `${p.y}%`
        p.el.style.opacity = `${opacity * p.baseOpacity}`
      })
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      particles.forEach((p) => p.el.remove())
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />
}
