import type { Metadata } from "next"
import BlocksGrid from "@/components/BlocksGrid"
import GlobeWrapper from "@/components/GlobeWrapper"
import { wcCountries, confederationColors } from "@/data/wc-countries"
import { alternatesFor } from "@/lib/hreflang"

const SITE = "https://myworldcupguide.com"

export const metadata: Metadata = {
  title: "World Cup 2026 Qualified Teams - All 48 Nations Interactive Globe",
  description:
    "Every team qualified for the 2026 FIFA World Cup. Interactive 3D globe with all 48 nations across UEFA, CONMEBOL, CAF, AFC, CONCACAF and OFC confederations.",
  keywords: [
    "World Cup 2026 qualified teams",
    "2026 FIFA World Cup qualified teams list",
    "World Cup teams",
    "FIFA World Cup teams",
    "World Cup 2026 nations",
    "qualified for World Cup",
    "World Cup 2026 countries",
    "World Cup 48 teams",
  ],
  alternates: alternatesFor(`${SITE}/globe`),
  openGraph: {
    title: "World Cup 2026 Qualified Teams - All 48 Nations",
    description: "Interactive globe of every nation qualified for the 2026 FIFA World Cup.",
    url: `${SITE}/globe`,
    type: "website",
  },
}

const confederations = [
  { key: "UEFA", label: "Europe", emoji: "🌍" },
  { key: "CONMEBOL", label: "South America", emoji: "🌎" },
  { key: "CAF", label: "Africa", emoji: "🌍" },
  { key: "AFC", label: "Asia", emoji: "🌏" },
  { key: "CONCACAF", label: "N/C America", emoji: "🌎" },
  { key: "OFC", label: "Oceania", emoji: "🌏" },
] as const

export default function GlobePage() {
  return (
    <div className="min-h-screen bg-white pt-8 pb-20">

      {/* Header */}
      <div className="text-center px-6 mb-6">
        <div className="pill inline-flex mb-5">Interactive Globe</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#231645] mb-3">
          48 Nations · One Tournament
        </h1>
        <p className="text-[#615E6E] text-lg max-w-xl mx-auto">
          Every country qualified for the 2026 FIFA World Cup. Spin the globe, hover a dot to see who&apos;s there.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 px-6 mb-4">
        {confederations.map((c) => (
          <div key={c.key} className="flex items-center gap-2 bg-white border border-black/[0.07] rounded-full px-3 py-1.5 text-xs font-medium text-[#231645] shadow-sm">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: confederationColors[c.key] }}
            />
            {c.label}
          </div>
        ))}
        <div className="flex items-center gap-2 bg-white border border-black/[0.07] rounded-full px-3 py-1.5 text-xs font-medium text-[#231645] shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#7E43FF] animate-pulse" />
          Host nation (pulsing)
        </div>
      </div>

      {/* Globe */}
      <div className="relative max-w-4xl mx-auto px-4">
        <div className="section-panel panel-purple overflow-hidden" style={{ borderRadius: "2rem" }}>
          <BlocksGrid count={20} className="opacity-40" />
          <GlobeWrapper />
        </div>
      </div>

      {/* Country grid by confederation */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-[#231645] mb-8 text-center">All 48 Qualified Nations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {confederations.map((conf) => {
            const countries = wcCountries.filter((c) => c.confederation === conf.key)
            return (
              <div key={conf.key} className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: confederationColors[conf.key] }}
                  />
                  <h3 className="font-bold text-[#231645] text-sm">
                    {conf.emoji} {conf.label}
                  </h3>
                  <span className="ml-auto text-xs text-[#615E6E]">{countries.length} teams</span>
                </div>
                <div className="space-y-1.5">
                  {countries.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-sm text-[#231645]">
                      <span className="text-base w-6 flex-shrink-0">{c.flag}</span>
                      <span className="font-medium">{c.name}</span>
                      {c.isHost && (
                        <span className="ml-auto text-xs text-[#7E43FF] font-semibold">Host</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
