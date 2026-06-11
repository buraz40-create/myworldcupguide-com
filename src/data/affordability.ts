// Fan Affordability Index: how many months of an average net salary it takes
// a fan from each of the 48 World Cup nations to follow their team through the
// group stage (one return flight to North America, three match tickets, six
// hotel nights).
//
// All figures are clearly-labeled ESTIMATES, not quotes:
//   - monthlySalary: average net monthly salary in USD, Numbeo-class data
//     (e.g. Switzerland ~$7,587, USA ~$4,326, Egypt ~$165).
//   - returnFlight: typical return economy airfare to a US/Canada/Mexico hub.
//   - ticketPerGame: expected resale-market average per group match. Higher for
//     host nations and big global draws, lower for first-timers and minnows.
//   - hotel: a flat tournament-average nightly rate is applied to every nation
//     (see HOTEL_PER_NIGHT) so the comparison isolates salary, flights and
//     ticket demand rather than guessing each team's exact host cities.
//
// The point of the index is relative comparison between nations, not a precise
// trip quote. Methodology is shown on the page.

import { flagClass as kitFlagClass } from "./kits"

export type Confederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC"

export type AffordabilityRow = {
  /** Team name, matches teams.ts */
  team: string
  iso3: string
  group: string
  confederation: Confederation
  /** Average net monthly salary, USD */
  monthlySalary: number
  /** Typical return economy airfare to a North American hub, USD */
  returnFlight: number
  /** Expected resale-market average price per group match, USD */
  ticketPerGame: number
}

// Shared trip assumptions, applied uniformly so the index compares like with like.
export const HOTEL_PER_NIGHT = 330
export const GROUP_HOTEL_NIGHTS = 6
export const GROUP_TICKETS = 3

export const affordability: AffordabilityRow[] = [
  // GROUP A
  { team: "Mexico",                 iso3: "MEX", group: "A", confederation: "CONCACAF", monthlySalary: 720,  returnFlight: 350,  ticketPerGame: 520 },
  { team: "South Korea",            iso3: "KOR", group: "A", confederation: "AFC",      monthlySalary: 2400, returnFlight: 1300, ticketPerGame: 300 },
  { team: "South Africa",           iso3: "RSA", group: "A", confederation: "CAF",      monthlySalary: 1150, returnFlight: 1300, ticketPerGame: 280 },
  { team: "Czech Republic",         iso3: "CZE", group: "A", confederation: "UEFA",     monthlySalary: 1450, returnFlight: 875,  ticketPerGame: 300 },

  // GROUP B
  { team: "Canada",                 iso3: "CAN", group: "B", confederation: "CONCACAF", monthlySalary: 3450, returnFlight: 300,  ticketPerGame: 400 },
  { team: "Switzerland",            iso3: "SUI", group: "B", confederation: "UEFA",     monthlySalary: 7587, returnFlight: 875,  ticketPerGame: 380 },
  { team: "Qatar",                  iso3: "QAT", group: "B", confederation: "AFC",      monthlySalary: 3550, returnFlight: 1050, ticketPerGame: 310 },
  { team: "Bosnia and Herzegovina", iso3: "BIH", group: "B", confederation: "UEFA",     monthlySalary: 720,  returnFlight: 875,  ticketPerGame: 290 },

  // GROUP C
  { team: "Brazil",                 iso3: "BRA", group: "C", confederation: "CONMEBOL", monthlySalary: 600,  returnFlight: 950,  ticketPerGame: 470 },
  { team: "Morocco",                iso3: "MAR", group: "C", confederation: "CAF",      monthlySalary: 360,  returnFlight: 1000, ticketPerGame: 300 },
  { team: "Scotland",               iso3: "SCO", group: "C", confederation: "UEFA",     monthlySalary: 3050, returnFlight: 875,  ticketPerGame: 320 },
  { team: "Haiti",                  iso3: "HAI", group: "C", confederation: "CONCACAF", monthlySalary: 130,  returnFlight: 400,  ticketPerGame: 200 },

  // GROUP D
  { team: "United States",          iso3: "USA", group: "D", confederation: "CONCACAF", monthlySalary: 4326, returnFlight: 250,  ticketPerGame: 771 },
  { team: "Australia",              iso3: "AUS", group: "D", confederation: "AFC",      monthlySalary: 4050, returnFlight: 1500, ticketPerGame: 360 },
  { team: "Paraguay",               iso3: "PAR", group: "D", confederation: "CONMEBOL", monthlySalary: 510,  returnFlight: 1000, ticketPerGame: 260 },
  { team: "Turkey",                 iso3: "TUR", group: "D", confederation: "UEFA",     monthlySalary: 660,  returnFlight: 800,  ticketPerGame: 340 },

  // GROUP E
  { team: "Germany",                iso3: "GER", group: "E", confederation: "UEFA",     monthlySalary: 3439, returnFlight: 875,  ticketPerGame: 490 },
  { team: "Ecuador",                iso3: "ECU", group: "E", confederation: "CONMEBOL", monthlySalary: 480,  returnFlight: 850,  ticketPerGame: 290 },
  { team: "Ivory Coast",            iso3: "CIV", group: "E", confederation: "CAF",      monthlySalary: 230,  returnFlight: 1250, ticketPerGame: 280 },
  { team: "Curaçao",                iso3: "CUW", group: "E", confederation: "CONCACAF", monthlySalary: 1150, returnFlight: 450,  ticketPerGame: 190 },

  // GROUP F
  { team: "Netherlands",            iso3: "NED", group: "F", confederation: "UEFA",     monthlySalary: 3900, returnFlight: 875,  ticketPerGame: 392 },
  { team: "Japan",                  iso3: "JPN", group: "F", confederation: "AFC",      monthlySalary: 2350, returnFlight: 1300, ticketPerGame: 320 },
  { team: "Tunisia",                iso3: "TUN", group: "F", confederation: "CAF",      monthlySalary: 260,  returnFlight: 1050, ticketPerGame: 270 },
  { team: "Sweden",                 iso3: "SWE", group: "F", confederation: "UEFA",     monthlySalary: 3250, returnFlight: 875,  ticketPerGame: 320 },

  // GROUP G
  { team: "Belgium",                iso3: "BEL", group: "G", confederation: "UEFA",     monthlySalary: 3040, returnFlight: 875,  ticketPerGame: 280 },
  { team: "Iran",                   iso3: "IRN", group: "G", confederation: "AFC",      monthlySalary: 230,  returnFlight: 1200, ticketPerGame: 280 },
  { team: "Egypt",                  iso3: "EGY", group: "G", confederation: "CAF",      monthlySalary: 165,  returnFlight: 1100, ticketPerGame: 290 },
  { team: "New Zealand",            iso3: "NZL", group: "G", confederation: "OFC",      monthlySalary: 2960, returnFlight: 1500, ticketPerGame: 184 },

  // GROUP H
  { team: "Spain",                  iso3: "ESP", group: "H", confederation: "UEFA",     monthlySalary: 1950, returnFlight: 875,  ticketPerGame: 410 },
  { team: "Uruguay",                iso3: "URU", group: "H", confederation: "CONMEBOL", monthlySalary: 920,  returnFlight: 1000, ticketPerGame: 320 },
  { team: "Saudi Arabia",           iso3: "KSA", group: "H", confederation: "AFC",      monthlySalary: 1650, returnFlight: 1100, ticketPerGame: 290 },
  { team: "Cape Verde",             iso3: "CPV", group: "H", confederation: "CAF",      monthlySalary: 420,  returnFlight: 950,  ticketPerGame: 200 },

  // GROUP I
  { team: "France",                 iso3: "FRA", group: "I", confederation: "UEFA",     monthlySalary: 2900, returnFlight: 875,  ticketPerGame: 430 },
  { team: "Senegal",                iso3: "SEN", group: "I", confederation: "CAF",      monthlySalary: 240,  returnFlight: 1100, ticketPerGame: 290 },
  { team: "Norway",                 iso3: "NOR", group: "I", confederation: "UEFA",     monthlySalary: 4200, returnFlight: 875,  ticketPerGame: 370 },
  { team: "Iraq",                   iso3: "IRQ", group: "I", confederation: "AFC",      monthlySalary: 410,  returnFlight: 1150, ticketPerGame: 240 },

  // GROUP J
  { team: "Argentina",              iso3: "ARG", group: "J", confederation: "CONMEBOL", monthlySalary: 590,  returnFlight: 1050, ticketPerGame: 470 },
  { team: "Austria",                iso3: "AUT", group: "J", confederation: "UEFA",     monthlySalary: 2990, returnFlight: 875,  ticketPerGame: 310 },
  { team: "Algeria",                iso3: "ALG", group: "J", confederation: "CAF",      monthlySalary: 300,  returnFlight: 1050, ticketPerGame: 270 },
  { team: "Jordan",                 iso3: "JOR", group: "J", confederation: "AFC",      monthlySalary: 620,  returnFlight: 1100, ticketPerGame: 230 },

  // GROUP K
  { team: "Portugal",               iso3: "POR", group: "K", confederation: "UEFA",     monthlySalary: 1320, returnFlight: 875,  ticketPerGame: 430 },
  { team: "Colombia",               iso3: "COL", group: "K", confederation: "CONMEBOL", monthlySalary: 400,  returnFlight: 800,  ticketPerGame: 320 },
  { team: "Uzbekistan",             iso3: "UZB", group: "K", confederation: "AFC",      monthlySalary: 360,  returnFlight: 1250, ticketPerGame: 230 },
  { team: "DR Congo",               iso3: "COD", group: "K", confederation: "CAF",      monthlySalary: 110,  returnFlight: 1350, ticketPerGame: 230 },

  // GROUP L
  { team: "England",                iso3: "ENG", group: "L", confederation: "UEFA",     monthlySalary: 3200, returnFlight: 875,  ticketPerGame: 440 },
  { team: "Croatia",                iso3: "CRO", group: "L", confederation: "UEFA",     monthlySalary: 1300, returnFlight: 875,  ticketPerGame: 310 },
  { team: "Panama",                 iso3: "PAN", group: "L", confederation: "CONCACAF", monthlySalary: 800,  returnFlight: 450,  ticketPerGame: 250 },
  { team: "Ghana",                  iso3: "GHA", group: "L", confederation: "CAF",      monthlySalary: 200,  returnFlight: 1200, ticketPerGame: 280 },
]

/** Total cost of following a team through the group stage, USD. */
export function groupTripCost(r: AffordabilityRow): number {
  return r.returnFlight + GROUP_TICKETS * r.ticketPerGame + GROUP_HOTEL_NIGHTS * HOTEL_PER_NIGHT
}

/** Months of average net salary the group-stage trip costs. */
export function monthsOfSalary(r: AffordabilityRow): number {
  return groupTripCost(r) / r.monthlySalary
}

/** Rows sorted most-affordable (fewest months of salary) first. */
export function byAffordability(): AffordabilityRow[] {
  return [...affordability].sort((a, b) => monthsOfSalary(a) - monthsOfSalary(b))
}

export const confederations: Confederation[] = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"]

export function flagClass(iso3: string): string {
  return kitFlagClass(iso3)
}
