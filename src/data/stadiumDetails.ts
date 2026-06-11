// Visitor-facing detail data per stadium: address, coordinates, concessions, accessibility,
// family amenities, photography rules, etc. Kept separate from stadiumGuides.ts (operational
// match-day data) to keep file sizes reasonable. Keyed by slug.

export type StadiumDetails = {
  slug: string
  address: string
  coordinates: { lat: number; lng: number }

  // Official seating chart links - we don't reproduce charts ourselves, we send
  // people to the source. FIFA URL is the same authoritative aggregator for all 16
  // venues. Venue URL is each operator's own page (only set where we've verified).
  officialSeatingUrl?: string

  // Inside the stadium
  concessions: string
  craftBeer: string
  signature: string  // signature dish/drink the venue is known for

  // Accessibility
  accessibility: {
    wheelchair: string
    sensory: string
    other: string
  }

  // Family amenities
  family: {
    nursingRoom: string
    childTickets: string
    strollerPolicy: string
  }

  // Other policies
  photography: string
  lostAndFound: string
  firstAid: string
  smokingArea: string

  // First-time visitor tips
  firstTimeTips: string[]

  // Stadium tour info
  stadiumTour: string
}

const NFL_GENERIC = {
  concessions: "Standard NFL stadium concessions: hot dogs, pretzels, pizza, burgers, nachos, popcorn, soft drinks, bottled water, beer (domestic + craft), wine, and coffee. Specialty stands rotate by event - the official stadium app lists the day's vendor map.",
  craftBeer: "Local craft beer alongside national brands. Most NFL stadiums have a dedicated craft beer hall on the main concourse with regional breweries.",
  accessibility: {
    wheelchair: "Wheelchair-accessible seating with companion seats in every section. Elevators serve all levels. Request accessible seating through FIFA.com when buying tickets.",
    sensory: "Sensory rooms typically available - quiet spaces with noise-cancelling headphones for guests with sensory processing needs. Check the stadium app on match day for location.",
    other: "ASL interpreters available for select matches on request. Audio-description headsets for visually-impaired guests at Guest Services. Service animals welcome.",
  },
  family: {
    nursingRoom: "Nursing/lactation rooms available - typically on the main concourse near Guest Services. Free use, comfortable seating, sink, and changing table.",
    childTickets: "Children under 2 typically free as 'lap infants' (must request from FIFA when buying tickets). Children 2+ need their own ticket and FIFA ID.",
    strollerPolicy: "Strollers may be brought in but must be checked at Guest Services or stowed under seats. Some stadiums prohibit strollers in the seating bowl entirely - check on arrival.",
  },
  photography: "Personal cameras welcome (no detachable lenses longer than 4-6 inches). No professional cameras or video equipment. No tripods, monopods, or selfie sticks. Phone photography is unrestricted.",
  lostAndFound: "Guest Services on the main concourse handles lost-and-found during the event. Items not claimed are held at the stadium administrative office for ~30 days post-match.",
  firstAid: "First-aid stations on every concourse level - look for the white-cross signage on the stadium map. Trained EMTs on site for the duration of the event.",
  smokingArea: "Smoking/vaping prohibited inside the stadium and in concourses. Designated outdoor smoking areas may be available outside the gates - re-entry is generally NOT allowed, so plan accordingly.",
  stadiumTour: "Public stadium tours are typically suspended during World Cup-related dates. Resume normally after the tournament.",
}

const MX_GENERIC = {
  concessions: "Mexican-style stadium fare: tacos, tortas, elotes, nachos with cheese, churros, beer, soft drinks, and bottled water. Imported food brands available alongside local options. Concession variety varies by venue and event.",
  craftBeer: "Domestic Mexican brands (Corona, Modelo, Tecate, Victoria) widely available. Craft beer presence is growing but more limited than US stadiums.",
  accessibility: {
    wheelchair: "Wheelchair-accessible seating available - request through FIFA.com when buying tickets. Stadium accessibility for World Cup matches will meet FIFA accessibility standards (often improved from regular Liga MX events).",
    sensory: "Sensory accommodations may be more limited than at North American venues. Check FIFA.com closer to the tournament for confirmed accessibility services per venue.",
    other: "Service animals typically welcome with documentation. ASL/LSM interpreters available on request through FIFA accessibility services.",
  },
  family: {
    nursingRoom: "Family/nursing facilities available - stadium-specific. Check on arrival or via Guest Services.",
    childTickets: "Children under 2 typically free as 'lap infants' (request from FIFA when buying tickets). Children 2+ need their own FIFA ID and ticket.",
    strollerPolicy: "Strollers permitted with restrictions. Check stadium-specific guidance via the FIFA app on match day.",
  },
  photography: "Personal cameras welcome (no detachable lenses larger than 4-6 inches). Phone photography unrestricted. No professional video equipment.",
  lostAndFound: "Guest Services / Atención al Aficionado handles lost-and-found during the match.",
  firstAid: "First-aid stations on each concourse - look for the red-cross signage. Trained medical staff on site throughout.",
  smokingArea: "Smoking/vaping prohibited inside the stadium. Some venues have designated outdoor smoking areas; re-entry rules vary.",
  stadiumTour: "Estadio tours pause during World Cup matches. Stadium tours typically resume post-tournament - check the venue's website.",
}

export const stadiumDetails: StadiumDetails[] = [
  // ── METLIFE STADIUM ──────────────────────────────────────────────────────
  {
    slug: "metlife-stadium",
    address: "1 MetLife Stadium Dr, East Rutherford, NJ 07073, USA",
    coordinates: { lat: 40.8136, lng: -74.0744 },
    officialSeatingUrl: "https://www.metlifestadium.com/events/fifa-world-cup-2026/",
    ...NFL_GENERIC,
    signature: "New York-style hot dogs and Frank's Red Hot Buffalo wings; Brooklyn Lager and local NJ craft beer; carving stations for premium-club tickets.",
    firstTimeTips: [
      "Enter through the gate closest to your section to skip the longest security lines - check your ticket on the FIFA app for the recommended gate.",
      "Sections on the eastern side (100s low numbers) get the most shade for afternoon kickoffs.",
      "The closest restrooms to the upper-deck concourse fill up immediately after halftime - go DURING the second-half open instead.",
      "Use NJ Transit even if you have a car - the post-match parking-lot exit takes 60-90 minutes.",
      "If you're seated in the upper deck (300s), use the elevators - the concrete stairs are steep and tiring with food/drinks.",
    ],
  },

  // ── SOFI STADIUM ─────────────────────────────────────────────────────────
  {
    slug: "sofi-stadium",
    address: "1001 Stadium Dr, Inglewood, CA 90301, USA",
    coordinates: { lat: 33.9534, lng: -118.3387 },
    ...NFL_GENERIC,
    signature: "Famed for the 'Infinity Screen' (the world's largest LED display - hangs above the field). California craft beer, In-N-Out-inspired smashburgers, Korean BBQ tacos, sushi from Sugarfish.",
    firstTimeTips: [
      "Arrive via the Metro K Line - parking adds 60-90 min to your post-match exit due to lot funneling.",
      "The Infinity Screen overhead means there are NO bad seats for video - aim for cheaper end-zone seats and watch the screen.",
      "AC inside is aggressive - bring a light layer even if it's 80°F outside.",
      "Cashless throughout - no card means no purchases. Cash-to-card kiosks on the main concourse if needed.",
      "The walk from the K Line station to the stadium is 15 min - factor it into arrival time.",
    ],
  },

  // ── AT&T STADIUM ─────────────────────────────────────────────────────────
  {
    slug: "att-stadium",
    address: "1 AT&T Way, Arlington, TX 76011, USA",
    coordinates: { lat: 32.7473, lng: -97.0945 },
    ...NFL_GENERIC,
    signature: "Texas BBQ from Lockhart Smokehouse and others; cowboy nachos with brisket; one of the largest center-hung HD video boards in sports (60-yard wide).",
    firstTimeTips: [
      "Pre-buy parking online - walk-up lots fill 90 min pre-match and surge-price.",
      "The retractable roof is usually closed (full AC, ~72°F) - perfect break from Texas heat.",
      "Tailgate in lot 11 or 14 if you're coming early - well-organized, propane grills allowed, no glass.",
      "The Cowboys Pro Shop is open during World Cup matches - good souvenir spot if you want non-soccer gear.",
      "The 'art collection' inside (yes, there's a museum-grade modern art collection) is worth a 15-min walk pre-match.",
    ],
  },

  // ── LEVI'S STADIUM ───────────────────────────────────────────────────────
  {
    slug: "levis-stadium",
    address: "4900 Marie P DeBartolo Way, Santa Clara, CA 95054, USA",
    coordinates: { lat: 37.4032, lng: -121.9695 },
    ...NFL_GENERIC,
    signature: "California-fresh: poke bowls, garlic fries (Bay Area classic), Wahoo's Fish Tacos, plus 49ers Faithful Brewing's California IPAs. Solar panels overhead = LEED Gold certified.",
    firstTimeTips: [
      "VTA Light Rail Great America Station is right next to the stadium - much easier than driving.",
      "Sun side is the WEST side - east-side seats stay shaded in afternoon kickoffs (a real difference in California sun).",
      "The 'Faithful Mile' fan-zone area outside has live music + food trucks 3 hours before kickoff.",
      "Avoid the I-880 / US-101 split right around match start - leave 90 min early if driving.",
      "The 49ers Museum on level 1 is included with your ticket - a 30-min visit if you have time pre-match.",
    ],
  },

  // ── HARD ROCK STADIUM ────────────────────────────────────────────────────
  {
    slug: "hard-rock-stadium",
    address: "347 Don Shula Dr, Miami Gardens, FL 33056, USA",
    coordinates: { lat: 25.9580, lng: -80.2389 },
    ...NFL_GENERIC,
    signature: "Cuban sandwiches, conch fritters, Latin-inspired food (the local Latin community owns it). The North Plaza canopy keeps most seats out of direct sun (hosts the 3rd Place Match July 18).",
    firstTimeTips: [
      "Bring sunscreen - canopy covers about 92% of seats but the lower bowl can still get afternoon sun.",
      "Daily afternoon thunderstorms in June/July - check radar before leaving for the stadium.",
      "Tri-Rail to Hialeah Market then dedicated shuttle is the cheapest option from Miami; rideshare $40-80.",
      "Hard Rock Cafe is on-site - good pre/post-match meal option (book ahead for big matches).",
      "Sections 100-114 (lower west) get the late-afternoon sun if it's a 3 PM kickoff.",
    ],
  },

  // ── LUMEN FIELD ──────────────────────────────────────────────────────────
  {
    slug: "lumen-field",
    address: "800 Occidental Ave S, Seattle, WA 98134, USA",
    coordinates: { lat: 47.5952, lng: -122.3316 },
    ...NFL_GENERIC,
    signature: "Pacific Northwest food: salmon burgers, fresh-made pretzels, Beecher's mac & cheese (Seattle Pike Place legend), Elysian craft beer. Famously LOUD - holds the Guinness record for crowd noise.",
    firstTimeTips: [
      "Walk from downtown Seattle - 10-20 min through Pioneer Square is part of the experience.",
      "Bring earplugs if you're sensitive - this stadium gets brutally loud, and World Cup crowds will be on Sounders supporters' level.",
      "Sections 100-115 are the closest to the Sounders supporter section - loudest atmosphere in the stadium.",
      "The partial roof keeps most seats dry but the lower bowl ends are exposed - check seat location vs. weather forecast.",
      "Post-match: skip the Link Light Rail for the first 30-45 min unless you enjoy being crushed - walk to a nearby bar instead.",
    ],
  },

  // ── GILLETTE STADIUM ─────────────────────────────────────────────────────
  {
    slug: "gillette-stadium",
    address: "1 Patriot Pl, Foxborough, MA 02035, USA",
    coordinates: { lat: 42.0909, lng: -71.2643 },
    ...NFL_GENERIC,
    signature: "Boston classics: Fenway franks, lobster rolls, clam chowder, Sam Adams beer everywhere. Home of the Patriots and Revolution.",
    firstTimeTips: [
      "Take the MBTA match-day train from South Station - parking adds 90+ min to your post-match exit.",
      "Patriot Place (the outdoor mall next to the stadium) has good food and bar options - arrive 3 hours early to avoid stadium concession lines.",
      "Sections 105-115 (sideline lower bowl) have the best sightlines for football.",
      "June nights in Foxborough are cool (50-65°F) - bring a layer for evening kickoffs.",
      "The post-match Commuter Rail train fills up fast - exit at the final whistle if you can to grab a seat.",
    ],
  },

  // ── LINCOLN FINANCIAL FIELD ──────────────────────────────────────────────
  {
    slug: "lincoln-financial-field",
    address: "1 Lincoln Financial Field Way, Philadelphia, PA 19148, USA",
    coordinates: { lat: 39.9008, lng: -75.1675 },
    ...NFL_GENERIC,
    signature: "Philly cheesesteaks (multiple vendors), soft pretzels, Yards craft beer, Federal Donuts. The Eagles' notoriously passionate fans set a high bar for atmosphere.",
    firstTimeTips: [
      "SEPTA Broad Street Line direct to NRG Station, then 10-min walk - cheapest and most reliable.",
      "Sections 101-113 (sideline lower) have the best food access and views.",
      "Pre-match tailgating in the South Philly Sports Complex lots is a tradition - propane grills, no glass.",
      "The food scene inside is genuinely top-tier - try the cheesesteak from Tony Luke's or the roast pork from John's Roast Pork.",
      "Post-match SEPTA crush is real - wait 20 min on the concourse, or walk to the next station up.",
    ],
  },

  // ── ARROWHEAD STADIUM ────────────────────────────────────────────────────
  {
    slug: "arrowhead-stadium",
    address: "1 Arrowhead Dr, Kansas City, MO 64129, USA",
    coordinates: { lat: 39.0489, lng: -94.4839 },
    ...NFL_GENERIC,
    signature: "Kansas City BBQ: burnt ends, ribs, brisket from Joe's KC, Jack Stack, and Q39 stands. Boulevard Brewing's KC IPAs. Holds the Guinness record for crowd noise (142 dB).",
    firstTimeTips: [
      "Tailgate is THE Kansas City experience - lots open 4-5 hours before kickoff. BBQ and beer with strangers is the local custom.",
      "No rail option means rideshare or driving - book Uber/Lyft return trip BEFORE you enter the stadium to avoid post-match surge.",
      "Wear ear protection if loud noises bother you - Arrowhead is the loudest open-air stadium in the world.",
      "Sections 104-118 (sideline lower) are the closest to the supporters' section.",
      "Save time for the BBQ - both inside the stadium AND at any local joint before/after the match. KC BBQ is a destination on its own.",
    ],
  },

  // ── MERCEDES-BENZ STADIUM ────────────────────────────────────────────────
  {
    slug: "mercedes-benz-stadium",
    address: "1 AMB Dr NW, Atlanta, GA 30313, USA",
    coordinates: { lat: 33.7553, lng: -84.4006 },
    ...NFL_GENERIC,
    signature: "Famous for fan-friendly pricing - $2 hot dogs, $2 sodas, $4 craft beer, even at championship events. Atlanta hot wings, peach cobbler, Sweetwater 420 beer. Iconic 'pinwheel' retractable roof.",
    firstTimeTips: [
      "Take MARTA - cheapest, fastest, and the GWCC/CNN Center station is a 5-min walk from the gates.",
      "Concessions are remarkably cheap - eat IN the stadium, not before. $2 hot dogs are not a typo.",
      "The retractable roof opens before/after but stays closed during matches - stadium is climate-controlled at ~72°F.",
      "Sections 104-118 (lower sideline) have the best views.",
      "After the match, walk to Centennial Olympic Park 5 min away for the FIFA Fan Festival party rather than rushing transit.",
    ],
  },

  // ── NRG STADIUM ──────────────────────────────────────────────────────────
  {
    slug: "nrg-stadium",
    address: "1 NRG Pkwy, Houston, TX 77054, USA",
    coordinates: { lat: 29.6847, lng: -95.4107 },
    ...NFL_GENERIC,
    signature: "Texas BBQ, Tex-Mex (best inside-stadium tacos in the World Cup), local craft beer from Saint Arnold and Karbach. Retractable roof keeps the Houston heat out.",
    firstTimeTips: [
      "Take METRORail Red Line from downtown to Stadium Park station - 20 min, $1.25, beats Houston traffic.",
      "The retractable roof closes during matches for AC - inside is around 72°F regardless of outside temperature.",
      "Tex-Mex stands beat the standard NFL fare - look for Killen's BBQ or the local taqueria stands.",
      "Sections 116-129 (lower sideline) have the best sightlines.",
      "Houston traffic post-match is brutal on Loop 610 - wait 30-45 min on the concourse or grab dinner nearby first.",
    ],
  },

  // ── ESTADIO AZTECA ───────────────────────────────────────────────────────
  {
    slug: "estadio-azteca",
    address: "Calzada de Tlalpan 3465, Santa Úrsula Coapa, Coyoacán, 04650 Ciudad de México, CDMX, Mexico",
    coordinates: { lat: 19.3027, lng: -99.1505 },
    ...MX_GENERIC,
    signature: "Authentic Mexican stadium food: tortas, tacos al pastor, elotes, michelada, mezcal. Hosts the 2026 Opening Match (Mexico vs South Africa, June 11) - the first stadium ever to host THREE World Cups (1970, 1986, 2026).",
    firstTimeTips: [
      "The Opening Match (June 11) is one of the most security-intense matches of the entire tournament - arrive 3+ hours early.",
      "Mexico City is at 7,200 ft (2,200 m) altitude - hydrate aggressively and avoid heavy alcohol on arrival days.",
      "Take Metro Line 2 to Tasqueña, then Tren Ligero to Estadio Azteca - 60-90 min from Roma/Condesa.",
      "Use Uber or DiDi rather than street taxis to/from the stadium.",
      "Pack light: bag policy is stricter than at US venues. Small handbags only, no backpacks.",
      "Sections in the 'Cabecera Sur' (south end) are closest to the field for the most atmospheric views.",
    ],
  },

  // ── ESTADIO AKRON ────────────────────────────────────────────────────────
  {
    slug: "estadio-akron",
    address: "Av. Estadio 199, Tepeyac Casino, 45070 Zapopan, Jalisco, Mexico",
    coordinates: { lat: 20.6818, lng: -103.4628 },
    ...MX_GENERIC,
    signature: "Birria de res tacos (Guadalajara is the birthplace of birria) and tortas ahogadas (the local specialty - sandwich drowned in tomato salsa). Local Tequila-region brews and mezcal.",
    firstTimeTips: [
      "Estadio Akron is in Zapopan, not central Guadalajara - plan 30-50 min Uber/DiDi from Lafayette/Providencia.",
      "Pack light: small handbags only, no backpacks.",
      "Try the local birria de res tacos OUTSIDE the stadium before/after - it's the local specialty and best at street stands.",
      "Guadalajara is at 5,100 ft (1,550 m) - mild altitude effect, hydrate.",
      "Stadium is home to Chivas - their merchandise stand is on the main concourse if you want a souvenir.",
    ],
  },

  // ── ESTADIO BBVA ─────────────────────────────────────────────────────────
  {
    slug: "estadio-bbva",
    address: "Av. Pablo Livas, El Barrial, 67250 Guadalupe, Nuevo León, Mexico",
    coordinates: { lat: 25.6692, lng: -100.2444 },
    ...MX_GENERIC,
    signature: "Cabrito (slow-roasted young goat - the regional specialty), arrachera (skirt steak), carne asada. Very modern stadium opened in 2015 - one of the most architecturally striking in Mexico.",
    firstTimeTips: [
      "Estadio BBVA is in Guadalupe, southeast of Monterrey - plan 35-55 min Uber from San Pedro.",
      "Pack light: small handbags only, no backpacks.",
      "Monterrey heat is dry but intense (90-100°F / 32-38°C) - hydrate constantly.",
      "Best food is OUTSIDE the stadium - try cabrito at El Rey del Cabrito or any nearby steakhouse.",
      "Stadium is home to Rayados (CF Monterrey) - merchandise on the main concourse.",
    ],
  },

  // ── BMO FIELD ────────────────────────────────────────────────────────────
  {
    slug: "bmo-field",
    address: "170 Princes' Blvd, Toronto, ON M6K 3C3, Canada",
    coordinates: { lat: 43.6332, lng: -79.4185 },
    concessions: "Toronto-style food: Mediterranean wraps, BeaverTails, peameal bacon sandwiches, poutine, local craft beer (Steam Whistle is brewed steps from the stadium).",
    craftBeer: "Strong local craft scene: Steam Whistle (literally adjacent to BMO Field), Mill Street, Henderson, Amsterdam. Domestic brands too.",
    accessibility: {
      wheelchair: "Wheelchair-accessible seating with companion seats. Elevators serve all levels. Request via FIFA.com.",
      sensory: "Sensory-friendly accommodations available - check the FIFA app for the 2026-specific provisions at this venue.",
      other: "Service animals welcome. ASL/CFL-French interpreters available on request. Audio-description headsets at Guest Services.",
    },
    family: {
      nursingRoom: "Nursing/family rooms on the main concourse. Free use, comfortable seating, changing tables.",
      childTickets: "Children under 2 typically free as 'lap infants' (request from FIFA when buying). Children 2+ need their own FIFA ID.",
      strollerPolicy: "Strollers permitted; check at Guest Services for in-bowl policy on match day.",
    },
    photography: "Personal cameras welcome (no detachable lenses larger than 4-6 inches). No professional video. Phone photography unrestricted.",
    lostAndFound: "Guest Services on the main concourse handles lost-and-found during the match. Items not claimed are held at the stadium office post-match.",
    firstAid: "First-aid stations on each concourse - look for the white-cross signage. Trained EMTs on site.",
    smokingArea: "Smoking and vaping prohibited inside the stadium. Designated outdoor smoking areas may be available; re-entry generally not allowed.",
    signature: "Smallest stadium of the World Cup at ~30,000 capacity (being expanded for the tournament). Right on the Toronto harbourfront. Home of Toronto FC.",
    firstTimeTips: [
      "Walk from Union Station - 5-min walk through the harbourfront, way easier than driving.",
      "BMO Field is small - every seat is good, but lower bowl gets you closest to the action.",
      "Toronto FC's TFC supporters' section sets the atmosphere; if you want loud, sit in sections 113-115.",
      "BeaverTails (Canadian fried-dough pastry) is a must-try - get one before the match.",
      "Post-match: walk to a King West or Distillery District pub instead of jamming the streetcar.",
    ],
    stadiumTour: "Public stadium tours are typically suspended during World Cup matches. Resume normally afterward.",
  },

  // ── BC PLACE ─────────────────────────────────────────────────────────────
  {
    slug: "bc-place",
    address: "777 Pacific Blvd, Vancouver, BC V6B 4Y8, Canada",
    coordinates: { lat: 49.2767, lng: -123.1119 },
    concessions: "Pacific Northwest food: salmon burgers, sushi, ramen, Japadog (Vancouver-famous), poutine, BC craft beer (Granville Island, Parallel 49).",
    craftBeer: "Strong BC craft scene: Granville Island Brewing, Parallel 49, Steamworks, Red Truck. Domestic brands too.",
    accessibility: {
      wheelchair: "Wheelchair-accessible seating with companion seats. Elevators serve all levels. Request via FIFA.com when booking.",
      sensory: "Sensory accommodations available - confirm via FIFA app for 2026 specifics.",
      other: "Service animals welcome. ASL interpreters available on request. Audio-description headsets at Guest Services.",
    },
    family: {
      nursingRoom: "Family/nursing rooms on the main concourse. Free use, changing tables, sink.",
      childTickets: "Children under 2 typically free as 'lap infants' (request from FIFA when buying). Children 2+ need their own FIFA ID.",
      strollerPolicy: "Strollers permitted; check Guest Services for in-bowl policy on match day.",
    },
    photography: "Personal cameras welcome (no detachable lenses larger than 4-6 inches). No professional video. Phone photography unrestricted.",
    lostAndFound: "Guest Services on the main concourse handles lost-and-found during the match.",
    firstAid: "First-aid stations on each concourse - look for the white-cross signage.",
    smokingArea: "Smoking and vaping prohibited inside the stadium. Designated outdoor smoking areas may be available; re-entry not allowed.",
    signature: "Largest cable-supported retractable roof in Canada. Hosts Whitecaps and BC Lions. Stunning North Shore Mountain views from upper sections.",
    firstTimeTips: [
      "SkyTrain Canada Line directly from YVR airport - 25 min, $9.50 CAD, no transfers. The most efficient airport-to-stadium transit of any World Cup venue.",
      "BC Place has a retractable roof - usually closed in cool/damp Vancouver conditions.",
      "Sections 209-215 in the upper bowl have the best North Shore Mountain backdrop views.",
      "Walk from downtown - most hotels are 10-20 min away through Yaletown or Gastown.",
      "Try Japadog (Vancouver's famous Japanese-style hot dog) at concessions or just outside the stadium.",
    ],
    stadiumTour: "Stadium tours suspended during World Cup matches. Resume after the tournament.",
  },
]

export function getStadiumDetailsBySlug(slug: string): StadiumDetails | undefined {
  return stadiumDetails.find((d) => d.slug === slug)
}
