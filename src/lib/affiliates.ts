// Central affiliate config. Plug your partner IDs in here OR set them via
// build-time env vars (NEXT_PUBLIC_BOOKING_AID, NEXT_PUBLIC_SKYSCANNER_AID).
// Without IDs, the links still work . they just don't earn commission.

// Travelpayouts URL marker . used in &aid=/&marker= parameters for click
// attribution on affiliate links. The Drive script in <head> uses a separate
// site-level ID (523955) and handles first-party session tracking.
const TP_MARKER      = "723643"

const BOOKING_AID    = process.env.NEXT_PUBLIC_BOOKING_AID    || TP_MARKER
const SKYSCANNER_AID = process.env.NEXT_PUBLIC_SKYSCANNER_AID || TP_MARKER

export const HAS_BOOKING_AID    = BOOKING_AID    !== ""
export const HAS_SKYSCANNER_AID = SKYSCANNER_AID !== ""

// Strip noisy bits from a host-city name so Booking's full-text search lands
// on something it knows: "New York / New Jersey" → "New York".
export function bookingDestination(cityName: string): string {
  return cityName
    .split(/[\/,]/)[0]      // before any slash or comma
    .replace(/\s+Bay Area$/, "")
    .trim()
}

// Booking.com hotel search URL, prefilled for the World Cup window by default.
export function bookingHotelSearchUrl(opts: {
  destination: string
  checkIn?: string         // YYYY-MM-DD
  checkOut?: string        // YYYY-MM-DD
  adults?: number
}): string {
  const params = new URLSearchParams({
    ss: opts.destination,
    group_adults: String(opts.adults ?? 2),
    no_rooms: "1",
    group_children: "0",
    sb_travel_purpose: "leisure",
  })
  if (opts.checkIn)  params.set("checkin",  opts.checkIn)
  if (opts.checkOut) params.set("checkout", opts.checkOut)
  if (BOOKING_AID)   params.set("aid", BOOKING_AID)
  return `https://www.booking.com/searchresults.html?${params.toString()}`
}

// Hotels.com search . secondary hotel option with a 7-day cookie window
// (much better than Booking's single-session, useful for researchers who
// don't book the same day).
export function hotelsComSearchUrl(opts: {
  destination: string
  checkIn?: string
  checkOut?: string
  adults?: number
}): string {
  const params = new URLSearchParams({
    "q-destination": opts.destination,
    "q-rooms": "1",
    "q-room-0-adults": String(opts.adults ?? 2),
  })
  if (opts.checkIn)  params.set("q-check-in",  opts.checkIn)
  if (opts.checkOut) params.set("q-check-out", opts.checkOut)
  if (TP_MARKER)     params.set("marker", TP_MARKER)
  return `https://www.hotels.com/search.do?${params.toString()}`
}

// Klook tours/activities search by keyword (city or attraction name).
// Drive script in <head> handles click attribution; the marker param is a
// belt-and-suspenders backup.
export function klookSearchUrl(opts: { keyword: string }): string {
  const params = new URLSearchParams({ keyword: opts.keyword })
  if (TP_MARKER) params.set("aid", TP_MARKER)
  return `https://www.klook.com/en-US/search/?${params.toString()}`
}

// Skyscanner flight search. Origin defaults to "anywhere" so we don't lock
// users into a single airport.
export function skyscannerFlightUrl(opts: {
  origin?: string                    // IATA code (LHR, JFK, ...) or "anywhere"
  destination: string                // IATA code
  outboundDate?: string              // YYYY-MM-DD
  inboundDate?: string               // YYYY-MM-DD
}): string {
  const from = opts.origin || "anywhere"
  const out  = opts.outboundDate ? opts.outboundDate.replace(/-/g, "").slice(2) : ""
  const back = opts.inboundDate  ? opts.inboundDate.replace(/-/g, "").slice(2)  : ""
  const params = new URLSearchParams()
  if (SKYSCANNER_AID) params.set("associateid", SKYSCANNER_AID)
  // Skyscanner URL format: /transport/flights/{from}/{to}/{out_yymmdd}/{back_yymmdd}/
  const path = ["transport", "flights", from, opts.destination, out, back].filter(Boolean).join("/")
  return `https://www.skyscanner.com/${path}/?${params.toString()}`
}

// World Cup tournament dates . sensible defaults for every city CTA.
export const WC_KICKOFF = "2026-06-11"
export const WC_FINAL   = "2026-07-19"
