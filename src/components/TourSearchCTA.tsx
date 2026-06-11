import { klookSearchUrl, bookingDestination } from "@/lib/affiliates"

type Props = {
  cityName: string
  // Override the search query if the city name doesn't map cleanly
  keywordOverride?: string
  headline?: string
  subhead?: string
}

export default function TourSearchCTA({
  cityName,
  keywordOverride,
  headline,
  subhead,
}: Props) {
  const keyword = keywordOverride ?? bookingDestination(cityName)
  const url = klookSearchUrl({ keyword })

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener sponsored"
      className="block rounded-2xl p-6 text-white relative overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 group"
      style={{ background: "linear-gradient(135deg, #ff5722 0%, #ff8a65 100%)" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
            Things to do during the World Cup
          </p>
          <h3 className="text-xl md:text-2xl font-extrabold leading-tight mt-1">
            {headline ?? `Day tours, attractions & experiences in ${cityName}`}
          </h3>
          <p className="text-sm opacity-90 mt-2">
            {subhead ?? `Off-day adventures around ${cityName} . stadium tours, food walks, harbor cruises, museums. Book before you fly.`}
          </p>
        </div>
        <div
          className="text-2xl font-extrabold flex-shrink-0 group-hover:translate-x-1 transition-transform"
          aria-hidden
        >
          →
        </div>
      </div>
      <p className="text-[10px] opacity-80 mt-4 leading-relaxed">
        Powered by Klook. We may earn a commission on bookings . at no extra cost to you.
      </p>
    </a>
  )
}
