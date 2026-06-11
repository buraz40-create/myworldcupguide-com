"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

type Props = { images: string[]; alt: string }

export default function ImageSlideshow({ images, alt }: Props) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (idx === current) return
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setFading(false)
    }, 300)
  }, [current])

  const next = useCallback(() => goTo((current + 1) % images.length), [current, images.length, goTo])
  const prev = useCallback(() => goTo((current - 1 + images.length) % images.length), [current, images.length, goTo])

  useEffect(() => {
    if (images.length <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [images.length, next])

  if (!images.length) return null

  return (
    <div className="relative w-full h-72 md:h-[26rem] rounded-2xl overflow-hidden bg-[#f5f4fa] mb-8">
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <Image
          src={images[current]}
          alt={`${alt} - photo ${current + 1}`}
          fill
          className="object-cover"
          unoptimized
          priority={current === 0}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i === current ? "#fff" : "rgba(255,255,255,0.4)" }}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
