// FIFA's official 2026 World Cup seat plan for the venue.
// Images sourced from FIFA's published seat-plan documents (one per stadium).
// Credit: FIFA. Used here for editorial / fan-guide purposes.

import Image from "next/image"
import Link from "next/link"

const FIFA_VENUE_MAPS_URL =
  "https://gpcustomersupportfwc2026.tickets.fifa.com/hc/en-gb/articles/28784010437021"

type Props = {
  stadiumName: string
  stadiumSlug: string
  officialSeatingUrl?: string
}

const TIERS = [
  { tier: "Cat 1", color: "#eab308", label: "Premium",       location: "Sideline lower bowl - best sightlines" },
  { tier: "Cat 2", color: "#94a3b8", label: "Mid-premium",   location: "Sideline upper or end-zone lower" },
  { tier: "Cat 3", color: "#c2410c", label: "Standard",      location: "Upper-bowl end zones, corners" },
  { tier: "Cat 4", color: "#3b82f6", label: "Resident-only", location: "Restricted view, upper rows - host-country residents only" },
]

export default function StadiumSeatingChart({ stadiumName, stadiumSlug, officialSeatingUrl }: Props) {
  const seatPlanUrl = `/images/seating/${stadiumSlug}.png`

  return (
    <div className="rounded-2xl overflow-hidden border border-black/[0.06] bg-white">
      {/* FIFA's official seat plan - rendered at full container width for legibility */}
      <a
        href={seatPlanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-[#fafafb] p-3 sm:p-4 group relative"
        title="Open seat plan in a new tab to zoom in"
      >
        <Image
          src={seatPlanUrl}
          alt={`Official FIFA seat plan for ${stadiumName} at the 2026 World Cup`}
          width={1604}
          height={1416}
          className="w-full h-auto"
          unoptimized
        />
        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[10px] font-bold uppercase tracking-widest text-white bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Click to enlarge
        </span>
      </a>
      <div className="px-5 py-3 border-y border-black/[0.06] bg-[#f8f7fd] flex items-center justify-between gap-3">
        <p className="text-[10px] text-[#615E6E] leading-tight">
          Official 2026 FIFA World Cup seat plan. © FIFA - shown for editorial reference. Buy tickets only at <Link href="/tickets/" className="text-[#7E43FF] font-bold hover:underline">FIFA.com</Link>.
        </p>
      </div>

      <div className="p-7">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E43FF] mb-1">
          Find your seat
        </p>
        <h3 className="text-xl font-extrabold text-[#231645] leading-tight mb-2">
          See exact sections on the FIFA chart
        </h3>
        <p className="text-[#615E6E] text-sm leading-relaxed mb-5">
          Section numbers and ticket category placement are also shown live in the FIFA ticket portal
          when you apply. The FIFA support article aggregates seat plans for every venue.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 mb-7">
          <a
            href={FIFA_VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs whitespace-nowrap"
          >
            FIFA stadium maps →
          </a>
          {officialSeatingUrl && (
            <a
              href={officialSeatingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs whitespace-nowrap"
            >
              {stadiumName} official page →
            </a>
          )}
        </div>

        <div className="border-t border-black/[0.06] pt-5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#615E6E] mb-3">
            Ticket categories - what each tier means
          </p>
          <div className="space-y-2">
            {TIERS.map((t) => (
              <div key={t.tier} className="flex items-start gap-3">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0 mt-1.5"
                  style={{ background: t.color }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-extrabold text-[#231645]">{t.tier}</span>
                    <span className="text-[#615E6E]"> · {t.label}</span>
                  </p>
                  <p className="text-xs text-[#615E6E] leading-relaxed">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
