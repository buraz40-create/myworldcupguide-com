// Stadium match-day operational data: what fans actually need to know to walk
// into a 2026 World Cup match without trouble.
//
// Notes on accuracy:
// - Bag/security policies are standard NFL/MLS norms and FIFA's typical match-day
//   protocol; final FIFA-specific policies are confirmed on FIFA.com closer to the
//   tournament. Where we say "expected" the venue's normal-event policy is the basis.
// - Parking prices are typical NFL/MLS event-day pricing and will rise for World Cup
//   matches.
// - All 2026 World Cup tickets are mobile-only via the FIFA app (FIFA-confirmed).

export type StadiumGuide = {
  slug: string

  // Match-day essentials
  gatesOpen: string
  bagPolicyShort: string
  bagPolicy: string
  prohibitedItems: string[]
  cashOrCard: string

  // Getting in & out
  closestTransit: { mode: string; detail: string }[]
  parking: { cost: string; note: string }
  arrivalRecommendation: string
  postMatchExit: string

  // Inside the stadium
  alcoholPolicy: string
  smokingPolicy: string
  reentryAllowed: string

  // Tickets
  ticketDelivery: string

  // FAQ for FAQPage schema on the stadium page
  faqs: { question: string; answer: string }[]
}

const STANDARD_PROHIBITED = [
  "Backpacks and bags exceeding clear-bag limits",
  "Outside food and beverages (sealed water bottles often allowed)",
  "Cans, glass containers, hard-sided coolers",
  "Selfie sticks, tripods, and professional camera lenses (>4-6 inches)",
  "Drones, laser pointers, fireworks",
  "Flag poles longer than 3 feet (1 meter)",
  "Banners with commercial or political messaging",
  "Noisemakers, air horns, vuvuzelas (unless venue-specific exception)",
  "Weapons of any kind",
  "Illegal substances",
]

const FIFA_GATES = "Gates typically open 90 minutes before kickoff for FIFA World Cup matches. Confirm exact times on the FIFA app once your tickets appear."
const NFL_BAG_SHORT = "Clear bag only - max 12\"×6\"×12\". One small clutch (4.5\"×6.5\") allowed."
const NFL_BAG_FULL = "Clear plastic, vinyl, or PVC bag no larger than 12\"×6\"×12\", or a one-gallon clear plastic Ziploc-style bag. One small clutch (4.5\"×6.5\") with or without a strap is also permitted in addition to the clear bag. No backpacks, no diaper bags, no opaque bags of any kind. This is the NFL standard policy and is expected to apply for World Cup 2026."
const FIFA_TICKETS = "Mobile-only via the FIFA app. Save your ticket offline before leaving for the stadium and bring government photo ID matching your FIFA ID account."

export const stadiumGuides: StadiumGuide[] = [
  // ── METLIFE STADIUM (NY/NJ) ──────────────────────────────────────────────
  {
    slug: "metlife-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. All concessions, merchandise, and parking accept cards or mobile pay only - cash exchange kiosks available at the stadium.",
    closestTransit: [
      { mode: "NJ Transit Rail (recommended)", detail: "Direct match-day trains from New York Penn Station to the Meadowlands Rail Station - 25-30 min, $13 round trip. Trains run every 10-20 min from 3 hours pre-match." },
      { mode: "Bus 351 (NJ Transit)", detail: "From Port Authority Bus Terminal in Manhattan - 45-60 min, runs match days." },
      { mode: "Driving / Rideshare", detail: "I-95 / NJ Turnpike. Heavy traffic 90 min pre-match. Rideshare drop-off zones designated outside the stadium." },
    ],
    parking: { cost: "$40-80", note: "Pre-pay online for guaranteed parking. Lots open ~5 hours before kickoff. Tailgating allowed in designated lots only." },
    arrivalRecommendation: "Arrive 90-120 min before kickoff. Security lines for World Cup matches will be longer than NFL norms. NJ Transit gets crowded 60 min pre-match.",
    postMatchExit: "Stadium clears in 60-90 min. NJ Transit return trains run for ~2 hours after final whistle. Rideshare surcharges 2-4× normal fares.",
    alcoholPolicy: "Beer and wine served at concessions until late in the second half. ID required (21+ in USA). Hard liquor not sold to general seating.",
    smokingPolicy: "Smoking and vaping prohibited inside the stadium and in concourses. Designated outdoor smoking areas may be available - check FIFA app on match day.",
    reentryAllowed: "No - once you exit you cannot re-enter. Plan bathroom and food breaks accordingly.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "What's the bag policy at MetLife Stadium for the World Cup?", answer: "Clear bag only - max 12\"×6\"×12\", plus one small 4.5\"×6.5\" clutch. No backpacks, no opaque bags. The NFL clear-bag policy is standard at MetLife and is expected to apply for FIFA World Cup matches." },
      { question: "How early do gates open at MetLife Stadium?", answer: "Typically 90 minutes before kickoff for FIFA World Cup matches. Arrive 90-120 min early to clear security comfortably - World Cup security will be tighter than regular NFL events." },
      { question: "How do I get from Manhattan to MetLife Stadium on match day?", answer: "Take an NJ Transit train from Penn Station NY direct to Meadowlands Rail Station - 25-30 min, $13 round trip. Trains run every 10-20 min starting ~3 hours pre-match. Easiest and most reliable option." },
      { question: "Is parking available at MetLife Stadium for World Cup matches?", answer: "Yes - typical NFL pricing of $40-80 per spot. Pre-pay online for a guaranteed space. Lots open about 5 hours before kickoff. Tailgating is allowed in designated lots." },
      { question: "Can I bring food into MetLife Stadium?", answer: "No outside food. Sealed bottled water is generally allowed. The stadium has full concessions on every level. Cashless throughout - bring a card or mobile pay." },
    ],
  },

  // ── SOFI STADIUM (LA) ────────────────────────────────────────────────────
  {
    slug: "sofi-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. SoFi Stadium accepts only cards, Apple Pay, or Google Pay. Cash-to-card kiosks available on the concourse.",
    closestTransit: [
      { mode: "Metro K Line (recommended)", detail: "Light rail from downtown LA to Downtown Inglewood Station, then a 15-min walk or shuttle. About 45 min from downtown LA." },
      { mode: "Rideshare", detail: "$15-25 from LAX (15-25 min), surges 3-5× on match days. Designated rideshare zones outside the stadium." },
      { mode: "Driving", detail: "I-405 / I-110. Heavy LA traffic - leave 90 min early." },
    ],
    parking: { cost: "$70-150", note: "Pre-pay required for most lots. Premium lots near gates command $150+. Some hotels offer match-day parking + shuttle packages." },
    arrivalRecommendation: "Arrive 90-120 min before kickoff. SoFi is closer to LAX than to downtown LA - if you're flying in for a match, you can land 4 hours before kickoff and make it.",
    postMatchExit: "Allow 60-90 min to exit. Metro K Line gets very busy - consider waiting 30-45 min before transit. Rideshare surcharges 3-5× normal.",
    alcoholPolicy: "Beer, wine, and select cocktails served. ID required (21+ in California). Sales typically end after the start of the second half.",
    smokingPolicy: "Smoking and vaping prohibited inside the stadium. No designated smoking areas - if you leave to smoke, you cannot re-enter.",
    reentryAllowed: "No re-entry. Plan accordingly.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "What time should I arrive at SoFi Stadium for a World Cup match?", answer: "Arrive 90-120 min before kickoff. Gates typically open 90 min pre-match. World Cup security lines will be longer than NFL/MLS. Traffic on I-405 around the stadium is severe on match days." },
      { question: "How do I get from LAX to SoFi Stadium?", answer: "SoFi is one of the closest airport-to-stadium pairings in the World Cup. Rideshare $15-25 (15-25 min), Metro K Line (transfer at Aviation Station), or hotel shuttle. Allow extra time for match-day traffic." },
      { question: "What's the bag policy at SoFi Stadium?", answer: "Standard NFL clear-bag policy: clear plastic bag max 12\"×6\"×12\" or one-gallon Ziploc, plus optional 4.5\"×6.5\" clutch. No backpacks. Same policy as Rams/Chargers home games." },
      { question: "How much is parking at SoFi Stadium for the World Cup?", answer: "Typical event pricing $70-150 depending on lot proximity. Pre-pay online - walk-up parking may be unavailable for sold-out matches. Hotels in Inglewood and El Segundo often offer match-day parking + shuttle." },
      { question: "Is SoFi Stadium cashless?", answer: "Yes - completely cashless. Concessions, merchandise, and parking only accept cards or mobile pay. Cash-to-card kiosks on the concourse if you need to convert." },
    ],
  },

  // ── AT&T STADIUM (Dallas) ────────────────────────────────────────────────
  {
    slug: "att-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards or Apple/Google Pay only at all concessions and shops.",
    closestTransit: [
      { mode: "Rideshare (most common)", detail: "Uber/Lyft from Dallas, Fort Worth, or DFW - $25-60 depending on origin. Designated drop-off zones outside the stadium." },
      { mode: "Match-day shuttle", detail: "Many Dallas/Fort Worth hotels run dedicated match-day shuttles - check with your accommodation." },
      { mode: "Driving", detail: "I-30 from Dallas, I-30 from Fort Worth. Plan 30-45 min from either downtown plus 30 min for parking." },
    ],
    parking: { cost: "$40-100", note: "Vast lots around the stadium. Pre-pay for guaranteed spot. Lots open 4 hours before kickoff. Tailgating popular and allowed." },
    arrivalRecommendation: "Arrive 90-120 min early. Texas heat in June/July makes long outdoor lines brutal - hydrate and use sun protection while waiting.",
    postMatchExit: "Stadium clears in 60-90 min. Rideshare zones get heavily congested - walk a few blocks for faster pickup. Driving exit takes 45-60 min.",
    alcoholPolicy: "Beer, wine, and select cocktails. ID required (21+). Sales end early in the 2nd half.",
    smokingPolicy: "Smoking/vaping prohibited inside. Designated outdoor smoking areas may be available - check FIFA app.",
    reentryAllowed: "No re-entry permitted.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get to AT&T Stadium for the World Cup?", answer: "AT&T is in Arlington between Dallas and Fort Worth. Best options: rideshare $25-60 (25-45 min), pre-booked match-day shuttle from Dallas/Fort Worth hotels, or driving with paid parking. There's no rail directly to the stadium." },
      { question: "What's the bag policy at AT&T Stadium?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus 4.5\"×6.5\" clutch. No backpacks. Same policy as Cowboys home games." },
      { question: "Will it be hot inside AT&T Stadium during World Cup matches?", answer: "No - AT&T has a retractable roof and full air conditioning, kept around 72°F (22°C). Outside in summer Texas heat is brutal (95-105°F / 35-40°C) - dress for the journey, not the stadium." },
      { question: "How much is parking at AT&T Stadium?", answer: "$40-100 depending on lot proximity. Pre-pay online for guaranteed spot. Lots open 4 hours pre-match. Tailgating is allowed and popular in designated lots." },
      { question: "Can I tailgate at AT&T Stadium for the World Cup?", answer: "Yes - tailgating is allowed in designated parking lots (typically open 4 hours pre-match). Bring food, drinks (no glass), and grills. Check FIFA app for any World Cup-specific restrictions." },
    ],
  },

  // ── LEVI'S STADIUM (SF Bay) ──────────────────────────────────────────────
  {
    slug: "levis-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only.",
    closestTransit: [
      { mode: "VTA Light Rail (recommended)", detail: "Great America Station is steps from the stadium. Connect from Caltrain at Mountain View Station or via VTA buses." },
      { mode: "Caltrain + VTA", detail: "From SF, take Caltrain south to Mountain View, then VTA Light Rail to Great America - 75-90 min total, $9 each way." },
      { mode: "Rideshare", detail: "$80-130 from SF, $25-50 from San Jose. Heavy match-day traffic on US-101 and I-880." },
    ],
    parking: { cost: "$50-120", note: "Limited stadium parking - pre-pay early. Many fans park at nearby Great America theme park lots and walk." },
    arrivalRecommendation: "Arrive 90-120 min early. San Jose traffic is heavy, especially from SF on Caltrain (which gets crowded 90 min pre-match).",
    postMatchExit: "Stadium clears in 60-90 min. VTA Light Rail gets very crowded - allow 30-45 min wait. Caltrain back to SF runs for ~2 hours post-match.",
    alcoholPolicy: "Beer, wine, and cocktails. ID required (21+). Sales end before the 2nd half ends.",
    smokingPolicy: "Smoking/vaping prohibited everywhere on the property.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from San Francisco to Levi's Stadium?", answer: "Caltrain south to Mountain View, then VTA Light Rail one stop to Great America (right next to the stadium). 75-90 min total, $9 each way. Driving is faster but parking is $50-120 and traffic on US-101 is severe." },
      { question: "What's the bag policy at Levi's Stadium?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus optional 4.5\"×6.5\" clutch. Same policy as 49ers home games." },
      { question: "Where should I park for a World Cup match at Levi's?", answer: "Stadium parking is limited - pre-pay $50-120 online. Many fans park at the adjacent Great America theme park lots and walk. VTA Light Rail is the easiest car-free option." },
      { question: "How early do gates open at Levi's Stadium?", answer: "Typically 90 minutes before kickoff for FIFA matches. Arrive 90-120 min early. Levi's gets afternoon sun - bring sunscreen if attending an early kickoff." },
      { question: "Is alcohol served at Levi's Stadium?", answer: "Yes - beer, wine, and select cocktails. ID required (21+ in California). Sales typically end midway through the second half." },
    ],
  },

  // ── HARD ROCK STADIUM (Miami) ────────────────────────────────────────────
  {
    slug: "hard-rock-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only at all concessions and merchandise.",
    closestTransit: [
      { mode: "Tri-Rail + Stadium Shuttle", detail: "Tri-Rail train to Hialeah Market Station, then dedicated match-day shuttle to the stadium. About 90 min from downtown Miami." },
      { mode: "Rideshare (most common)", detail: "$40-80 from Miami Beach (40-60 min), $30-55 from MIA airport (25-50 min). Designated drop-off zones." },
      { mode: "Driving", detail: "I-95 / Florida Turnpike. Stadium parking $40-80. Pre-pay recommended." },
    ],
    parking: { cost: "$40-100", note: "Vast lots surround the stadium. Pre-pay for premium spots. Tailgating allowed in designated lots." },
    arrivalRecommendation: "Arrive 90-120 min early. Miami afternoon thunderstorms are common - have a raincoat ready and check the radar before leaving.",
    postMatchExit: "Stadium clears in 60-90 min. Rideshare prices spike 4-6× post-match. Driving exit can take 45-60 min in I-95 traffic.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (21+ in Florida). Sales end early in the 2nd half.",
    smokingPolicy: "Smoking/vaping prohibited inside. Some outdoor concourse areas may permit smoking - check signage.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from Miami Beach to Hard Rock Stadium?", answer: "Hard Rock is 30 km northwest of Miami Beach in Miami Gardens. Rideshare $40-80 (40-60 min depending on traffic), driving with parking $40-100, or Tri-Rail + shuttle (90 min, cheapest)." },
      { question: "What's the bag policy at Hard Rock Stadium?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus 4.5\"×6.5\" clutch. Same policy as Dolphins home games." },
      { question: "Will the World Cup 3rd Place match be at Hard Rock Stadium?", answer: "Yes - Hard Rock Stadium hosts the 2026 World Cup 3rd Place playoff on July 18, 2026. The Final is at MetLife the next day, July 19." },
      { question: "Will it rain during World Cup matches in Miami?", answer: "Daily afternoon thunderstorms are normal in Miami in June/July but usually pass in 30-60 min. Hard Rock Stadium has a partial roof covering most seats. Bring a raincoat or poncho." },
      { question: "How much is parking at Hard Rock Stadium for the World Cup?", answer: "$40-100 depending on lot proximity. Pre-pay online for premium lots. Tailgating is allowed in designated lots; lots open about 4 hours before kickoff." },
    ],
  },

  // ── LUMEN FIELD (Seattle) ────────────────────────────────────────────────
  {
    slug: "lumen-field",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only.",
    closestTransit: [
      { mode: "Link Light Rail (recommended)", detail: "Stadium Station is a 2-minute walk from Lumen Field. Direct from Sea-Tac Airport ($3.50, 35 min) and downtown Seattle." },
      { mode: "Walking", detail: "From most downtown Seattle hotels: 10-20 min walk through Pioneer Square. Most fan-friendly stadium location of any World Cup venue." },
      { mode: "Sounder Train", detail: "Commuter rail from Tacoma and other Sound Transit cities, runs match days." },
    ],
    parking: { cost: "$40-80", note: "Limited stadium parking. Most fans take Link Light Rail or walk from downtown. Garages around Pioneer Square charge $30-60." },
    arrivalRecommendation: "Arrive 90 min before kickoff. Walking from downtown is part of the experience. Pioneer Square has bars and food before the match.",
    postMatchExit: "Stadium clears in 30-45 min - one of the fastest exits in the World Cup. Link Light Rail gets crowded but runs frequently.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (21+ in Washington). Sales end early in the 2nd half.",
    smokingPolicy: "Smoking/vaping prohibited inside. No designated smoking areas.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from downtown Seattle to Lumen Field?", answer: "Walk - 10-20 min from most downtown hotels through Pioneer Square. Or Link Light Rail to Stadium Station (1-2 stops, $2.50). Easiest stadium location of any World Cup venue." },
      { question: "How do I get from Sea-Tac Airport to Lumen Field?", answer: "Take Link Light Rail directly from the airport to Stadium Station - $3.50, 35 minutes, no transfers. The most efficient airport-to-stadium transit of any World Cup host city." },
      { question: "What's the bag policy at Lumen Field?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus 4.5\"×6.5\" clutch. Same policy as Seahawks home games." },
      { question: "Is Lumen Field walkable from Seattle hotels?", answer: "Yes - most downtown Seattle hotels are 10-20 min on foot through Pioneer Square. Bring comfortable shoes and a layer (Seattle June evenings are cool, 55-65°F)." },
      { question: "How busy is Lumen Field after a World Cup match?", answer: "Stadium clears in 30-45 min - one of the fastest exits in the World Cup thanks to its central downtown location. Link Light Rail runs frequently; walking back to downtown is also easy." },
    ],
  },

  // ── GILLETTE STADIUM (Boston) ────────────────────────────────────────────
  {
    slug: "gillette-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only.",
    closestTransit: [
      { mode: "MBTA Commuter Rail (match-day special)", detail: "Foxboro Station service from South Station Boston runs only on match days. $10-20 round trip, 60-75 min. Limited service - check schedule." },
      { mode: "Driving / Rideshare", detail: "I-95 south. 45-75 min from Boston. Rideshare $70-110. Stadium parking $40-60." },
    ],
    parking: { cost: "$40-60", note: "Vast lots surround the stadium. Pre-pay online recommended. Tailgating popular and allowed in designated lots." },
    arrivalRecommendation: "Arrive 90-120 min early. Gillette is 45 km from Boston so plan transit carefully - MBTA match-day train fills up 90 min pre-match.",
    postMatchExit: "Stadium clears in 60-90 min. MBTA return trains run for ~2 hours after final whistle but wait time can be long.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (21+ in Massachusetts).",
    smokingPolicy: "Smoking/vaping prohibited inside.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from Boston to Gillette Stadium?", answer: "Gillette is 45 km south of Boston in Foxborough - the longest stadium-to-host-city distance among US World Cup venues. MBTA Commuter Rail runs special match-day trains from South Station ($10-20, 60-75 min). Driving is similar; parking $40-60. Rideshare $70-110." },
      { question: "What's the bag policy at Gillette Stadium?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus 4.5\"×6.5\" clutch. Same policy as Patriots and Revolution home games." },
      { question: "Is there parking at Gillette Stadium for the World Cup?", answer: "Yes - vast lots surround the stadium, $40-60 pre-pay. Tailgating is popular and allowed in designated lots. Lots open 4 hours pre-match." },
      { question: "How early do gates open at Gillette Stadium?", answer: "Typically 90 minutes before kickoff. Arrive 90-120 min early. The MBTA match-day trains from Boston fill up 90 min pre-match - don't cut it close." },
      { question: "Can I tailgate at Gillette Stadium?", answer: "Yes - tailgating is a major part of the Gillette experience. Designated lots, no glass, propane grills allowed. Lots open about 4 hours before kickoff." },
    ],
  },

  // ── LINCOLN FINANCIAL FIELD (Philadelphia) ───────────────────────────────
  {
    slug: "lincoln-financial-field",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only.",
    closestTransit: [
      { mode: "SEPTA Broad Street Line (recommended)", detail: "Direct from City Hall to NRG Station - 25-30 min, $2.50. Stadium is a 10-min walk from the station." },
      { mode: "Rideshare", detail: "$20-35 from Center City (15-25 min). Designated drop-off zones outside." },
      { mode: "Driving", detail: "I-95 to Stadium Complex. Parking $40-60." },
    ],
    parking: { cost: "$40-60", note: "Lots around the stadium complex (also serves Citizens Bank Park and Wells Fargo Center). Pre-pay online." },
    arrivalRecommendation: "Arrive 90-120 min early. SEPTA gets crushed 60 min pre-match. Tailgating in the lots is a Philly tradition.",
    postMatchExit: "Stadium clears in 45-75 min. SEPTA trains run frequently. Avoid driving exit if possible - I-95 backs up.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (21+ in Pennsylvania). Eagles fans famously enthusiastic - expect heavy drinking culture.",
    smokingPolicy: "Smoking/vaping prohibited inside.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from Center City Philadelphia to Lincoln Financial Field?", answer: "Take the SEPTA Broad Street Line south from City Hall to NRG Station - 25-30 min, $2.50. The stadium is a 10-min walk from there. Easiest and cheapest option." },
      { question: "What's the bag policy at Lincoln Financial Field?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus 4.5\"×6.5\" clutch. Same policy as Eagles home games." },
      { question: "Can I tailgate at Lincoln Financial Field?", answer: "Yes - tailgating in the South Philly Sports Complex lots is a Philadelphia tradition. Designated lots, no glass, propane grills allowed. Lots open about 4 hours before kickoff." },
      { question: "How early should I arrive at Lincoln Financial Field for the World Cup?", answer: "Arrive 90-120 min before kickoff. SEPTA Broad Street Line gets crushed 60 min pre-match. Security lines for World Cup will be longer than NFL." },
      { question: "How much is parking at Lincoln Financial Field?", answer: "$40-60 in the South Philly Sports Complex lots. Pre-pay online for guaranteed spot. The complex also serves Citizens Bank Park and the Wells Fargo Center." },
    ],
  },

  // ── ARROWHEAD STADIUM (Kansas City) ──────────────────────────────────────
  {
    slug: "arrowhead-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only.",
    closestTransit: [
      { mode: "Rideshare (most common)", detail: "Uber/Lyft from downtown KC ($20-35, 15-25 min). Designated drop-off zones." },
      { mode: "Match-day shuttle", detail: "Some KC hotels run match-day shuttles - check with your accommodation." },
      { mode: "Driving", detail: "I-70 east of downtown KC. Parking $30-50." },
    ],
    parking: { cost: "$30-50", note: "Massive lots surround Arrowhead and the adjacent Kauffman Stadium. Tailgating is THE Kansas City tradition." },
    arrivalRecommendation: "Arrive 90-120 min early. KC tailgating culture means lots fill up early - lots open 4-5 hours pre-match. Bring BBQ.",
    postMatchExit: "Stadium clears in 60-90 min. No rail option means rideshare and driving back up significantly. Wait it out at a tailgate.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (21+ in Missouri). Tailgate culture means drinking starts hours before kickoff.",
    smokingPolicy: "Smoking/vaping prohibited inside.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from downtown Kansas City to Arrowhead Stadium?", answer: "Arrowhead is 15 km east of downtown. No rail option - take rideshare ($20-35, 15-25 min), drive with $30-50 parking, or pre-booked match-day shuttle from your hotel." },
      { question: "What's the bag policy at Arrowhead Stadium?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus 4.5\"×6.5\" clutch. Same policy as Chiefs home games." },
      { question: "Is tailgating allowed at Arrowhead Stadium?", answer: "Yes - tailgating IS the Kansas City game-day experience. Massive lots, BBQ is the local tradition (try the famous burnt ends). Lots open 4-5 hours pre-match. No glass, propane grills allowed." },
      { question: "How loud is Arrowhead Stadium?", answer: "Arrowhead holds the Guinness World Record for the loudest crowd at an open-air stadium (142.2 decibels). Wear ear protection if you're sensitive to noise. Expect a wall of sound during World Cup matches." },
      { question: "Where do I park at Arrowhead Stadium?", answer: "Vast lots around Arrowhead and adjacent Kauffman Stadium. $30-50 pre-pay. Lots open 4-5 hours pre-match for tailgating. Pre-pay online for guaranteed spot." },
    ],
  },

  // ── MERCEDES-BENZ STADIUM (Atlanta) ──────────────────────────────────────
  {
    slug: "mercedes-benz-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only. Famous for fan-friendly concession pricing.",
    closestTransit: [
      { mode: "MARTA (recommended)", detail: "Red and Gold Lines to GWCC/CNN Center Station - 5-min walk to the stadium. Direct from Hartsfield-Jackson Airport ($2.50, 20 min)." },
      { mode: "Walking", detail: "From most downtown Atlanta hotels: 10-15 min on foot." },
      { mode: "Rideshare", detail: "$15-25 from most downtown hotels (5-15 min)." },
    ],
    parking: { cost: "$30-60", note: "Limited stadium parking - MARTA is the recommended option. Garages downtown $20-40." },
    arrivalRecommendation: "Arrive 90-120 min early. MARTA from the airport is one of the easiest transits in the World Cup - leave 75 min before kickoff if airport-direct.",
    postMatchExit: "Stadium clears in 45-60 min - very efficient. MARTA gets crowded but runs frequently.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (21+ in Georgia). Mercedes-Benz famous for fan-friendly drink pricing ($2-5 for water, soda).",
    smokingPolicy: "Smoking/vaping prohibited inside.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from Atlanta airport to Mercedes-Benz Stadium?", answer: "Take MARTA Red or Gold Line directly from the airport to GWCC/CNN Center station - 20 minutes, $2.50, no transfers. Stadium is a 5-minute walk. One of the easiest airport-to-stadium transits in the World Cup." },
      { question: "What's the bag policy at Mercedes-Benz Stadium?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus 4.5\"×6.5\" clutch. Same policy as Falcons and Atlanta United home games." },
      { question: "How much is food and drink at Mercedes-Benz Stadium?", answer: "Mercedes-Benz Stadium is famous for fan-friendly pricing - $2-5 for water, soda, hot dogs, even at championship events. The stadium philosophy is volume over markup. Expect prices well below other US World Cup venues." },
      { question: "Is Mercedes-Benz Stadium walkable from downtown Atlanta hotels?", answer: "Yes - most downtown hotels are 10-15 min on foot. Centennial Olympic Park is between downtown attractions and the stadium - a natural pre-match gathering spot." },
      { question: "Should I take MARTA or drive to Mercedes-Benz Stadium?", answer: "Take MARTA. Stadium parking is limited and expensive ($30-60); MARTA stops within 5-min walk. From the airport, MARTA Red/Gold Line is direct ($2.50, 20 min)." },
    ],
  },

  // ── NRG STADIUM (Houston) ────────────────────────────────────────────────
  {
    slug: "nrg-stadium",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: NFL_BAG_SHORT,
    bagPolicy: NFL_BAG_FULL,
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only.",
    closestTransit: [
      { mode: "METRORail Red Line (recommended)", detail: "Direct from downtown Houston to Stadium Park Station - 20 min, $1.25. Stadium is a 10-min walk from the station." },
      { mode: "Rideshare", detail: "$20-35 from downtown (15-25 min). Designated drop-off zones." },
      { mode: "Driving", detail: "Loop 610 / I-610. Parking $30-60." },
    ],
    parking: { cost: "$30-60", note: "Vast NRG Park lots. Pre-pay for premium spots. Tailgating allowed in designated lots." },
    arrivalRecommendation: "Arrive 90-120 min early. Houston heat in June/July is brutal (90-95°F) - hydrate and minimize outdoor wait. Stadium has retractable roof.",
    postMatchExit: "Stadium clears in 60-90 min. METRORail is most reliable. Driving exit can take 45 min in I-610 traffic.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (21+ in Texas).",
    smokingPolicy: "Smoking/vaping prohibited inside.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from downtown Houston to NRG Stadium?", answer: "Take METRORail Red Line south from downtown to Stadium Park Station - 20 min, $1.25. Stadium is a 10-min walk. Cheapest and most reliable option on match days." },
      { question: "What's the bag policy at NRG Stadium?", answer: "Standard NFL clear-bag policy: clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus 4.5\"×6.5\" clutch. Same policy as Texans home games." },
      { question: "How hot will NRG Stadium be during the World Cup?", answer: "NRG has a retractable roof and full air conditioning, kept around 72°F (22°C). Outside Houston is brutal in June/July (90-95°F / 32-35°C with high humidity). Dress for the heat outside, layers for the AC inside." },
      { question: "How much is parking at NRG Stadium?", answer: "$30-60 in the vast NRG Park lots. Pre-pay online for premium spots. Tailgating is allowed in designated lots; lots open 4 hours pre-match." },
      { question: "How early do gates open at NRG Stadium?", answer: "Typically 90 minutes before kickoff. Arrive 90-120 min early. METRORail gets crowded 60 min pre-match." },
    ],
  },

  // ── ESTADIO AZTECA (Mexico City) ─────────────────────────────────────────
  {
    slug: "estadio-azteca",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: "Small bags only - max ~30×20×10 cm. No backpacks. FIFA-specific policy TBA.",
    bagPolicy: "Small handbags and clutches typically allowed (max approximately 30×20×10 cm). No backpacks, no large bags. FIFA-specific 2026 policy will be announced closer to the tournament. Estadio Azteca historically allows smaller bags than US NFL stadiums but still subject to security check.",
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cards accepted at most concessions; some smaller vendors take cash (Mexican pesos only). Bring 500-1000 pesos for small purchases.",
    closestTransit: [
      { mode: "Tren Ligero (recommended)", detail: "Light rail from Tasqueña (Metro Line 2) to Estadio Azteca station - 15 min, MX$3 (~$0.20)." },
      { mode: "Metro + Tren Ligero combo", detail: "From central Mexico City: Metro Line 2 to Tasqueña, then Tren Ligero to Estadio Azteca. 60-90 min from Roma/Condesa with luggage. Crowded on match days." },
      { mode: "Authorized taxi or Uber", detail: "MX$200-400 (~$10-20) from Roma/Condesa. 30-50 min in match-day traffic." },
    ],
    parking: { cost: "MX$200-500 (~$10-25)", note: "Limited stadium parking. Most fans take Tren Ligero. Surrounding neighborhoods have informal parking arrangements." },
    arrivalRecommendation: "Arrive 90-120 min early. The Opening Match (June 11, Mexico vs South Africa) will be one of the most security-intensive matches of the entire tournament - allow extra time.",
    postMatchExit: "Stadium clears in 90-120 min - Azteca holds 87,000 and the surrounding transit infrastructure is overwhelmed. Wait 30-45 min before joining the Tren Ligero queue.",
    alcoholPolicy: "Beer typically served. Hard liquor varies. ID required (18+ in Mexico).",
    smokingPolicy: "Smoking prohibited inside the stadium. Designated outdoor areas may exist.",
    reentryAllowed: "No re-entry typically permitted.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get to Estadio Azteca from central Mexico City?", answer: "Take Metro Line 2 to Tasqueña, then Tren Ligero (light rail) to Estadio Azteca station - 60-90 min total, MX$8 (~$0.50). Or Uber/authorized taxi MX$200-400 (~$10-20), 30-50 min in match-day traffic." },
      { question: "What's the bag policy at Estadio Azteca?", answer: "Small handbags and clutches typically allowed (~30×20×10 cm max). No backpacks, no large bags. FIFA-specific policy for 2026 will be announced closer to the tournament. Pack light." },
      { question: "Is Estadio Azteca safe for international visitors?", answer: "Yes - the stadium itself and its immediate surroundings are well-policed on match days, especially for World Cup matches. Use Uber or authorized taxis to and from the stadium rather than street taxis. Don't display expensive items in the area." },
      { question: "Where is the World Cup Opening Match?", answer: "The 2026 FIFA World Cup Opening Match is at Estadio Azteca on June 11, 2026 - Mexico vs South Africa. Azteca is the only stadium to have hosted three World Cups (1970, 1986, 2026)." },
      { question: "How does the altitude at Estadio Azteca affect matches?", answer: "Azteca sits at 7,200 ft (2,200 m). Visiting players notice it - lung capacity drops, fatigue comes faster, the ball flies further. For spectators it's a mild effect: hydrate aggressively and avoid heavy alcohol if you're newly arrived in Mexico City." },
    ],
  },

  // ── ESTADIO AKRON (Guadalajara) ──────────────────────────────────────────
  {
    slug: "estadio-akron",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: "Small bags only - max ~30×20×10 cm. FIFA-specific policy TBA.",
    bagPolicy: "Small handbags and clutches typically allowed. No backpacks. FIFA-specific 2026 policy will be confirmed on FIFA.com closer to the tournament. Pack light to clear security quickly.",
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cards accepted at most concessions; cash (Mexican pesos) helpful for small vendors. Bring 500-800 pesos.",
    closestTransit: [
      { mode: "Uber / DiDi (most common)", detail: "MX$200-400 (~$10-20) from central Guadalajara. 30-50 min depending on traffic." },
      { mode: "Match-day shuttle", detail: "Some hotels run match-day shuttles to the stadium - check with your accommodation." },
      { mode: "Driving", detail: "Carretera Guadalajara-Tepic. Parking varies." },
    ],
    parking: { cost: "MX$150-400 (~$8-20)", note: "Stadium parking is limited. Surrounding informal arrangements common but verify safety." },
    arrivalRecommendation: "Arrive 90-120 min early. No rail to the stadium means rideshare/driving congestion is a real factor.",
    postMatchExit: "Stadium clears in 60-90 min. Rideshare prices spike 3-5× post-match. Walking 10-15 min away from the stadium can get you cheaper rides.",
    alcoholPolicy: "Beer typically served. ID required (18+ in Mexico).",
    smokingPolicy: "Smoking prohibited inside.",
    reentryAllowed: "No re-entry typically.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get to Estadio Akron from Guadalajara?", answer: "Estadio Akron is in Zapopan, north of central Guadalajara. Best option is Uber or DiDi (~MX$200-400, 30-50 min). No direct rail or bus. Some hotels run match-day shuttles - ask at check-in." },
      { question: "What's the bag policy at Estadio Akron?", answer: "Small handbags and clutches only - no backpacks. Specific FIFA 2026 policy will be confirmed closer to the tournament. Pack light to clear security faster." },
      { question: "Where is Estadio Akron?", answer: "Estadio Akron is in Zapopan, the metropolitan area just north of central Guadalajara. It's home to Chivas (Club Deportivo Guadalajara). Capacity ~46,000, opened 2010." },
      { question: "Where should I park for a World Cup match at Estadio Akron?", answer: "Stadium parking is limited (MX$150-400). Surrounding informal arrangements are common but verify the lot is reputable. Most visitors take Uber/DiDi to avoid the parking issue." },
      { question: "How early do gates open at Estadio Akron?", answer: "Typically 90 minutes before kickoff for FIFA matches. Arrive 90-120 min early. The lack of rail transit means rideshare congestion is a real concern - leave extra time." },
    ],
  },

  // ── ESTADIO BBVA (Monterrey) ─────────────────────────────────────────────
  {
    slug: "estadio-bbva",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: "Small bags only - max ~30×20×10 cm. FIFA-specific policy TBA.",
    bagPolicy: "Small handbags and clutches typically allowed. No backpacks. FIFA-specific 2026 policy confirmed on FIFA.com closer to the tournament. Pack light.",
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cards widely accepted. Bring 500-1000 Mexican pesos cash for small vendors.",
    closestTransit: [
      { mode: "Uber / DiDi (most common)", detail: "MX$300-500 (~$15-25) from central Monterrey. 35-55 min depending on traffic." },
      { mode: "Match-day shuttle", detail: "Some Monterrey hotels (especially in San Pedro Garza García) offer match-day shuttles." },
      { mode: "Driving", detail: "Estadio BBVA is in Guadalupe, southeast of Monterrey. Parking available at the stadium." },
    ],
    parking: { cost: "MX$200-500 (~$10-25)", note: "Stadium parking available but pre-purchase recommended. Lots open 3-4 hours pre-match." },
    arrivalRecommendation: "Arrive 90-120 min early. Monterrey heat in June/July (90-100°F / 32-38°C) is dry but intense - hydrate.",
    postMatchExit: "Stadium clears in 60-90 min. Rideshare prices spike post-match. Driving exit takes 30-45 min.",
    alcoholPolicy: "Beer typically served. ID required (18+ in Mexico).",
    smokingPolicy: "Smoking prohibited inside.",
    reentryAllowed: "No re-entry typically.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get to Estadio BBVA from Monterrey?", answer: "Estadio BBVA is in Guadalupe, southeast of central Monterrey. Best option is Uber or DiDi (~MX$300-500, 35-55 min). No direct rail. Some San Pedro Garza García hotels run match-day shuttles." },
      { question: "What's the bag policy at Estadio BBVA?", answer: "Small handbags and clutches only - no backpacks. Specific FIFA 2026 policy will be confirmed closer to the tournament. Pack light." },
      { question: "How hot will Estadio BBVA be during the World Cup?", answer: "Hot and dry - Monterrey in June/July hits 90-100°F (32-38°C). Estadio BBVA is open-air with limited shade. Hydrate aggressively, wear sun protection, and consider attending evening matches if you have a choice." },
      { question: "Where is Estadio BBVA?", answer: "Estadio BBVA is in Guadalupe, the metropolitan area southeast of Monterrey. It's home to CF Monterrey (Rayados). Capacity ~53,000, opened 2015 - one of the most modern stadiums in Mexico." },
      { question: "Is Estadio BBVA safe for international visitors?", answer: "Yes - the stadium and the surrounding Guadalupe area are well-policed on match days. Most international fans stay in San Pedro Garza García (considered the safest area in Mexico) and Uber to the stadium." },
    ],
  },

  // ── BMO FIELD (Toronto) ──────────────────────────────────────────────────
  {
    slug: "bmo-field",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: "Clear bag max 12\"×6\"×12\" or 1-gallon Ziploc. No backpacks.",
    bagPolicy: "Clear plastic, vinyl, or PVC bag no larger than 12\"×6\"×12\", or a one-gallon clear plastic bag. Small clutch (4.5\"×6.5\") also permitted. Toronto FC standard policy applied to FIFA matches.",
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only at all concessions and merchandise.",
    closestTransit: [
      { mode: "Walking from Union Station (recommended)", detail: "5-min walk from Union Station / harbourfront. Most downtown Toronto hotels are 15-30 min on foot." },
      { mode: "TTC Streetcar", detail: "509 Harbourfront and 511 Bathurst streetcars stop near the stadium. $3.35." },
      { mode: "GO Transit (Lakeshore West)", detail: "Exhibition Station is steps from BMO Field. Direct from Union Station and west GTA." },
    ],
    parking: { cost: "CAD$30-60", note: "Limited Exhibition Place parking. Most fans walk or take TTC. Pre-pay recommended for guaranteed spot." },
    arrivalRecommendation: "Arrive 90 min before kickoff. BMO Field is small (~30,000 capacity, expanding for World Cup) - everything fills fast on match days.",
    postMatchExit: "Stadium clears in 30-45 min - one of the fastest exits in the World Cup thanks to its small size and walking-distance downtown location.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (19+ in Ontario - higher than US drinking age).",
    smokingPolicy: "Smoking/vaping prohibited inside.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get to BMO Field from downtown Toronto?", answer: "Walk - it's a 5-min walk from Union Station / harbourfront. Or take the 509 Harbourfront streetcar ($3.35). GO Transit Lakeshore West also stops at Exhibition Station, steps from the stadium." },
      { question: "What's the bag policy at BMO Field?", answer: "Clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus optional 4.5\"×6.5\" clutch. Same policy as Toronto FC home games. No backpacks." },
      { question: "How small is BMO Field for the World Cup?", answer: "BMO Field's standard capacity is ~30,000 - the smallest of any World Cup 2026 venue. The stadium is being expanded for the tournament. Toronto hosts 6 group-stage matches; demand for tickets will far exceed supply." },
      { question: "How early do gates open at BMO Field?", answer: "Typically 90 min before kickoff. Arrive 90 min early. Toronto fans gather at downtown pubs (Football Factory, Madison Avenue) and walk to the stadium together." },
      { question: "Is BMO Field walkable from Toronto hotels?", answer: "Yes - most downtown Toronto hotels are 15-30 min on foot through the harbourfront. Bring comfortable shoes; the lakefront route is scenic." },
    ],
  },

  // ── BC PLACE (Vancouver) ─────────────────────────────────────────────────
  {
    slug: "bc-place",
    gatesOpen: FIFA_GATES,
    bagPolicyShort: "Clear bag max 12\"×6\"×12\" or 1-gallon Ziploc. No backpacks.",
    bagPolicy: "Clear plastic bag no larger than 12\"×6\"×12\", or a one-gallon clear plastic bag. Small clutch (4.5\"×6.5\") permitted. Vancouver Whitecaps standard policy.",
    prohibitedItems: STANDARD_PROHIBITED,
    cashOrCard: "Cashless. Cards and mobile pay only.",
    closestTransit: [
      { mode: "SkyTrain (recommended)", detail: "Stadium-Chinatown station is steps from BC Place. Direct from YVR Airport on the Canada Line ($9.50, 25 min) and from downtown Vancouver." },
      { mode: "Walking", detail: "From most downtown Vancouver hotels: 10-20 min on foot through Yaletown or Gastown." },
    ],
    parking: { cost: "CAD$30-60", note: "Limited stadium parking. SkyTrain is the recommended option. Downtown parkades $20-40." },
    arrivalRecommendation: "Arrive 90 min before kickoff. BC Place is in downtown Vancouver - everything walking-distance.",
    postMatchExit: "Stadium clears in 30-45 min. SkyTrain runs frequently. Walking back to downtown is easy.",
    alcoholPolicy: "Beer, wine, cocktails. ID required (19+ in British Columbia).",
    smokingPolicy: "Smoking/vaping prohibited inside.",
    reentryAllowed: "No re-entry.",
    ticketDelivery: FIFA_TICKETS,
    faqs: [
      { question: "How do I get from Vancouver airport (YVR) to BC Place?", answer: "Take the SkyTrain Canada Line directly from YVR to Stadium-Chinatown station - $9.50 CAD, 25 minutes, no transfers. BC Place is a 5-min walk. One of the most efficient airport-to-stadium routes in the World Cup." },
      { question: "What's the bag policy at BC Place?", answer: "Clear bag max 12\"×6\"×12\" or one-gallon Ziploc, plus optional 4.5\"×6.5\" clutch. Same policy as Whitecaps and BC Lions home games." },
      { question: "Is BC Place walkable from downtown Vancouver hotels?", answer: "Yes - most downtown hotels are 10-20 min on foot through Yaletown or Gastown. The walk is scenic and includes views of the harbourfront." },
      { question: "How does the BC Place retractable roof work?", answer: "BC Place has Canada's largest cable-supported retractable roof. FIFA will decide whether to open or close based on weather. June in Vancouver can be cool and damp - the roof is often closed for matches." },
      { question: "What's parking like at BC Place for the World Cup?", answer: "Limited stadium parking ($30-60). Downtown parkades nearby ($20-40). SkyTrain Canada Line is the recommended option - station is steps from the stadium." },
    ],
  },
]

export function getStadiumGuideBySlug(slug: string): StadiumGuide | undefined {
  return stadiumGuides.find((g) => g.slug === slug)
}
