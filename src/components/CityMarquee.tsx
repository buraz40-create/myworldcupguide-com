"use client"

import Image from "next/image"
import Link from "next/link"
import { cities } from "@/data/cities"

const FLAG: Record<string, string> = { USA: "🇺🇸", Mexico: "🇲🇽", Canada: "🇨🇦" }

export default function CityMarquee() {
  // Duplicate the list so the loop is seamless
  const items = [...cities, ...cities]

  return (
    <div className="relative overflow-hidden">
      {/* Edge fades */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #fefeff, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #fefeff, transparent)" }}
      />

      <div className="city-marquee flex gap-3 py-2">
        {items.map((c, i) => (
          <Link
            key={`${c.slug}-${i}`}
            href={`/cities/${c.slug}`}
            className="group relative shrink-0 w-[200px] aspect-[4/5] rounded-xl overflow-hidden border border-black/[0.06] bg-[#f5f4fa]"
            aria-label={`${c.name} - ${c.games} matches`}
          >
            <Image
              src={c.images[0]}
              alt={c.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="200px"
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
            {/* Top row: flag + matches */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <span className="text-base drop-shadow-md">{FLAG[c.country]}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/95 text-[#7E43FF]">
                {c.games} matches
              </span>
            </div>
            {/* Bottom: name + stadium */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
              <div className="font-bold text-sm leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {c.name}
              </div>
              <div className="text-[10px] opacity-90 truncate">{c.stadium}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
