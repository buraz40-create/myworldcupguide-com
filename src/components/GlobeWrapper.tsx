"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

const Globe = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center h-[480px] md:h-[800px]">
      <div className="text-[#615E6E] text-sm animate-pulse">Loading globe…</div>
    </div>
  ),
})

export default function GlobeWrapper() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: "200px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="w-full">
      {visible ? (
        <Globe />
      ) : (
        <div className="w-full flex items-center justify-center h-[480px] md:h-[800px]">
          <div className="text-[#615E6E] text-sm">Globe loads when in view</div>
        </div>
      )}
    </div>
  )
}
