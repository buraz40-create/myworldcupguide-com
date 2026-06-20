import Link from "next/link"
import { teams } from "@/data/teams"

const HOST_NAMES = new Set(["United States", "Canada", "Mexico"])

/**
 * Replaces the 3D globe on the homepage with a clean confederation-grouped
 * grid of all 48 qualified nations. Uses flagcdn images so flags render
 * consistently across platforms (the emoji-flag fallback varies wildly).
 */

const CONFEDERATIONS: { key: string; label: string; sub: string; color: string }[] = [
  { key: "UEFA", label: "UEFA", sub: "Europe", color: "#3b82f6" },
  { key: "CONMEBOL", label: "CONMEBOL", sub: "South America", color: "#10b981" },
  { key: "CAF", label: "CAF", sub: "Africa", color: "#f59e0b" },
  { key: "AFC", label: "AFC", sub: "Asia", color: "#ef4444" },
  { key: "CONCACAF", label: "CONCACAF", sub: "North/Central America", color: "#7E43FF" },
  { key: "OFC", label: "OFC", sub: "Oceania", color: "#06b6d4" },
]

export default function QualifiedTeamsGrid() {
  const byConfed = new Map<string, typeof teams>()
  for (const c of CONFEDERATIONS) byConfed.set(c.key, [])
  for (const t of teams) {
    const list = byConfed.get(t.confederation)
    if (list) list.push(t)
  }

  return (
    <div className="space-y-7">
      {CONFEDERATIONS.map((c) => {
        const list = byConfed.get(c.key) ?? []
        if (!list.length) return null
        return (
          <section key={c.key}>
            <div className="flex items-baseline gap-3 mb-3 px-1">
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest text-white px-2.5 py-1 rounded-full"
                style={{ background: c.color }}
              >
                {c.label}
              </span>
              <span className="text-xs font-semibold text-[#615E6E]">{c.sub}</span>
              <span className="text-[10px] text-[#615E6E] ml-auto">{list.length} team{list.length === 1 ? "" : "s"}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {list.map((t) => (
                <Link
                  key={t.slug}
                  href={`/teams/${t.slug}/`}
                  title={`${t.name} - FIFA #${t.fifaRanking}${HOST_NAMES.has(t.name) ? " - Host nation" : ""}`}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-[#f8f7fd] border border-black/[0.06] hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  {/* Flag */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/w160/${t.iso2.toLowerCase()}.png`}
                    alt={`${t.name} flag`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Host badge */}
                  {HOST_NAMES.has(t.name) && (
                    <span
                      className="absolute top-1 left-1 text-[8px] font-extrabold uppercase tracking-widest text-white px-1.5 py-0.5 rounded-full"
                      style={{ background: c.color }}
                    >
                      Host
                    </span>
                  )}
                  {/* Hover label */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-extrabold text-white leading-tight truncate">{t.name}</p>
                    <p className="text-[9px] text-white/80 leading-tight">#{t.fifaRanking}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
