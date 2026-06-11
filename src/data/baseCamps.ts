// FIFA-required Team Base Camps (2026 World Cup). Each team picks a single base
// camp from FIFA's brochure and stays there for the entire group stage,
// traveling to match venues 1 day before each game (per regs §18.3).
//
// All 48 teams confirmed by FIFA on 2026-05-25.
// 39 teams in the USA, 7 in Mexico, 2 in Canada (Canada itself + Panama).
//
// Hero images are pre-fetched from Wikipedia by scripts/fetch-basecamp-images.mjs
// and stored at /images/basecamp-<slug>.jpg.

export type BaseCamp = {
  city: string
  region: string                          // US state, Mexican state, or Canadian province
  country: "USA" | "Canada" | "Mexico"
  coordinates: { lat: number; lng: number }
  facility?: string                       // training ground / stadium / university campus
  blurb: string                           // 1-2 sentences explaining the choice / location
  image: string                           // local path served at /images/basecamp-<slug>.jpg
}

// Keyed by team name as it appears in src/data/teams.ts (must match exactly).
export const baseCamps: Record<string, BaseCamp> = {
  // GROUP A
  "Mexico": {
    city: "Mexico City", region: "Distrito Federal", country: "Mexico",
    coordinates: { lat: 19.4326, lng: -99.1332 },
    facility: "Centro de Alto Rendimiento (CAR)",
    blurb: "El Tri stay at home, training at FMF's national centre in the capital. Same altitude as Estadio Azteca where they open the tournament against South Korea on June 11.",
    image: "/images/basecamp-mexico.jpg",
  },
  "South Korea": {
    city: "Zapopan", region: "Jalisco", country: "Mexico",
    coordinates: { lat: 20.6597, lng: -103.3496 },
    facility: "Chivas Verde Valle",
    blurb: "Taeguk Warriors train at the Chivas reserve facility in Verde Valle. The 1,560m altitude matches their Group A opener venue (Estadio Akron, Guadalajara), saving them an adjustment period before kickoff.",
    image: "/images/basecamp-south-korea.jpg",
  },
  "South Africa": {
    city: "San Agustín Tlaxiaca", region: "Hidalgo", country: "Mexico",
    coordinates: { lat: 20.1011, lng: -98.7591 },
    facility: "CF Pachuca - Universidad Del Futbol",
    blurb: "Bafana Bafana base at Liga MX side Pachuca's club university, a top-tier training campus in the Hidalgo highlands. High altitude prep and Spanish-speaking environment.",
    image: "/images/basecamp-south-africa.jpg",
  },
  "Czech Republic": {
    city: "Mansfield", region: "Texas", country: "USA",
    coordinates: { lat: 32.5632, lng: -97.1417 },
    facility: "Mansfield Multipurpose Stadium",
    blurb: "Národní Tým base in the DFW area at the Mansfield Multipurpose Stadium, a 25-minute drive from AT&T Stadium in Arlington where they play one of their Group A fixtures.",
    image: "/images/basecamp-czech-republic.jpg",
  },

  // GROUP B
  "Canada": {
    city: "Vancouver", region: "British Columbia", country: "Canada",
    coordinates: { lat: 49.2767, lng: -123.1119 },
    facility: "National Soccer Development Centre",
    blurb: "Canada Soccer's purpose-built national training centre in Vancouver doubles as the men's base camp. BC Place, where they play home Group B matches, is across the city.",
    image: "/images/basecamp-canada.jpg",
  },
  "Switzerland": {
    city: "San Diego", region: "California", country: "USA",
    coordinates: { lat: 32.7157, lng: -117.1611 },
    facility: "SDJA (San Diego Jewish Academy)",
    blurb: "Die Nati settle in San Diego at SDJA's athletic complex. Mediterranean coastal climate matches the conditions Switzerland trained in for Qatar 2022, and they get short flights to all their West Coast match venues.",
    image: "/images/basecamp-switzerland.jpg",
  },
  "Qatar": {
    city: "Santa Barbara", region: "California", country: "USA",
    coordinates: { lat: 34.4358, lng: -119.8276 },
    facility: "Westmont College",
    blurb: "Al-Annabi train at Westmont College in Santa Barbara. Coastal Mediterranean climate is dramatically cooler than Doha, which helps the squad arrive sharp for West Coast matchdays.",
    image: "/images/basecamp-qatar.jpg",
  },
  "Bosnia and Herzegovina": {
    city: "Sandy", region: "Utah", country: "USA",
    coordinates: { lat: 40.5649, lng: -111.8389 },
    facility: "Real Salt Lake Stadium",
    blurb: "Zmajevi base at Real Salt Lake's MLS facility in suburban Sandy. Utah's mountain altitude (1,300m) gives Bosnia an aerobic base before group games at sea-level venues.",
    image: "/images/basecamp-bosnia-and-herzegovina.jpg",
  },

  // GROUP C
  "Brazil": {
    city: "Morristown", region: "New Jersey", country: "USA",
    coordinates: { lat: 40.6687, lng: -74.1143 },
    facility: "Columbia Park Training Facility",
    blurb: "A Seleção base at a private training complex in northern New Jersey, a short drive from MetLife Stadium where they play one of their Group C matches. The CBF historically prefers tightly-controlled media access, and this setup delivers.",
    image: "/images/basecamp-brazil.jpg",
  },
  "Morocco": {
    city: "Basking Ridge", region: "New Jersey", country: "USA",
    coordinates: { lat: 40.6779, lng: -74.5532 },
    facility: "The Pingry School",
    blurb: "Atlas Lions camp at The Pingry School, a private K-12 campus with first-rate athletic facilities. Central New Jersey location gives them quick access to MetLife and Lincoln Financial Field for Group C fixtures.",
    image: "/images/basecamp-morocco.jpg",
  },
  "Scotland": {
    city: "Charlotte", region: "North Carolina", country: "USA",
    coordinates: { lat: 35.2271, lng: -80.8431 },
    facility: "Charlotte FC training complex",
    blurb: "The Tartan Army camps at Charlotte FC's MLS facility, a central East Coast location that puts them within 1 to 2 hour flights of all three Group C match venues (Miami, Philly, NY/NJ).",
    image: "/images/basecamp-scotland.jpg",
  },
  "Haiti": {
    city: "Galloway", region: "New Jersey", country: "USA",
    coordinates: { lat: 39.4729, lng: -74.4793 },
    facility: "Stockton University",
    blurb: "Haiti make their first World Cup appearance in 50 years and base at Stockton University in southern New Jersey. Quiet campus, NCAA-grade fields, and a short drive to Philly and NY/NJ for Group C matches.",
    image: "/images/basecamp-haiti.jpg",
  },

  // GROUP D
  "United States": {
    city: "Irvine", region: "California", country: "USA",
    coordinates: { lat: 33.6846, lng: -117.8265 },
    facility: "Great Park Sports Complex",
    blurb: "USMNT camp at Orange County's Great Park sports complex, a multi-pitch facility 50 miles south of SoFi/LA. Familiar West Coast base used previously for camps and friendlies.",
    image: "/images/basecamp-united-states.jpg",
  },
  "Australia": {
    city: "Alameda", region: "California", country: "USA",
    coordinates: { lat: 37.8044, lng: -122.2712 },
    facility: "Oakland Roots/Soul Training Facility",
    blurb: "The Socceroos camp in the East Bay at Oakland Roots' USL training facility. Short hop to Levi's Stadium in Santa Clara for their Bay Area Group D matches, plus a familiar West Coast time zone.",
    image: "/images/basecamp-australia.jpg",
  },
  "Paraguay": {
    city: "San Jose", region: "California", country: "USA",
    coordinates: { lat: 37.3382, lng: -121.8863 },
    facility: "Spartan Soccer Complex",
    blurb: "La Albirroja train at the Spartan Soccer Complex on the San Jose State campus. Same Bay Area as Australia, putting two Group D rivals in nearly the same training cluster.",
    image: "/images/basecamp-paraguay.jpg",
  },
  "Turkey": {
    city: "Mesa", region: "Arizona", country: "USA",
    coordinates: { lat: 33.4152, lng: -111.8315 },
    facility: "Arizona Athletic Grounds",
    blurb: "Ay-Yıldızlılar base at the Arizona Athletic Grounds in Mesa, a multi-pitch complex outside Phoenix. Dry desert heat is a closer match to summer Turkey than humid East Coast camps, useful prep for Texas and Florida match venues.",
    image: "/images/basecamp-turkey.jpg",
  },

  // GROUP E
  "Germany": {
    city: "Winston-Salem", region: "North Carolina", country: "USA",
    coordinates: { lat: 36.0999, lng: -80.2442 },
    facility: "Wake Forest University",
    blurb: "Die Mannschaft base at Wake Forest, with full ACC athletic facilities, NCAA-grade soccer pitches, and hotel-style on-campus accommodations the federation booked exclusively. Piedmont weather mirrors central European summers.",
    image: "/images/basecamp-germany.jpg",
  },
  "Ecuador": {
    city: "Columbus", region: "Ohio", country: "USA",
    coordinates: { lat: 39.9612, lng: -82.9988 },
    facility: "Columbus Crew Performance Centre",
    blurb: "La Tri train at Columbus Crew's OhioHealth Performance Centre, a high-end MLS facility with multiple grass pitches, gym, and recovery suites. Central Ohio location splits the distance to Group E venues evenly.",
    image: "/images/basecamp-ecuador.jpg",
  },
  "Ivory Coast": {
    city: "Chester", region: "Pennsylvania", country: "USA",
    coordinates: { lat: 39.8497, lng: -75.3557 },
    facility: "Philadelphia Union Stadium",
    blurb: "Les Éléphants base at Philadelphia Union's MLS complex on the Delaware riverfront. Subaru Park's training grounds give them a 25-minute drive to Lincoln Financial Field for two of their Group E group-stage matches.",
    image: "/images/basecamp-ivory-coast.jpg",
  },
  "Curaçao": {
    city: "Boca Raton", region: "Florida", country: "USA",
    coordinates: { lat: 26.3683, lng: -80.1289 },
    facility: "Florida Atlantic University",
    blurb: "FAU's NCAA Division I soccer complex gives Curaçao a Caribbean-climate match (heat, humidity) and a short flight to Miami for their Group C opener at Hard Rock Stadium.",
    image: "/images/basecamp-cura-ao.jpg",
  },

  // GROUP F
  "Netherlands": {
    city: "Riverside", region: "Missouri", country: "USA",
    coordinates: { lat: 39.1141, lng: -94.6275 },
    facility: "KC Current Training Facility",
    blurb: "Oranje train at the KC Current's purpose-built NWSL facility on the Kansas side of the metro. They share Kansas City with Argentina and England, an unusual three-nation cluster.",
    image: "/images/basecamp-netherlands.jpg",
  },
  "Japan": {
    city: "Nashville", region: "Tennessee", country: "USA",
    coordinates: { lat: 36.1627, lng: -86.7816 },
    facility: "Nashville SC training facility",
    blurb: "Samurai Blue base in Nashville at the SC's MLS training complex (purpose-built 2022). Nashville's central location gives short hops to LA and Seattle for two of their three Group F venues without sustained West Coast time-zone fatigue.",
    image: "/images/basecamp-japan.jpg",
  },
  "Tunisia": {
    city: "Santiago", region: "Nuevo León", country: "Mexico",
    coordinates: { lat: 25.6866, lng: -100.3161 },
    facility: "Rayados Training Center",
    blurb: "Eagles of Carthage train at Liga MX side Rayados' training centre. Northern Mexico's dry heat is a closer match to Tunisia's summer climate than US East Coast humidity.",
    image: "/images/basecamp-tunisia.jpg",
  },
  "Sweden": {
    city: "Frisco", region: "Texas", country: "USA",
    coordinates: { lat: 33.1507, lng: -96.8236 },
    facility: "FC Dallas Stadium",
    blurb: "Blågult base at FC Dallas's MLS facility in Frisco, a 30-minute drive from AT&T Stadium in Arlington for their Group F fixture there. Dallas heat is a brutal adjustment for a Nordic team but the federation prioritised stadium proximity.",
    image: "/images/basecamp-sweden.jpg",
  },

  // GROUP G
  "Belgium": {
    city: "Renton", region: "Washington", country: "USA",
    coordinates: { lat: 47.4836, lng: -122.2126 },
    facility: "Seattle Sounders FC Performance Centre and Clubhouse",
    blurb: "Rode Duivels camp at Seattle Sounders' purpose-built MLS facility outside Seattle. Cool Pacific Northwest climate is the closest US match to Belgian summer conditions.",
    image: "/images/basecamp-belgium.jpg",
  },
  "Iran": {
    city: "Tijuana", region: "Baja California", country: "Mexico",
    coordinates: { lat: 32.5149, lng: -117.0382 },
    facility: "Centro Xoloitzcuintle",
    blurb: "Team Melli train at Club Tijuana's Xolos training centre. The border-city location gives them quick US access for matches while keeping them in Mexico for visa and political simplicity.",
    image: "/images/basecamp-iran.jpg",
  },
  "Egypt": {
    city: "Spokane", region: "Washington", country: "USA",
    coordinates: { lat: 47.6588, lng: -117.4260 },
    facility: "Gonzaga University",
    blurb: "Pharaohs camp at Gonzaga's athletic campus in eastern Washington. Inland Pacific Northwest climate is dramatically cooler than Cairo, which the federation views as an asset for sustained training intensity.",
    image: "/images/basecamp-egypt.jpg",
  },
  "New Zealand": {
    city: "San Diego", region: "California", country: "USA",
    coordinates: { lat: 32.7711, lng: -117.1908 },
    facility: "University of San Diego, Torero Stadium",
    blurb: "All Whites train at the University of San Diego's Torero Stadium. New Zealand's first WC since 2010 and a long flight from home, so a Pacific-coast base halves the jet-lag burden.",
    image: "/images/basecamp-new-zealand.jpg",
  },

  // GROUP H
  "Spain": {
    city: "Chattanooga", region: "Tennessee", country: "USA",
    coordinates: { lat: 35.0456, lng: -85.3097 },
    facility: "Baylor School",
    blurb: "La Roja train at the Baylor School, a private boarding school with NCAA-quality athletic facilities. Chattanooga's mid-sized airport gives direct hops to Atlanta and connections to Mexico City and Monterrey, all Group H venues.",
    image: "/images/basecamp-spain.jpg",
  },
  "Uruguay": {
    city: "Playa del Carmen", region: "Quintana Roo", country: "Mexico",
    coordinates: { lat: 21.1619, lng: -86.8515 },
    facility: "Mayakoba Training Center Cancun",
    blurb: "La Celeste base on the Caribbean coast at the Mayakoba complex. The AUF prefers seclusion plus climate-acclimatisation for hot-weather Group H venues in Mexico City and Monterrey, with a short flight inland for each match.",
    image: "/images/basecamp-uruguay.jpg",
  },
  "Saudi Arabia": {
    city: "Austin", region: "Texas", country: "USA",
    coordinates: { lat: 30.2672, lng: -97.7431 },
    facility: "Austin FC Stadium (Q2 Stadium)",
    blurb: "Falcons base at Austin FC's MLS facility. The federation signed a partnership with the club for exclusive use of Q2 Stadium's pitch and recovery rooms during the tournament.",
    image: "/images/basecamp-saudi-arabia.jpg",
  },
  "Cape Verde": {
    city: "Tampa", region: "Florida", country: "USA",
    coordinates: { lat: 27.9506, lng: -82.4572 },
    facility: "Waters Sportsplex",
    blurb: "Tubarões Azuis make their World Cup debut and base at the Waters Sportsplex in Tampa. Gulf Coast climate is the closest US match to Cape Verde's Atlantic-island summer.",
    image: "/images/basecamp-cape-verde.jpg",
  },

  // GROUP I
  "France": {
    city: "Waltham", region: "Massachusetts", country: "USA",
    coordinates: { lat: 42.3895, lng: -71.2208 },
    facility: "Bentley University",
    blurb: "Les Bleus base at Bentley University in Waltham, just outside Boston. NCAA Division II campus with private fields and dorm-style accommodation the federation booked exclusively for the group stage.",
    image: "/images/basecamp-france.jpg",
  },
  "Senegal": {
    city: "Piscataway", region: "New Jersey", country: "USA",
    coordinates: { lat: 40.4862, lng: -74.4518 },
    facility: "Rutgers University",
    blurb: "Lions of Teranga base at Rutgers, with full Big Ten athletic infrastructure, dorms, and a short drive to MetLife Stadium where they play their Group I opener vs France.",
    image: "/images/basecamp-senegal.jpg",
  },
  "Norway": {
    city: "Greensboro", region: "North Carolina", country: "USA",
    coordinates: { lat: 36.0726, lng: -79.7920 },
    facility: "UNC Greensboro",
    blurb: "Norway's federation picked UNC Greensboro for its on-campus athletic complex (multiple full-size pitches plus recovery facilities), a quieter setting than larger cities, and Piedmont elevation that's slightly cooler in June.",
    image: "/images/basecamp-norway.jpg",
  },
  "Iraq": {
    city: "White Sulphur Springs", region: "West Virginia", country: "USA",
    coordinates: { lat: 37.8125, lng: -80.4587 },
    facility: "The Greenbrier Sports Performance Center",
    blurb: "Lions of Mesopotamia base at The Greenbrier resort's high-end sports performance facility in the West Virginia mountains. First WC in 40 years for Iraq, and the seclusion of a private resort suits a federation that prefers tight media control.",
    image: "/images/basecamp-iraq.jpg",
  },

  // GROUP J
  "Argentina": {
    city: "Kansas City", region: "Kansas", country: "USA",
    coordinates: { lat: 39.1141, lng: -94.6275 },
    facility: "Sporting KC Training Centre",
    blurb: "La Albiceleste base at Sporting Kansas City's MLS training centre on the Kansas side of the metro. Defending champions share the KC area with England and the Netherlands, an unusual three-favourite cluster.",
    image: "/images/basecamp-argentina.jpg",
  },
  "Austria": {
    city: "Santa Barbara", region: "California", country: "USA",
    coordinates: { lat: 34.4358, lng: -119.8276 },
    facility: "UC Santa Barbara - Harder Stadium",
    blurb: "Das Team train at UCSB's Harder Stadium in Goleta, just outside Santa Barbara. Mediterranean coastal climate that Austrian players adapt to easily, plus full NCAA Division I athletic infrastructure.",
    image: "/images/basecamp-austria.jpg",
  },
  "Algeria": {
    city: "Lawrence", region: "Kansas", country: "USA",
    coordinates: { lat: 38.9717, lng: -95.2353 },
    facility: "University of Kansas",
    blurb: "Les Fennecs camp at the University of Kansas in Lawrence, a 45-minute drive from the Kansas City metro. KU's Rock Chalk Park gives them an NCAA-grade pitch, on-campus housing, and a quieter base than the city itself.",
    image: "/images/basecamp-algeria.jpg",
  },
  "Jordan": {
    city: "Portland", region: "Oregon", country: "USA",
    coordinates: { lat: 45.5152, lng: -122.6784 },
    facility: "University of Portland",
    blurb: "Al-Nashama base at the University of Portland's athletic campus. First WC for Jordan, and the Pacific Northwest climate is dramatically cooler than Amman, helping with training intensity.",
    image: "/images/basecamp-jordan.jpg",
  },

  // GROUP K
  "Portugal": {
    city: "Palm Beach Gardens", region: "Florida", country: "USA",
    coordinates: { lat: 26.8235, lng: -80.1387 },
    facility: "Gardens North County District Park",
    blurb: "Seleção das Quinas base in Palm Beach Gardens at a county sports park. South Florida heat and humidity mirror summer Lisbon, and Hard Rock Stadium in Miami is 90 minutes south for Group K fixtures.",
    image: "/images/basecamp-portugal.jpg",
  },
  "Colombia": {
    city: "Zapopan", region: "Jalisco", country: "Mexico",
    coordinates: { lat: 20.6597, lng: -103.3496 },
    facility: "Academia Atlas FC",
    blurb: "Los Cafeteros train at Liga MX side Atlas FC's academy. Guadalajara's altitude (1,560m, closer to Bogotá than sea-level US venues), top-tier Mexican club infrastructure, and Spanish-speaking environment all suit the squad.",
    image: "/images/basecamp-colombia.jpg",
  },
  "Uzbekistan": {
    city: "Marietta", region: "Georgia", country: "USA",
    coordinates: { lat: 33.7490, lng: -84.3880 },
    facility: "Atlanta United Training Centre",
    blurb: "First-time World Cup qualifiers Uzbekistan train at Atlanta United's MLS facility. The federation picked a southeast US base with direct flights to Group K venues and a high-quality stadium-grade pitch.",
    image: "/images/basecamp-uzbekistan.jpg",
  },
  "DR Congo": {
    city: "Houston", region: "Texas", country: "USA",
    coordinates: { lat: 29.7604, lng: -95.3698 },
    facility: "Houston Sports Park",
    blurb: "Léopards base at a Houston training complex. NRG Stadium is 15 miles south, meaning no travel for at least one of their Group K matches.",
    image: "/images/basecamp-dr-congo.jpg",
  },

  // GROUP L
  "England": {
    city: "Kansas City", region: "Missouri", country: "USA",
    coordinates: { lat: 39.1141, lng: -94.6275 },
    facility: "Swope Soccer Village",
    blurb: "The Three Lions camp at Swope Soccer Village, a public multi-pitch complex in the KC metro. Central US location gives near-equal travel to East and West Coast Group L venues (Seattle, Dallas, Houston).",
    image: "/images/basecamp-england.jpg",
  },
  "Croatia": {
    city: "Alexandria", region: "Virginia", country: "USA",
    coordinates: { lat: 38.8048, lng: -77.0469 },
    facility: "Episcopal High School",
    blurb: "Vatreni base at a private boarding-school campus 8 miles south of Washington DC, with closed pitches and on-site dorms. The setup matches their 2018 base camp model in Russia: semi-rural seclusion and controlled access.",
    image: "/images/basecamp-croatia.jpg",
  },
  "Panama": {
    city: "New Tecumseth", region: "Ontario", country: "Canada",
    coordinates: { lat: 44.1593, lng: -79.7944 },
    facility: "Nottawasaga Training Site",
    blurb: "La Marea Roja base in rural Ontario, an hour north of Toronto. Quieter than the city, with full training-grade fields and a short drive to BMO Field for their Group L match vs Canada.",
    image: "/images/basecamp-panama.jpg",
  },
  "Ghana": {
    city: "Smithfield", region: "Rhode Island", country: "USA",
    coordinates: { lat: 41.9152, lng: -71.5419 },
    facility: "Bryant University",
    blurb: "Black Stars base at Bryant University in Rhode Island, just outside Providence. New England campus setting and proximity to Boston gives them quick access to Gillette Stadium for Group L fixtures.",
    image: "/images/basecamp-ghana.jpg",
  },
}

export function getBaseCamp(team: string): BaseCamp | undefined {
  return baseCamps[team]
}

// Returns the list of teams basing in the given city (case-insensitive match).
// Used on host-city pages to show "teams basing here" cross-links.
export function getTeamsByBaseCity(cityName: string): string[] {
  const normalized = cityName.toLowerCase()
  return Object.entries(baseCamps)
    .filter(([, b]) => b.city.toLowerCase() === normalized)
    .map(([team]) => team)
}

// Haversine distance in miles between two lat/lng points.
export function distanceMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 3958.8 // Earth radius in miles
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}
