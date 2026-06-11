import {
  bookingHotelSearchUrl,
  hotelsComSearchUrl,
  bookingDestination,
  WC_KICKOFF,
  WC_FINAL,
} from "@/lib/affiliates"

type Props = {
  cityName: string
  // Override the search query if the city name doesn't map cleanly
  // (default: bookingDestination(cityName))
  destinationOverride?: string
  // Default checkIn/Out is the full tournament window (Jun 11 – Jul 19, 2026).
  checkIn?: string
  checkOut?: string
  // Optional headline override
  headline?: string
  subhead?: string
}

export default function HotelSearchCTA({
  cityName,
  destinationOverride,
  checkIn = WC_KICKOFF,
  checkOut = WC_FINAL,
  headline,
  subhead,
}: Props) {
  const destination = destinationOverride ?? bookingDestination(cityName)
  const bookingUrl = bookingHotelSearchUrl({ destination, checkIn, checkOut })
  const hotelsUrl  = hotelsComSearchUrl({ destination, checkIn, checkOut })

  return (
    <div>
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener sponsored"
        className="block rounded-2xl p-6 text-white relative overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 group"
        style={{ background: "linear-gradient(135deg, #003580 0%, #0070f3 100%)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
              Hotels for the World Cup
            </p>
            <h3 className="text-xl md:text-2xl font-extrabold leading-tight mt-1">
              {headline ?? `Compare ${cityName} hotel deals`}
            </h3>
            <p className="text-sm opacity-90 mt-2">
              {subhead ?? `Live rooms + prices for the tournament window. ${cityName} sells out fast . book before group draw.`}
            </p>
          </div>
          <div
            className="text-2xl font-extrabold flex-shrink-0 group-hover:translate-x-1 transition-transform"
            aria-hidden
          >
            →
          </div>
        </div>
        <p className="text-[10px] opacity-70 mt-4 leading-relaxed">
          Powered by Booking.com. We may earn a commission on bookings . at no extra cost to you. Helps keep this guide free.
        </p>
      </a>

      {/* Secondary "compare on" row */}
      <div className="mt-2 flex items-center justify-end gap-3 sm:gap-4 text-xs text-[#615E6E] flex-wrap">
        <span className="font-medium">Also compare on:</span>
        <a
          href={hotelsUrl}
          target="_blank"
          rel="noopener sponsored"
          className="font-bold text-[#231645] hover:text-[#7E43FF] transition-colors py-2 px-1 -my-2"
        >
          Hotels.com →
        </a>
      </div>
    </div>
  )
}
