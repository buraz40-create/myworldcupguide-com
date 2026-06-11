// Visitor guide data: extends cities.ts with deep travel info.
// Keyed by city slug. Merged into the City detail page for SEO + UX.
//
// Notes on accuracy:
// - Hotel price ranges are typical 2024 averages and will rise during the tournament; use as relative tiers.
// - Fan Festival / official fan-zone sites are partially confirmed by FIFA. Where unconfirmed,
//   we list "expected" locations based on city tourism announcements.
// - Stadium-specific match-day rules (bag policy, gate times) live in stadiumGuides.ts.

export type CityGuide = {
  slug: string

  airports: {
    code: string
    name: string
    distanceToStadium: string
    routeToStadium: string
  }[]

  hotelTiers: {
    budget: { area: string; nightlyUSD: string; why: string }
    mid: { area: string; nightlyUSD: string; why: string }
    luxury: { area: string; nightlyUSD: string; why: string }
  }

  // Where fans can gather to watch matches without tickets
  fanZones: {
    summary: string
    locations: string[]
  }
  // Sports bars / pubs known for showing football
  whereToWatchOtherGames: string[]

  // Safety
  safetyNotes: string
  neighborhoodsToAvoid: string[]

  // Money
  currency: {
    code: string
    symbol: string
    tippingNorm: string
    cardAccepted: string
    taxNotes: string
  }

  // Language + practical
  language: {
    primary: string
    phrases: { phrase: string; meaning: string }[]
  }
  packingList: string[]
  connectivity: string
  emergencyNumber: string

  // FAQ for FAQPage schema
  faqs: { question: string; answer: string }[]
}

export const cityGuides: CityGuide[] = [
  // ── NEW YORK / NEW JERSEY ────────────────────────────────────────────────
  {
    slug: "new-york-new-jersey",
    airports: [
      { code: "EWR", name: "Newark Liberty International", distanceToStadium: "13 km / 25-40 min", routeToStadium: "Closest to MetLife. Take NJ Transit AirTrain to Newark Penn Station, then transfer to NJ Transit Meadowlands rail (match-day service direct to MetLife)." },
      { code: "JFK", name: "John F. Kennedy International", distanceToStadium: "40 km / 60-90 min", routeToStadium: "AirTrain to Jamaica, LIRR to Penn Station NYC, then NJ Transit Meadowlands match-day train. Plan 2 hours including transfers." },
      { code: "LGA", name: "LaGuardia", distanceToStadium: "30 km / 45-75 min", routeToStadium: "Q70 bus to Jackson Hts subway, then E/M to Penn Station, then match-day train. Or rideshare for $50-90." },
    ],
    hotelTiers: {
      budget: { area: "Jersey City / Hoboken / Newark", nightlyUSD: "$120-200", why: "PATH train links to Manhattan in 10-15 min. Newark is also close to MetLife via NJ Transit." },
      mid: { area: "Midtown Manhattan / Long Island City", nightlyUSD: "$280-450", why: "Walking distance to Penn Station (the match-day rail hub) plus easy subway access to all of NYC." },
      luxury: { area: "Tribeca / SoHo / Upper East Side", nightlyUSD: "$650-1500+", why: "Premium hotels (Four Seasons, Aman, The Mark). Concierge can book restaurants and arrange Final transport." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Liberty State Park (Jersey City) with views of Lower Manhattan. Free entry, big screens, food, and live entertainment between matches.",
      locations: ["Liberty State Park (Jersey City) - expected primary fan festival", "Times Square big-screen viewings", "Hudson Yards plaza"],
    },
    whereToWatchOtherGames: [
      "The Football Factory at Legends - midtown, dedicated football pub with international supporters",
      "Smithfield Hall - Hell's Kitchen, multiple screens",
      "Banc Cafe - midtown, popular with European fans",
      "Mary O's - East Village, Irish pub with strong football scene",
    ],
    safetyNotes: "Manhattan is generally safe day and night. Subway is safe but stay alert late at night. Avoid empty subway cars. East New York, parts of the South Bronx and Newark's Central Ward are not tourist areas - use rideshare to/from MetLife rather than walking.",
    neighborhoodsToAvoid: ["Brownsville (Brooklyn) at night", "Hunts Point (Bronx)", "Newark Central Ward at night"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink at bars; 15-20% for taxis/rideshare; $1-2 per bag for hotel porters.", cardAccepted: "Cards accepted nearly everywhere including subway turnstiles. Apple Pay/Google Pay widely supported. Carry $40-60 cash for small vendors and tips.", taxNotes: "NY sales tax 8.875%. NJ sales tax 6.625%. Restaurant menu prices do not include tax or tip - expect ~30% added to your bill total." },
    language: { primary: "English", phrases: [] },
    packingList: ["Light layers - June can swing 60-90°F (15-32°C)", "Compact umbrella - thunderstorms are common", "Comfortable walking shoes (you'll walk 15-25k steps/day)", "Sunglasses + sunscreen", "Stadium-approved clear bag (12\"x6\"x12\") for MetLife", "Portable phone charger - long match days drain batteries"],
    connectivity: "5G is excellent across all carriers. Buy a US prepaid eSIM (Mint, US Mobile, T-Mobile prepaid) on arrival - $30-50 for 1 month unlimited. Free WiFi at airports, most cafes, and on most subway stations.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Manhattan to MetLife Stadium on match day?", answer: "Take an NJ Transit train from Penn Station NY directly to the Meadowlands Rail Station at MetLife. Service runs frequently on match days starting ~3 hours before kickoff. Journey takes 25-30 minutes. Round-trip ticket is around $13." },
      { question: "Which airport is closest to MetLife Stadium?", answer: "Newark (EWR) is the closest at about 13 km. JFK and LaGuardia are further but better connected to Manhattan, where most fans stay. If you're flying internationally and prioritize stadium proximity, choose Newark." },
      { question: "Is the New York subway safe at night during the World Cup?", answer: "Yes, the subway is generally safe. Stay alert in less-busy stations late at night and avoid empty cars. After matches at MetLife, use the official NJ Transit return train rather than walking - the area around the stadium is industrial and not pedestrian-friendly." },
      { question: "Where is the best place to watch the World Cup Final in New York if I don't have a ticket?", answer: "FIFA's Fan Festival is expected at Liberty State Park with a giant screen and full hospitality. Times Square will host an outdoor screening. Football-dedicated pubs (Football Factory at Legends, Smithfield Hall, Banc Cafe) offer a more intimate atmosphere." },
      { question: "Do I need to tip in New York?", answer: "Yes - tipping is standard. 18-20% at sit-down restaurants, $1-2 per drink at bars, 15-20% for taxis. Quick-service places have tip prompts on card readers but tipping there is optional." },
    ],
  },

  // ── LOS ANGELES ──────────────────────────────────────────────────────────
  {
    slug: "los-angeles",
    airports: [
      { code: "LAX", name: "Los Angeles International", distanceToStadium: "5 km / 15-25 min", routeToStadium: "SoFi Stadium is right next to LAX. Metro K Line, rideshare ($15-25), or hotel shuttles. The closest airport-to-stadium ratio of any World Cup host city." },
      { code: "BUR", name: "Hollywood Burbank", distanceToStadium: "35 km / 45-90 min", routeToStadium: "Smaller airport, good for domestic connections. Metro Red Line + transfer to K Line, or rideshare ($45-85)." },
      { code: "LGB", name: "Long Beach", distanceToStadium: "35 km / 45-75 min", routeToStadium: "Limited routes. Rideshare or rental car recommended." },
    ],
    hotelTiers: {
      budget: { area: "Inglewood / Hawthorne / Culver City", nightlyUSD: "$140-220", why: "Walking or short Uber to SoFi. Inglewood especially is gentrifying fast around the stadium." },
      mid: { area: "Santa Monica / West Hollywood / Downtown LA", nightlyUSD: "$280-450", why: "Beach, nightlife, or Metro K Line direct to the stadium. Plan 30-45 min travel time." },
      luxury: { area: "Beverly Hills / Bel-Air / Malibu", nightlyUSD: "$700-2500+", why: "Iconic LA luxury (Beverly Hills Hotel, Bel-Air, Nobu Ryokan). Concierge can arrange black cars to SoFi." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected on the Stadium District plaza next to SoFi, plus a downtown LA secondary site (likely Grand Park or LA Live). Free entry, screens for matches not at SoFi.",
      locations: ["SoFi Stadium District plaza", "LA Live (downtown) - confirmed by city of LA", "Grand Park (downtown)"],
    },
    whereToWatchOtherGames: [
      "The Cock 'n Bull Pub - Santa Monica, classic British pub showing all matches",
      "Ye Olde King's Head - Santa Monica, English pub with full football coverage",
      "The Greyhound Bar & Grill - Highland Park, popular with USMNT supporters",
      "Tom Bergin's - Hancock Park, Irish pub with European fan crowd",
    ],
    safetyNotes: "Tourist areas (Santa Monica, Beverly Hills, West Hollywood, Hollywood, Downtown core) are safe day and night. Skid Row (downtown east of Spring St) and parts of South LA are best avoided. Don't leave anything visible in parked cars - smash-and-grab is common.",
    neighborhoodsToAvoid: ["Skid Row (downtown LA)", "Compton at night", "Watts at night"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink at bars; 15-20% for rideshare; $2-5 for valet parking. Cash tips preferred where possible.", cardAccepted: "Cards and Apple Pay accepted everywhere. Carry $30-50 cash for tips and small vendors. Some food trucks are cash-only.", taxNotes: "California sales tax 9.5% in LA County. Restaurant tax not shown on menu prices - your final bill will be ~30% above menu price after tax + tip." },
    language: { primary: "English (Spanish widely spoken)", phrases: [] },
    packingList: ["Light clothing - June daytime 70-85°F (21-29°C), evenings cool to 55°F (13°C)", "Layers for marine layer (morning fog, especially near coast)", "Sunscreen SPF 50+ - UV index high", "Sunglasses", "Comfortable walking shoes plus one nicer pair if doing nightlife", "Stadium clear bag for SoFi", "Portable charger"],
    connectivity: "Excellent 5G everywhere. eSIM from Mint or US Mobile for $20-40/month. Free WiFi at SoFi, all malls, and most cafes.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from LAX to SoFi Stadium?", answer: "SoFi is the closest airport-to-stadium of any World Cup host city. Take a rideshare for $15-25 (15-25 min depending on traffic), the Metro K Line (transfer at Aviation Station), or a hotel shuttle. On match days, traffic is heavy - leave 90 minutes early." },
      { question: "Is downtown LA safe to stay in for the World Cup?", answer: "The downtown core (Bunker Hill, Arts District, Little Tokyo, Historic Core, South Park) is safe and walkable, especially around LA Live. Avoid Skid Row (centered on 6th and San Pedro). DTLA is well-served by Metro K Line direct to SoFi." },
      { question: "Do I need a car in Los Angeles for the World Cup?", answer: "No, but it helps. Metro covers stadium and major attractions. Rideshare is plentiful but surges 3-5x on match days. If you're doing day trips (Disneyland, Malibu, Joshua Tree) renting a car is worthwhile - otherwise rideshare." },
      { question: "What is the best fan zone in LA for the World Cup?", answer: "FIFA Fan Festival at the SoFi Stadium District plaza is the primary on-site option. LA Live downtown will have an outdoor screening venue with food and entertainment. Both are free entry but expect long lines for big matches." },
      { question: "What time should I arrive at SoFi Stadium for a match?", answer: "Gates typically open 90 minutes before kickoff at SoFi. Arrive 2-3 hours early to clear security, find your seats, and avoid the worst traffic. Post-match exit takes 60-90 minutes - have a transport plan." },
    ],
  },

  // ── DALLAS ───────────────────────────────────────────────────────────────
  {
    slug: "dallas",
    airports: [
      { code: "DFW", name: "Dallas/Fort Worth International", distanceToStadium: "30 km / 25-45 min", routeToStadium: "Most international flights land here. Rideshare $35-60, or DART Orange Line + transfer + rideshare for budget option." },
      { code: "DAL", name: "Dallas Love Field", distanceToStadium: "32 km / 30-50 min", routeToStadium: "Smaller, mostly Southwest Airlines. Rideshare $30-55, or DART Green Line transfers." },
    ],
    hotelTiers: {
      budget: { area: "Arlington / Grand Prairie / Irving", nightlyUSD: "$120-200", why: "Walking distance or short drive to AT&T Stadium. Limited nightlife - it's mostly business hotels." },
      mid: { area: "Uptown Dallas / Deep Ellum / Downtown Fort Worth", nightlyUSD: "$200-350", why: "Best nightlife and food. 25-35 min Uber to stadium. Uptown is the nightlife heart; Deep Ellum is hipper and grittier." },
      luxury: { area: "Uptown Dallas (Crescent, Ritz) / Highland Park", nightlyUSD: "$500-1200+", why: "Rosewood Mansion on Turtle Creek, The Joule (downtown), Ritz-Carlton Dallas. Concierge handles black-car to AT&T." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Klyde Warren Park (downtown Dallas) - elevated park over the freeway with covered viewing areas. Fort Worth Sundance Square also planning a viewing site.",
      locations: ["Klyde Warren Park (downtown Dallas) - expected primary site", "Sundance Square (Fort Worth)", "AT&T Stadium plaza on match days"],
    },
    whereToWatchOtherGames: [
      "The Londoner - Uptown, English pub showing every match",
      "Trinity Hall - Mockingbird Station, Irish pub with strong football following",
      "Three Sheets - Addison, multiple screens and craft beer",
      "The Old Monk - Henderson Ave, classic European-style pub",
    ],
    safetyNotes: "Tourist areas of Dallas (Uptown, Downtown, Deep Ellum, Bishop Arts) are safe. Avoid south Dallas late at night. Arlington around the stadium is suburban and safe. Walking is limited; use rideshare for distances over 5 blocks.",
    neighborhoodsToAvoid: ["Far South Dallas at night", "Old East Dallas off the main strips at night"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink; 15-20% for rideshare; tip BBQ-counter staff $2-5 in the tip jar.", cardAccepted: "Cards everywhere. Apple Pay widely accepted. Carry $20-40 cash for BBQ joints and food trucks.", taxNotes: "Texas sales tax 8.25%. No state income tax means hotel taxes are reasonable. Restaurant prices on menu - add ~30% for tax + tip." },
    language: { primary: "English (Spanish widely spoken)", phrases: [] },
    packingList: ["Lightweight breathable clothes - June 85-100°F (29-38°C) and humid", "A light jacket for over-air-conditioned restaurants and the stadium", "Sunscreen SPF 50+", "Sunglasses + a hat", "Refillable water bottle (most stadiums allow empty bottles)", "Comfortable shoes for hot pavement", "Stadium clear bag for AT&T"],
    connectivity: "Excellent 5G. eSIM from Mint, US Mobile, or T-Mobile prepaid. Free WiFi in all hotels, most restaurants, and at AT&T Stadium.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from downtown Dallas to AT&T Stadium?", answer: "AT&T is in Arlington, between Dallas and Fort Worth. Best options: rideshare ($25-50, 25-35 min), pre-booked match-day shuttle (often run from major hotels), or driving (parking $40-80). DART rail does not reach the stadium directly." },
      { question: "Is Dallas safe for World Cup visitors?", answer: "Tourist areas (Uptown, Downtown, Deep Ellum, Bishop Arts, Klyde Warren Park) are safe day and night. Don't walk between distant areas - Dallas is built for cars, not pedestrians. Use rideshare." },
      { question: "Should I stay in Dallas or Arlington for the World Cup?", answer: "Stay in Uptown Dallas or downtown Fort Worth for nightlife and dining; you'll Uber 25-35 min to the stadium. Stay in Arlington if you want to walk to the stadium and don't need much else - it's quieter and primarily business hotels." },
      { question: "How hot will it be at AT&T Stadium during the World Cup?", answer: "Texas in June/July hits 95-105°F (35-40°C). AT&T Stadium has a retractable roof and full air-conditioning, so the stadium itself stays around 72°F. Outside is brutal - hydrate constantly and wear sun protection." },
      { question: "Where can I watch the World Cup in Dallas without a ticket?", answer: "Klyde Warren Park downtown is expected to host the official FIFA Fan Festival with big screens. Sundance Square in Fort Worth also planning a viewing site. Football-focused pubs include The Londoner (Uptown) and Trinity Hall (Mockingbird Station)." },
    ],
  },

  // ── SAN FRANCISCO BAY AREA ───────────────────────────────────────────────
  {
    slug: "san-francisco-bay-area",
    airports: [
      { code: "SFO", name: "San Francisco International", distanceToStadium: "40 km / 35-60 min", routeToStadium: "BART to Millbrae, Caltrain south to Mountain View, then VTA Light Rail to the stadium - long but cheap. Or rideshare $50-80." },
      { code: "OAK", name: "Oakland International", distanceToStadium: "60 km / 50-80 min", routeToStadium: "BART to San Bruno + Caltrain south, or drive 50-80 min. Cheaper flights, harder transit." },
      { code: "SJC", name: "Mineta San Jose International", distanceToStadium: "10 km / 15-25 min", routeToStadium: "Closest to Levi's. VTA bus or rideshare $20-35. Best choice if you can get a flight here." },
    ],
    hotelTiers: {
      budget: { area: "Mountain View / Sunnyvale / San Jose", nightlyUSD: "$180-280", why: "Caltrain or VTA to Levi's in 20 min. Cheaper than SF and closer to the stadium." },
      mid: { area: "San Francisco SoMa / Mission / Downtown San Jose", nightlyUSD: "$300-500", why: "SF for everything; San Jose for stadium proximity. Both have transit to Levi's." },
      luxury: { area: "Nob Hill / Fairmont / Four Seasons SF / Rosewood Sand Hill (Menlo Park)", nightlyUSD: "$700-2000+", why: "Iconic SF hotels (Fairmont, Ritz, Four Seasons). Sand Hill in Menlo Park if you want quiet luxury near the stadium." },
    },
    fanZones: {
      summary: "FIFA Fan Festival site to be confirmed. Expected candidates: Civic Center Plaza (SF), San Pedro Square (San Jose), or Levi's Stadium plaza. Pier 39 may also host viewing parties.",
      locations: ["Civic Center Plaza (SF) - expected", "San Pedro Square (downtown San Jose)", "Pier 39 Aquatic Park"],
    },
    whereToWatchOtherGames: [
      "Mad Dog in the Fog - Lower Haight SF, cult football pub",
      "The Pig & Whistle - Inner Richmond SF, English pub showing all matches",
      "Britannia Arms - Almaden / Cupertino, multiple Bay locations",
      "The Bullpen - downtown San Jose, dedicated sports bar",
    ],
    safetyNotes: "SF is mostly safe but has a noticeable open-drug-use problem in the Tenderloin and parts of SoMa. Avoid the Tenderloin at night. Mission, Castro, Hayes Valley, Marina, and tourist areas (Fisherman's Wharf, Union Square in daytime) are fine. Car break-ins are extremely common - never leave anything visible in a parked car.",
    neighborhoodsToAvoid: ["Tenderloin (SF) at night", "6th Street between Market and Howard", "parts of West Oakland at night"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants (some SF places now charge 20% service automatically); $1-2 per drink; 15-20% for rideshare.", cardAccepted: "Cards/Apple Pay everywhere. Some neighborhood spots are cash-preferred. SF restaurants commonly add a 4-6% 'SF Healthcare' surcharge - check your bill.", taxNotes: "California sales tax 8.625-9.875% depending on Bay city. SF restaurant bills include healthcare/wellness surcharges (4-6%) on top of tax." },
    language: { primary: "English (Spanish, Cantonese, Mandarin, Tagalog widely spoken)", phrases: [] },
    packingList: ["Layers - SF June is famously cold (50-65°F / 10-18°C), foggy, and windy", "Light jacket essential, even in summer", "Closed-toe shoes for hilly walking", "Sunglasses (afternoons can be bright)", "Stadium clear bag for Levi's", "Levi's Stadium gets sun-baked - sunscreen if attending an afternoon match"],
    connectivity: "Excellent 5G across the Bay. Free WiFi on Caltrain, BART stations, most cafes. Good coverage at Levi's Stadium.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from San Francisco to Levi's Stadium?", answer: "Caltrain south to Mountain View, then VTA Light Rail one stop to Great America (the stadium). 75-90 min total, $9 each way. Driving is 50-60 min without traffic but parking is $40-80 and traffic on match days is severe. Rideshare $80-130." },
      { question: "Should I stay in San Francisco or San Jose for the World Cup?", answer: "Stay in SF if you want the city experience and don't mind 90 min to the stadium. Stay in San Jose, Mountain View, or Sunnyvale to be 15-30 min from Levi's. If only attending one match, stay in SF; if attending multiple, San Jose saves 3+ hours per match in transit." },
      { question: "Why is San Francisco so cold in summer?", answer: "Cold ocean upwelling combined with the warm inland Central Valley creates a marine layer (fog) that dumps cold, damp air over SF most summer mornings and evenings. Pack a jacket even in June and July. Inland (San Jose, Levi's Stadium) is much warmer." },
      { question: "Is the Tenderloin neighborhood safe?", answer: "The Tenderloin has a serious open-air drug market and homelessness crisis. Tourists are not typically targets but the environment is unsettling and unsafe at night. Avoid it - especially the area between Market, Polk, Geary, and Mason Streets after dark." },
      { question: "What's the best airport to fly into for Levi's Stadium?", answer: "San Jose (SJC) is by far the closest at 10 km. SFO (San Francisco International) has more flights but is 40 km away with 60+ min transit. OAK (Oakland) is the cheapest for domestic but adds time. Pick SJC if your route allows." },
    ],
  },

  // ── MIAMI ────────────────────────────────────────────────────────────────
  {
    slug: "miami",
    airports: [
      { code: "MIA", name: "Miami International", distanceToStadium: "20 km / 25-50 min", routeToStadium: "Closest major airport. Tri-Rail train + transfer to bus, or rideshare $30-55." },
      { code: "FLL", name: "Fort Lauderdale-Hollywood", distanceToStadium: "20 km / 25-45 min", routeToStadium: "Same distance as MIA but often cheaper flights. Rideshare $30-55, or Tri-Rail south to Hollywood + bus." },
    ],
    hotelTiers: {
      budget: { area: "Miami Gardens / Hollywood / North Miami", nightlyUSD: "$150-250", why: "Walking or short Uber to Hard Rock Stadium. Less nightlife, more hotel chains." },
      mid: { area: "Brickell / Wynwood / Mid-Beach", nightlyUSD: "$250-450", why: "Best food, art, and walkability. 25-35 min to the stadium by Uber." },
      luxury: { area: "South Beach / Bal Harbour / Miami Beach Edition", nightlyUSD: "$600-2000+", why: "Iconic Art Deco luxury (Faena, Edition, 1 Hotel, Setai). Concierge handles transport to Hard Rock." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Bayfront Park (downtown Miami) on the water. Wynwood Walls also planning a fan-zone activation. Miami hosts the 3rd Place playoff so expect peak fan-zone activity in mid-July.",
      locations: ["Bayfront Park (downtown Miami) - expected primary site", "Wynwood Walls outdoor plaza", "Miami Beach SoundScape Park"],
    },
    whereToWatchOtherGames: [
      "American Social - Brickell, sports bar with full football coverage",
      "Tap 42 - multiple Miami locations, big-screen culture",
      "Lagniappe - South Beach, Argentine-style for Conmebol matches",
      "The Cuban Guys / Versailles - Little Havana, Latin America fan crowd",
    ],
    safetyNotes: "South Beach, Brickell, Wynwood, Coral Gables are safe day and night. Overtown and parts of Liberty City are best avoided. Be alert at night anywhere - petty theft and rental-car break-ins are common. Don't walk on the beach alone late at night.",
    neighborhoodsToAvoid: ["Overtown at night", "Liberty City", "parts of Little Haiti late at night"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants (often automatically added at South Beach); $1-2 per drink; 15-20% for rideshare. Check bill - many restaurants add 18-22% gratuity automatically and you might double-tip without noticing.", cardAccepted: "Cards everywhere. Carry $30-50 cash for taxis at the airport (Uber is cheaper) and small vendors.", taxNotes: "Florida sales tax 7%. Miami Beach has additional resort taxes. Restaurant menu prices don't include tax or tip - final bill ~30% above menu." },
    language: { primary: "English (Spanish is the de facto second language - many staff prefer it)", phrases: [{ phrase: "Hola, gracias", meaning: "Hello, thank you" }, { phrase: "La cuenta, por favor", meaning: "The check, please" }, { phrase: "¿Habla inglés?", meaning: "Do you speak English?" }] },
    packingList: ["Lightweight, breathable clothing - June 80-92°F (27-33°C) and very humid", "Rain jacket / compact umbrella - daily afternoon thunderstorms", "Swimsuit (you'll want to use the beach)", "Sunscreen SPF 50+, reef-safe if going to the beach", "Sunglasses + hat", "Flip-flops + comfortable walking shoes", "Stadium clear bag for Hard Rock"],
    connectivity: "Excellent 5G. eSIM from Mint or US Mobile. Free WiFi in most hotels, on Miami Beach trolleys, and at the airport.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from South Beach to Hard Rock Stadium?", answer: "Hard Rock is 30 km from South Beach (40-60 min by car depending on traffic). Rideshare $40-80, or take MetroRail at Earlington Heights then dedicated stadium shuttle on match days. Driving is faster but stadium parking is $40-80." },
      { question: "Is South Beach safe at night for World Cup visitors?", answer: "Ocean Drive is busy and safe through midnight; the rest of South Beach is generally safe. Watch your drink and your phone in clubs. Don't walk on the beach at night - it's poorly lit and unsafe." },
      { question: "How bad is Miami summer weather during the World Cup?", answer: "Hot (85-92°F) and very humid (80%+). Daily afternoon thunderstorms are normal but usually pass in 30-60 min. The stadium is partially covered. Plan indoor activities (museums, restaurants, malls) for the worst heat hours (12-4pm)." },
      { question: "Do I need to speak Spanish in Miami?", answer: "No - English is universal in tourist areas. But Spanish is the dominant language in many neighborhoods (Little Havana, parts of Hialeah and Doral). Learning a few phrases is appreciated and may get you better service in family-run restaurants." },
      { question: "Where is the World Cup 3rd Place match being played?", answer: "Hard Rock Stadium in Miami Gardens hosts the 3rd Place playoff on July 18, 2026. The Final is in MetLife (NY/NJ) the next day, July 19." },
    ],
  },

  // ── SEATTLE ──────────────────────────────────────────────────────────────
  {
    slug: "seattle",
    airports: [
      { code: "SEA", name: "Seattle-Tacoma International", distanceToStadium: "20 km / 25-45 min", routeToStadium: "Link Light Rail directly to Stadium Station - the easiest airport-to-stadium transit of any host city. $3.50, 35 min. No transfers." },
    ],
    hotelTiers: {
      budget: { area: "Belltown / Capitol Hill / SoDo", nightlyUSD: "$160-260", why: "All within 1-2 Light Rail stops or 20 min walk to Lumen Field. Capitol Hill has the best nightlife." },
      mid: { area: "Downtown Seattle / Pioneer Square", nightlyUSD: "$250-400", why: "Walking distance to Lumen Field (10-15 min from downtown core). Pike Place Market and the waterfront are right there." },
      luxury: { area: "Fairmont Olympic / Four Seasons / Edgewater", nightlyUSD: "$500-1500+", why: "Classic Seattle luxury in downtown. Concierge can walk you to the stadium - it's that close." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Seattle Center (under the Space Needle) - a natural gathering spot with big screens. Lumen Field plaza also hosts pre-match activities. Pier 62 on the waterfront is a backup option.",
      locations: ["Seattle Center / Space Needle grounds - expected primary fan festival", "Occidental Square (Pioneer Square)", "Pier 62 waterfront"],
    },
    whereToWatchOtherGames: [
      "The George & Dragon Pub - Fremont, dedicated football pub since 1991",
      "FX McRory's - Pioneer Square, blocks from Lumen Field",
      "Kells Irish Pub - Pike Place, traditional pub with all matches shown",
      "The Atlantic Crossing - Roosevelt, Sounders supporter haunt",
    ],
    safetyNotes: "Tourist areas (downtown, Pike Place, Capitol Hill, Fremont, Ballard, Queen Anne) are safe. Pioneer Square is fine in daytime but quieter at night. The 3rd Avenue corridor downtown has visible homelessness and drug activity - avoid late at night. Car break-ins are common.",
    neighborhoodsToAvoid: ["3rd Ave between Pike and Yesler at night", "deeper SoDo industrial blocks at night"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink; 15-20% rideshare; tip baristas $1-2 (huge coffee culture). Many counter-service tip prompts now ask 18-25%.", cardAccepted: "Cards/Apple Pay accepted everywhere including Light Rail. Many places are cashless. Carry $20 cash for tips and Pike Place Market vendors.", taxNotes: "Washington sales tax 10.25% in Seattle (one of the highest in the US). No state income tax. Restaurant menu prices don't include tax or tip - bill ~30% above menu." },
    language: { primary: "English", phrases: [] },
    packingList: ["Light layers - June 60-75°F (15-24°C), often cloudy but rarely rainy in summer", "Light rain shell (it can sprinkle)", "Comfortable walking shoes - hilly", "Sunglasses (sun is bright when it appears)", "Stadium clear bag for Lumen Field", "A warmer mid-layer for cool evenings"],
    connectivity: "Excellent 5G. Free WiFi at Sea-Tac, on Light Rail, and most cafes. Stadium WiFi at Lumen Field.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Sea-Tac airport to Lumen Field?", answer: "Take the Link Light Rail directly from the airport to Stadium Station - $3.50, 35 minutes, no transfers. It's the easiest airport-to-stadium transit of any World Cup host city. Lumen Field is a 2-minute walk from the station." },
      { question: "Is Seattle a walkable city for World Cup visitors?", answer: "Yes, downtown Seattle is very walkable. From Pike Place Market to Lumen Field is about 1.5 km / 20 min on foot. Capitol Hill, Pioneer Square, and the waterfront are all walkable from downtown. Hills are real - wear comfortable shoes." },
      { question: "Will it rain at the World Cup in Seattle?", answer: "June and July are actually Seattle's driest months. Expect cloudy skies and cool temperatures (60-75°F / 15-24°C) but rarely heavy rain. Bring a light shell just in case. The bigger surprise is how chilly evenings can be - pack a layer." },
      { question: "Where can I watch matches in Seattle without a ticket?", answer: "FIFA Fan Festival is expected at Seattle Center under the Space Needle. Football pubs include The George & Dragon (Fremont), FX McRory's (right next to Lumen Field), and Kells (Pike Place). Sounders home pubs welcome international fans." },
      { question: "Do I need to tip in Seattle?", answer: "Yes - 18-20% at sit-down restaurants, $1-2 per drink, $1-2 per coffee. Card readers at counter-service places now often prompt for 15-25% tips - those are optional. Cash tips are appreciated by service staff." },
    ],
  },

  // ── BOSTON ───────────────────────────────────────────────────────────────
  {
    slug: "boston",
    airports: [
      { code: "BOS", name: "Boston Logan International", distanceToStadium: "45 km / 45-75 min", routeToStadium: "Take the Silver Line to South Station, then a match-day shuttle bus to Gillette. Or rideshare $70-110. There's no rail direct to Gillette." },
    ],
    hotelTiers: {
      budget: { area: "Cambridge / Allston / Brookline", nightlyUSD: "$150-260", why: "T (subway) access, cheaper than downtown. Cambridge has Harvard and MIT charm." },
      mid: { area: "Back Bay / Beacon Hill / Seaport", nightlyUSD: "$280-450", why: "Walking distance to South Station for the stadium shuttle. Best nightlife and food." },
      luxury: { area: "Back Bay (Mandarin, Four Seasons) / Seaport (Envoy)", nightlyUSD: "$600-1500+", why: "Boston classic luxury (Mandarin Oriental, Four Seasons, XV Beacon). Concierge arranges car to Gillette." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Boston Common - the city's central park - with big screens and full hospitality. City Hall Plaza or Faneuil Hall may host secondary sites.",
      locations: ["Boston Common - expected primary fan festival", "City Hall Plaza", "Faneuil Hall Marketplace"],
    },
    whereToWatchOtherGames: [
      "The Banshee - Dorchester, dedicated football pub with European crowd",
      "Phoenix Landing - Cambridge, classic football venue",
      "The Burren - Davis Square (Somerville), Irish pub with all matches",
      "Caffe Vittoria / Boston Public Tavern - North End and Faneuil Hall area",
    ],
    safetyNotes: "Boston is one of the safer big US cities. Tourist areas (downtown, Back Bay, Beacon Hill, North End, Cambridge, Seaport, Fenway) are safe day and night. Avoid Mass Ave / Methadone Mile area at night. Don't trust street parking signs - they're notoriously confusing.",
    neighborhoodsToAvoid: ["Methadone Mile (Mass Ave between Albany and Melnea Cass) at night"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink; 15-20% rideshare; cab drivers expect 15-20%.", cardAccepted: "Cards everywhere. CharlieCard for the T (subway). Apple Pay accepted on most things including the T.", taxNotes: "Mass sales tax 6.25% (no tax on clothing under $175 - useful for World Cup jersey shopping). Restaurant tax 6.25% added at the till." },
    language: { primary: "English", phrases: [] },
    packingList: ["Layers - June can swing 55-85°F (13-29°C)", "Compact umbrella", "Comfortable walking shoes (cobblestone streets)", "Sunglasses", "A warmer evening layer for night matches at Gillette", "Stadium clear bag for Gillette"],
    connectivity: "Excellent 5G. Free WiFi on the T (some lines), at airports, and most cafes.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Boston to Gillette Stadium?", answer: "Gillette is 45 km south of Boston in Foxborough - the most distant stadium-to-host-city distance among US World Cup venues. Take the MBTA Commuter Rail special match-day train from South Station ($10-20 round trip, 60-75 min). Driving is similar but parking is $40-60. Rideshare $70-110." },
      { question: "Is Boston walkable for World Cup visitors?", answer: "Yes, downtown Boston is one of the most walkable US cities. From Back Bay to the North End is about 30 min on foot through scenic neighborhoods. The T (subway) covers everything else. You'll want shoes that handle cobblestones." },
      { question: "Where is the FIFA Fan Festival in Boston?", answer: "Boston Common (the central park near downtown) is the expected primary FIFA Fan Festival site. It's walking distance from most downtown hotels and a natural gathering point. Secondary sites at City Hall Plaza or Faneuil Hall may also host viewings." },
      { question: "What's the weather like in Boston during the World Cup?", answer: "June in Boston is typically mild (65-80°F / 18-27°C) with some humidity. Evening matches can be cool - pack a layer. Foxborough (where Gillette Stadium is) is slightly cooler than the city. Rain is possible but rarely lasts all day." },
      { question: "What is the best neighborhood to stay in for the World Cup?", answer: "Back Bay is the best mix of central, walkable, and accessible to South Station for the Gillette shuttle. Seaport is newer and modern with easy Silver Line to the airport. Cambridge is more affordable with the Red Line into the city." },
    ],
  },

  // ── PHILADELPHIA ─────────────────────────────────────────────────────────
  {
    slug: "philadelphia",
    airports: [
      { code: "PHL", name: "Philadelphia International", distanceToStadium: "10 km / 15-25 min", routeToStadium: "SEPTA Broad Street Line directly to NRG Station, walk 10 min. Or rideshare $25-40. The closest US airport-to-stadium pairing along with LAX/SoFi." },
    ],
    hotelTiers: {
      budget: { area: "Northern Liberties / Fishtown / South Philly", nightlyUSD: "$130-220", why: "Hip neighborhoods, cheap by big-city standards, easy SEPTA access to stadium." },
      mid: { area: "Center City / Rittenhouse Square / Old City", nightlyUSD: "$220-380", why: "Walking distance to most attractions and SEPTA Broad Street Line direct to the stadium." },
      luxury: { area: "Rittenhouse Square (Four Seasons, Ritz-Carlton)", nightlyUSD: "$500-1200+", why: "Four Seasons in the Comcast Center is one of the highest-rated US luxury hotels. Concierge arranges everything." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Independence Mall - in front of Independence Hall and the Liberty Bell. A historically significant gathering site with full hospitality and big screens.",
      locations: ["Independence Mall - expected primary fan festival", "Penn's Landing (waterfront)", "LOVE Park"],
    },
    whereToWatchOtherGames: [
      "Misconduct Tavern - Center City, dedicated football pub",
      "Fado Irish Pub - Center City, classic Irish football pub",
      "The Field House - Old City, multiple screens",
      "Twisted Tail - Old City, popular with European visitors",
    ],
    safetyNotes: "Center City, Old City, Rittenhouse, University City, and the museum district are safe. Kensington (north of downtown) has a serious open-air drug crisis - do not visit even out of curiosity. The walk from Lincoln Financial Field to the SEPTA station is well-trafficked on match days.",
    neighborhoodsToAvoid: ["Kensington (entire neighborhood, especially around Kensington and Allegheny)", "parts of West Philly off University City"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink; 15-20% rideshare. Cheesesteak counters expect $1-2 in the tip jar.", cardAccepted: "Cards/Apple Pay everywhere. Some cheesesteak places (Pat's, Geno's) are cash-preferred. Carry $20-30 cash.", taxNotes: "Pennsylvania sales tax 6%. Philadelphia adds 2% local for 8% total. No tax on clothing - great for World Cup gear shopping." },
    language: { primary: "English", phrases: [] },
    packingList: ["Light layers - June 65-85°F (18-29°C), humid", "Compact umbrella - thunderstorms common", "Comfortable walking shoes (lots of cobblestones in Old City)", "Sunglasses", "Stadium clear bag for Lincoln Financial Field"],
    connectivity: "Excellent 5G. Free WiFi at airport, SEPTA stations downtown, most cafes. Stadium WiFi at Lincoln Financial Field.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Center City Philadelphia to Lincoln Financial Field?", answer: "Take the SEPTA Broad Street Line south from City Hall to NRG Station - 25-30 min, $2.50. The stadium is a 10-min walk from there. Rideshare is $20-35 (15-25 min depending on traffic). Driving with parking is $40-60." },
      { question: "Is Philadelphia safe for World Cup visitors?", answer: "Center City, Old City, Rittenhouse, University City, and the historic district are safe. The South Philly stadium complex is safe on match days with heavy police presence. Kensington (a notorious open-drug-market area) is far from any tourist area - avoid it entirely." },
      { question: "What's the must-eat food in Philadelphia for World Cup visitors?", answer: "Cheesesteak from Pat's, Geno's, John's Roast Pork, or Jim's. Roast pork sandwich from Tommy DiNic's at Reading Terminal Market. Soft pretzels from Center City Pretzel Co. Italian Market for hoagies. Reading Terminal Market is the one-stop tour of Philly food." },
      { question: "Where is the FIFA Fan Festival in Philadelphia?", answer: "Independence Mall - directly in front of Independence Hall and the Liberty Bell - is the expected primary FIFA Fan Festival site. Penn's Landing (the waterfront) and LOVE Park may host secondary viewing locations." },
      { question: "How early should I arrive at Lincoln Financial Field for a World Cup match?", answer: "Arrive 90-120 min before kickoff. SEPTA Broad Street Line gets crushed 60 min pre-match. Security lines for World Cup matches will be longer than NFL/MLS. Gates typically open 90 min before kickoff." },
    ],
  },

  // ── KANSAS CITY ──────────────────────────────────────────────────────────
  {
    slug: "kansas-city",
    airports: [
      { code: "MCI", name: "Kansas City International", distanceToStadium: "30 km / 25-45 min", routeToStadium: "No direct transit. Rideshare $35-55, or rent a car. The new MCI terminal (opened 2023) is excellent." },
    ],
    hotelTiers: {
      budget: { area: "Independence / Overland Park / KCK", nightlyUSD: "$110-180", why: "Suburban hotels with parking. Need a car or rideshare to get to attractions and the stadium." },
      mid: { area: "Power & Light District / Crossroads / Westport", nightlyUSD: "$180-300", why: "Best nightlife, food, and walkability. 15-25 min Uber to Arrowhead." },
      luxury: { area: "Country Club Plaza / Crossroads (21c, Crossroads Hotel)", nightlyUSD: "$280-500", why: "Country Club Plaza is the upscale shopping and dining district. The Raphael and InterContinental anchor it." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at the National WWI Museum and Memorial grounds (Liberty Memorial) - a uniquely scenic site overlooking downtown. Power & Light District also hosts viewing parties.",
      locations: ["National WWI Museum grounds (Liberty Memorial) - expected primary site", "Power & Light District (downtown)", "Country Club Plaza"],
    },
    whereToWatchOtherGames: [
      "The Other Place - Westport, classic sports bar with football coverage",
      "Tannin Wine Bar - Crossroads, multiple screens, sophisticated crowd",
      "Llywelyn's Pub - Crossroads, Welsh pub with football tradition",
      "Power & Light District - multiple bars, all show World Cup matches",
    ],
    safetyNotes: "Plaza, Crossroads, Westport, and Power & Light are safe. Independence and the eastside have higher crime rates - stay in tourist zones or take rideshare. Don't walk between distant areas - KC is car-oriented.",
    neighborhoodsToAvoid: ["East Side (east of Troost) at night", "Independence Ave east of downtown at night"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink; 15-20% rideshare; BBQ counter staff $2-5 in the tip jar.", cardAccepted: "Cards everywhere. Carry $20-30 cash for BBQ joints.", taxNotes: "Missouri sales tax 4.225%, Kansas City adds local for ~8.85% total. Hotel taxes are reasonable." },
    language: { primary: "English", phrases: [] },
    packingList: ["Light, breathable clothing - June 70-90°F (21-32°C), humid", "Light jacket for over-AC restaurants and stadium", "Sunscreen + sunglasses", "Comfortable walking shoes", "Stadium clear bag for Arrowhead", "Refillable water bottle"],
    connectivity: "Good 5G across all major carriers. Free WiFi at MCI airport, hotels, and most cafes. Free downtown WiFi in Power & Light District.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from downtown Kansas City to Arrowhead Stadium?", answer: "Arrowhead is 15 km east of downtown. Rideshare ($20-35, 15-25 min), driving with paid parking ($30-50), or pre-booked match-day shuttle from major hotels. There's no rail option. Plan extra time on match days - traffic is severe." },
      { question: "Is Kansas City safe for World Cup visitors?", answer: "The tourist zones (Plaza, Crossroads, Westport, Power & Light District, downtown) are safe day and night. Other areas - especially the East Side - have higher crime. Stick to rideshare for cross-city travel and you'll be fine." },
      { question: "What's the famous food in Kansas City?", answer: "BBQ - especially burnt ends, ribs, and brisket. Joe's Kansas City BBQ (originally Oklahoma Joe's), Jack Stack, Q39, Gates BBQ, and Arthur Bryant's are the legends. Each has a distinct sauce style. Try multiple if you can." },
      { question: "Where is the FIFA Fan Festival in Kansas City?", answer: "The National WWI Museum and Memorial (Liberty Memorial) grounds are expected to host the primary FIFA Fan Festival - a striking elevated site overlooking downtown KC. Power & Light District will likely host secondary viewing parties." },
      { question: "Do I need a car in Kansas City?", answer: "It helps. KC is spread out and has limited public transit. The downtown core is walkable but anything outside it requires rideshare or a car. If you're staying downtown and only doing 1-2 trips to Arrowhead, rideshare is fine. If you're exploring widely, rent a car." },
    ],
  },

  // ── ATLANTA ──────────────────────────────────────────────────────────────
  {
    slug: "atlanta",
    airports: [
      { code: "ATL", name: "Hartsfield-Jackson Atlanta International", distanceToStadium: "15 km / 20-35 min", routeToStadium: "MARTA Red/Gold Line directly to GWCC/CNN Center station - 20 min, $2.50, no transfers. Mercedes-Benz Stadium is a 5-min walk from the station." },
    ],
    hotelTiers: {
      budget: { area: "Midtown / Decatur / Near MARTA", nightlyUSD: "$130-220", why: "MARTA access keeps you mobile. Decatur is a charming small downtown with good food." },
      mid: { area: "Downtown / Midtown / Buckhead", nightlyUSD: "$200-350", why: "Downtown is walking distance to the stadium. Buckhead is the upscale shopping district 15 min north on MARTA." },
      luxury: { area: "Buckhead (St. Regis, Mandarin, Four Seasons Midtown)", nightlyUSD: "$400-1200+", why: "Atlanta luxury concentrated in Buckhead. Concierge can arrange everything including limo to stadium." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Centennial Olympic Park - directly between Mercedes-Benz Stadium and downtown attractions like Coca-Cola World, Aquarium, and CNN Center. Likely to be the most central US fan zone.",
      locations: ["Centennial Olympic Park - expected primary fan festival (highly likely)", "Piedmont Park (Midtown)", "Atlantic Station plaza"],
    },
    whereToWatchOtherGames: [
      "Brewhouse Cafe - Little Five Points, dedicated football pub",
      "Fado Irish Pub - Buckhead, full football coverage",
      "Hudson Grille - multiple Atlanta locations, big screens",
      "The Marlay House - Decatur, popular Atlanta United supporter spot",
    ],
    safetyNotes: "Tourist areas (Downtown, Midtown, Buckhead, Decatur, Inman Park, Old Fourth Ward) are safe. Avoid the area south of the stadium and English Ave at night. Atlanta drivers are aggressive - look both ways carefully when crossing.",
    neighborhoodsToAvoid: ["English Ave / Vine City at night", "parts of Bankhead"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink; 15-20% rideshare. Strip clubs (a Atlanta institution if that's your scene) expect heavy tipping.", cardAccepted: "Cards/Apple Pay everywhere. Carry some cash for soul food spots and quick-service places.", taxNotes: "Georgia sales tax 4%, Atlanta adds for ~8.9% total. Restaurant prices on menu - bill ~30% above with tax + tip." },
    language: { primary: "English", phrases: [] },
    packingList: ["Light, breathable clothing - June 75-90°F (24-32°C), humid", "Light layer for AC", "Compact umbrella - afternoon thunderstorms common", "Sunscreen + hat", "Comfortable walking shoes", "Stadium clear bag for Mercedes-Benz Stadium"],
    connectivity: "Excellent 5G. Free WiFi on MARTA platforms, in airport, hotels, most cafes.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Atlanta airport to Mercedes-Benz Stadium?", answer: "Take MARTA Red or Gold Line directly from the airport to GWCC/CNN Center station - 20 minutes, $2.50, no transfers. The stadium is a 5-minute walk. This is one of the easiest airport-to-stadium transits in the World Cup." },
      { question: "Is downtown Atlanta safe for World Cup visitors?", answer: "Downtown around the stadium and Centennial Olympic Park is safe day and night, especially during the World Cup with heightened security. Avoid wandering far west of the stadium into English Ave/Vine City. Midtown and Buckhead are very safe." },
      { question: "What is the best neighborhood to stay in Atlanta for the World Cup?", answer: "Downtown if you want to walk to the stadium. Midtown for nightlife and food. Buckhead for upscale shopping and luxury hotels - it's 15 min on MARTA from the stadium. All three are safe and well-connected." },
      { question: "Where is the FIFA Fan Festival in Atlanta?", answer: "Centennial Olympic Park - the city's central public space adjacent to the stadium - is the expected primary FIFA Fan Festival. It's surrounded by attractions (Coca-Cola World, Georgia Aquarium, CNN Center) making it the most natural fan-zone in any US host city." },
      { question: "How hot is Atlanta during the World Cup?", answer: "Hot and humid - June daytime 80-90°F (27-32°C) with 70-80% humidity. Mercedes-Benz Stadium has a retractable roof and full AC. Outside is uncomfortable - plan indoor activities mid-day and outdoor activities morning/evening." },
    ],
  },

  // ── HOUSTON ──────────────────────────────────────────────────────────────
  {
    slug: "houston",
    airports: [
      { code: "IAH", name: "George Bush Intercontinental", distanceToStadium: "40 km / 35-60 min", routeToStadium: "Most international flights. Rideshare $35-65, or METRO bus + rail (1.5 hours)." },
      { code: "HOU", name: "William P. Hobby", distanceToStadium: "20 km / 25-40 min", routeToStadium: "Closer to NRG. Mostly Southwest Airlines. Rideshare $25-45." },
    ],
    hotelTiers: {
      budget: { area: "Galleria / Med Center / Westchase", nightlyUSD: "$110-180", why: "Suburban hotels with parking. Med Center area is closest to NRG Stadium." },
      mid: { area: "Downtown / Midtown / Montrose", nightlyUSD: "$180-300", why: "Best food, art, and nightlife. METRORail connects to NRG Stadium directly." },
      luxury: { area: "River Oaks / Galleria (Post Oak Hotel) / Downtown (Four Seasons)", nightlyUSD: "$350-1000+", why: "Texas-sized luxury (Post Oak Hotel, Four Seasons). Concierge arranges Uber Black to NRG." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Discovery Green (downtown park near the convention center). NRG Park itself will host pre-match activities. Hermann Park is a backup option.",
      locations: ["Discovery Green (downtown) - expected primary fan festival", "NRG Park plaza", "Hermann Park"],
    },
    whereToWatchOtherGames: [
      "Pitch 25 - East End, dedicated football pub with all leagues shown",
      "Local Foods - multiple locations, gastropub showing key matches",
      "Truck Yard - downtown, outdoor venue with screens",
      "Brewlando - Heights, popular sports bar",
    ],
    safetyNotes: "Tourist areas (Downtown, Midtown, Montrose, Heights, Galleria, Med Center) are safe. Stick to rideshare for cross-city travel - Houston is enormous and not pedestrian-oriented. Some east-side areas are best avoided at night.",
    neighborhoodsToAvoid: ["parts of east downtown at night", "Sunnyside"],
    currency: { code: "USD", symbol: "$", tippingNorm: "18-20% at restaurants; $1-2 per drink; 15-20% rideshare. Tex-Mex spots expect 18-20%.", cardAccepted: "Cards/Apple Pay everywhere. Carry $20-30 cash for food trucks and small Tex-Mex spots.", taxNotes: "Texas sales tax 8.25%. No state income tax. Restaurant prices on menu - bill ~30% above with tax + tip." },
    language: { primary: "English (Spanish very widely spoken)", phrases: [{ phrase: "Hola, gracias", meaning: "Hello, thank you" }, { phrase: "La cuenta, por favor", meaning: "The check, please" }] },
    packingList: ["Lightweight, breathable clothing - June 80-95°F (27-35°C), extremely humid", "Light layer for over-AC restaurants", "Compact umbrella - afternoon thunderstorms common", "Sunscreen SPF 50+", "Sunglasses + hat", "Comfortable walking shoes", "Stadium clear bag for NRG Stadium", "Refillable water bottle - hydrate constantly"],
    connectivity: "Excellent 5G. Free WiFi at airports, METRORail, hotels, most cafes.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from downtown Houston to NRG Stadium?", answer: "Take METRORail Red Line from downtown south to Stadium Park station, 20 min, $1.25. The stadium is a 10-min walk. Rideshare is $20-35 (15-25 min), driving with parking $30-60. METRORail is the cheapest and most reliable option on match days." },
      { question: "How hot is Houston during the World Cup?", answer: "Houston in June and July is brutal - 90-95°F (32-35°C) with 80-90% humidity. NRG Stadium has a retractable roof and full AC. Outside, plan indoor activities midday. Hydrate aggressively, wear sun protection, and don't underestimate how draining the heat is." },
      { question: "Is Houston walkable for World Cup visitors?", answer: "Not really - Houston is enormous and built for cars. Downtown core is walkable, as are Midtown, Heights, and Montrose individually. Crossing between them requires rideshare. METRORail covers downtown to NRG Stadium. Plan rideshare/car for everything else." },
      { question: "What is the must-try food in Houston?", answer: "Tex-Mex (The Original Ninfa's, El Tiempo), Vietnamese (Pho Binh, Mai's), barbecue (Truth BBQ, Killen's), and crawfish in season. Houston is one of the most diverse food cities in the US - try the various ethnic enclaves (Little India on Hillcroft, Chinatown west of downtown)." },
      { question: "Where is the FIFA Fan Festival in Houston?", answer: "Discovery Green - the downtown public park next to the convention center - is the expected primary FIFA Fan Festival. It's central, has plenty of space for big screens, and is surrounded by hotels and restaurants." },
    ],
  },

  // ── MEXICO CITY ──────────────────────────────────────────────────────────
  {
    slug: "mexico-city",
    airports: [
      { code: "MEX", name: "Benito Juárez International", distanceToStadium: "20 km / 30-60 min", routeToStadium: "Main international airport. Authorized airport taxi to Estadio Azteca area MX$300-500 (~$15-25 USD), or Metro Line 5 + Line 2 (1+ hour). Avoid unmarked taxis." },
      { code: "AIFA", name: "Felipe Ángeles International", distanceToStadium: "65 km / 60-120 min", routeToStadium: "Newer northern airport. Suburban train + Metro is possible but long. Rideshare $35-65 USD." },
      { code: "TLC", name: "Toluca International", distanceToStadium: "75 km / 70-100 min", routeToStadium: "Smaller airport. Bus or rideshare." },
    ],
    hotelTiers: {
      budget: { area: "Coyoacán / Roma Sur / Del Valle", nightlyUSD: "$60-110", why: "Authentic neighborhoods with great food and culture. Coyoacán is the closest budget area to Estadio Azteca." },
      mid: { area: "Roma Norte / Condesa / Polanco", nightlyUSD: "$120-220", why: "The hippest neighborhoods. Best food and nightlife. Metro/Uber to the stadium 30-50 min." },
      luxury: { area: "Polanco (Four Seasons, St. Regis) / Reforma (Camino Real, Sofitel)", nightlyUSD: "$280-700+", why: "Polanco is Mexico City's Beverly Hills. Four Seasons, St. Regis, Las Alcobas. World-class hotels at half NYC prices." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at the Zócalo (Mexico City's massive central plaza) - one of the largest urban squares in the world. Capable of holding hundreds of thousands. Mexico City hosts the Opening Match so this site will be massive on June 11.",
      locations: ["Zócalo (Plaza de la Constitución) - expected primary fan festival", "Monumento a la Revolución plaza", "Reforma + Ángel de la Independencia avenue"],
    },
    whereToWatchOtherGames: [
      "Pinche Gringo BBQ - Narvarte, English-speaking and football-friendly",
      "La Botica - Roma Norte, mezcalería with screens",
      "El Centenario - Condesa, classic cantina with World Cup atmosphere",
      "Salón Tenampa - Plaza Garibaldi, mariachi venue with screens for Mexico matches (intense atmosphere)",
    ],
    safetyNotes: "Tourist areas (Roma, Condesa, Polanco, Coyoacán, Centro Histórico, San Ángel) are safe day and night. Avoid Tepito and Iztapalapa unless you have local guide. Use Uber/DiDi instead of street taxis. Petty theft on the Metro is common - keep phone secure. Don't flash expensive watches/jewelry.",
    neighborhoodsToAvoid: ["Tepito", "parts of Iztapalapa", "Doctores at night", "Buenos Aires"],
    currency: { code: "MXN", symbol: "$ (peso)", tippingNorm: "10-15% at restaurants (sometimes added as servicio); 10 pesos per drink at bars; 10-20 pesos for rideshare; 5-10 pesos to gas station attendants and bag-pack at supermarkets. Round up taxis.", cardAccepted: "Cards accepted at most restaurants, hotels, malls. Many small shops, taquerías, and street stalls are cash-only. Carry 500-1000 pesos in cash. ATMs in bank lobbies are safest.", taxNotes: "IVA (sales tax) 16% included in displayed prices. Restaurants sometimes add 'propina sugerida' 10-15% - check if it's already on the bill before tipping again." },
    language: { primary: "Spanish", phrases: [{ phrase: "Hola, ¿cómo está?", meaning: "Hello, how are you?" }, { phrase: "Por favor / Gracias", meaning: "Please / Thank you" }, { phrase: "¿Cuánto cuesta?", meaning: "How much does it cost?" }, { phrase: "La cuenta, por favor", meaning: "The check, please" }, { phrase: "¿Habla inglés?", meaning: "Do you speak English?" }, { phrase: "¿Dónde está el baño?", meaning: "Where is the bathroom?" }, { phrase: "¡Salud!", meaning: "Cheers!" }] },
    packingList: ["Layers - June daytime 70-78°F (21-26°C), evenings cool to 55°F (13°C)", "Rain jacket - daily afternoon thunderstorms (rainy season)", "Comfortable walking shoes", "Sunscreen (high altitude UV - 7,350 ft / 2,240 m)", "Allergy meds if you're sensitive (high pollution days)", "Stadium clear bag for Estadio Azteca"],
    connectivity: "Telcel and AT&T have best coverage. Buy a Telcel SIM at the airport or Oxxo (~$10 for 7 days unlimited). Free WiFi in most hotels, cafes, malls. Metro stations have varying signal.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Mexico City airport (MEX) to Estadio Azteca?", answer: "Take an authorized airport taxi (booked at the kiosk inside the terminal) for MX$300-500 / $15-25 USD - safest option for tourists. Or Metro Line 5 to La Raza, transfer to Line 2 to Tasqueña, then Tren Ligero to Estadio Azteca - cheap (~$1) but takes 60-90 min with luggage." },
      { question: "Is Mexico City safe for World Cup visitors?", answer: "The major tourist neighborhoods (Roma, Condesa, Polanco, Coyoacán, Centro Histórico) are safe day and night. Use Uber or DiDi instead of street taxis. Don't display expensive items. Be alert in crowds and on the Metro. Avoid Tepito and Iztapalapa unless with a guide." },
      { question: "What is the altitude in Mexico City and will it affect me?", answer: "Mexico City sits at 7,350 ft (2,240 m). Many visitors experience mild altitude effects - headache, shortness of breath, faster fatigue - for the first 2-3 days. Hydrate aggressively, avoid heavy alcohol on arrival, and don't push hard physical activity for the first day. Players will feel it during matches." },
      { question: "Can I drink the tap water in Mexico City?", answer: "No - drink bottled or filtered water. Most restaurants serve filtered water (agua purificada). Brush your teeth with bottled water if you're sensitive. Most hotels provide free bottled water in rooms. Ice in good restaurants is made from filtered water and is safe." },
      { question: "How much should I tip in Mexico City?", answer: "10-15% at restaurants (more if service is excellent). Often a 'propina sugerida' is added to the bill - check before tipping again. 10 pesos to bartenders per drink. 5-10 pesos to gas station attendants and supermarket baggers. Uber tips are optional but appreciated." },
      { question: "Where is the World Cup Opening Match?", answer: "The 2026 FIFA World Cup Opening Match is at Estadio Azteca in Mexico City on June 11, 2026 - host nation Mexico vs South Africa. Azteca is the only stadium to have hosted three World Cups (1970, 1986, 2026)." },
    ],
  },

  // ── GUADALAJARA ──────────────────────────────────────────────────────────
  {
    slug: "guadalajara",
    airports: [
      { code: "GDL", name: "Miguel Hidalgo International", distanceToStadium: "30 km / 30-50 min", routeToStadium: "Authorized airport taxi MX$400-600. No direct transit. Rideshare (Uber/DiDi) $15-25 USD." },
    ],
    hotelTiers: {
      budget: { area: "Centro Histórico / Tlaquepaque", nightlyUSD: "$50-100", why: "Authentic Mexican experience. Tlaquepaque is the artisan suburb with great food and walkability." },
      mid: { area: "Providencia / Lafayette / Americana", nightlyUSD: "$100-180", why: "Hip neighborhoods with the best new restaurants and coffee scene. Easy Uber to stadium." },
      luxury: { area: "Andares (Hyatt Regency, Riu Plaza Guadalajara) / Demetria Hotel (Italia)", nightlyUSD: "$220-450", why: "Andares is the upscale northern district with luxury hotels, mall, and dining. Demetria is a boutique luxury option in the city." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Plaza de la Liberación or the Zona Minerva (Glorieta Minerva) - both central gathering spots. Tlaquepaque main plaza will likely host secondary viewings.",
      locations: ["Plaza de la Liberación (Centro Histórico) - expected primary site", "Glorieta Minerva (Zona Minerva)", "Plaza Tapatía"],
    },
    whereToWatchOtherGames: [
      "Karne Garibaldi - cantina with TV, in Santa Tere",
      "La Tequila - upscale Mexican restaurant chain with screens",
      "El Buho - Lafayette, gastropub with multiple screens",
      "La Mutualista - Centro, classic local bar",
    ],
    safetyNotes: "Tourist areas (Centro Histórico, Lafayette, Providencia, Americana, Tlaquepaque) are safe day and night. Use Uber/DiDi rather than street taxis. Don't venture into peripheral neighborhoods at night. Watch your belongings in crowds.",
    neighborhoodsToAvoid: ["peripheral colonias (San Juan de Dios at night, parts of the eastern outskirts)"],
    currency: { code: "MXN", symbol: "$ (peso)", tippingNorm: "10-15% at restaurants; 10 pesos per drink; round up Uber.", cardAccepted: "Cards in restaurants, malls, hotels. Cash for street food, mercados, taxis. Carry 500-1000 pesos.", taxNotes: "IVA 16% included in prices. Restaurant tips often suggested on bill - check before adding extra." },
    language: { primary: "Spanish", phrases: [{ phrase: "Hola, ¿cómo está?", meaning: "Hello, how are you?" }, { phrase: "Por favor / Gracias", meaning: "Please / Thank you" }, { phrase: "¿Cuánto cuesta?", meaning: "How much does it cost?" }, { phrase: "La cuenta, por favor", meaning: "The check, please" }, { phrase: "Una cerveza / un mezcal", meaning: "A beer / a mezcal" }] },
    packingList: ["Light layers - June 65-85°F (18-29°C), some humidity", "Rain jacket - rainy season starts in June", "Comfortable walking shoes (Centro Histórico is walkable)", "Sunscreen (5,100 ft elevation increases UV)", "Sunglasses + hat", "Stadium clear bag for Estadio Akron"],
    connectivity: "Telcel best coverage. Buy SIM at Oxxo (~$10/week unlimited). Free WiFi in hotels, cafes, malls.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Guadalajara airport to Estadio Akron?", answer: "Estadio Akron is in Zapopan, north of central Guadalajara. From the airport (south of the city), take an authorized airport taxi (MX$400-600) or Uber ($15-25 USD) - 40-60 min depending on traffic. No direct public transit. Plan extra time on match days." },
      { question: "Is Guadalajara safe for World Cup visitors?", answer: "The tourist areas - Centro Histórico, Lafayette, Providencia, Americana, Tlaquepaque - are safe day and night. Use Uber or DiDi rather than street taxis. Don't venture into peripheral neighborhoods at night. Standard urban precautions apply." },
      { question: "What's the best food in Guadalajara?", answer: "Birria - the city's signature dish, especially birria de res tacos with consommé for dipping. Try Birrieria las 9 Esquinas or Birrieria El Sope. Also tortas ahogadas (sandwiches drowned in tomato salsa) at El Famoso Tortas Toño. Karne Garibaldi for carne en su jugo." },
      { question: "Should I visit Tequila town from Guadalajara?", answer: "Yes - it's a 60-min drive west and a fantastic day trip. The Jose Cuervo distillery and the Tequila Express train (premium ticketed experience) are popular. Plan a day around it before or after a match. Book ahead during the World Cup." },
      { question: "Where is Estadio Akron and what's it like?", answer: "Estadio Akron is in Zapopan, just north of central Guadalajara. Capacity ~46,000, opened 2010. It's home to Chivas (Club Deportivo Guadalajara). Modern facilities, good sightlines, but transit options are limited - plan for Uber on match days." },
    ],
  },

  // ── MONTERREY ────────────────────────────────────────────────────────────
  {
    slug: "monterrey",
    airports: [
      { code: "MTY", name: "General Mariano Escobedo International", distanceToStadium: "30 km / 35-55 min", routeToStadium: "Authorized airport taxi MX$500-700, or Uber/DiDi $20-30 USD. No direct transit." },
    ],
    hotelTiers: {
      budget: { area: "Centro / Barrio Antiguo", nightlyUSD: "$60-110", why: "Centro is the historic heart with cheaper hotels. Barrio Antiguo has the best nightlife and bohemian feel." },
      mid: { area: "San Pedro Garza García / Valle Oriente", nightlyUSD: "$120-220", why: "San Pedro is the most modern, safest, and most upscale district - widely considered the safest area in Mexico. Closer to Estadio BBVA." },
      luxury: { area: "San Pedro (Quinta Real, Galeria Plaza, Safi Royal Luxury)", nightlyUSD: "$220-450", why: "San Pedro hotels are the closest thing to US-style luxury in northern Mexico. Concierge handles everything." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at the Macroplaza (Centro) or Parque Fundidora (a former steel mill turned park). Both central, both spacious. Activities likely at the stadium plaza on match days too.",
      locations: ["Macroplaza (Centro Histórico) - expected primary site", "Parque Fundidora", "Estadio BBVA plaza"],
    },
    whereToWatchOtherGames: [
      "El Centenario - Centro, classic Mexican cantina with World Cup atmosphere for Mexico matches",
      "La Nacional - Barrio Antiguo, modern cantina",
      "Cervecería Aramberri - Centro, craft beer with screens",
      "BBQ joints in San Pedro - many family restaurants put on the matches",
    ],
    safetyNotes: "San Pedro Garza García is considered the safest municipality in Mexico - very secure. Centro and Barrio Antiguo are safe in tourist hours but quieter at night. Avoid peripheral colonias and the area around the bus station at night. Use Uber/DiDi rather than street taxis.",
    neighborhoodsToAvoid: ["Independencia at night", "peripheral northern colonias"],
    currency: { code: "MXN", symbol: "$ (peso)", tippingNorm: "10-15% at restaurants; 10-20 pesos per drink; round up Uber.", cardAccepted: "Cards widely accepted in San Pedro, Centro restaurants, malls, hotels. Cash for street food and small shops. Carry 500-1000 pesos.", taxNotes: "IVA 16% included. Some upscale restaurants add 12-15% servicio - check bill." },
    language: { primary: "Spanish", phrases: [{ phrase: "Hola, ¿qué tal?", meaning: "Hello, how are you?" }, { phrase: "Gracias / De nada", meaning: "Thank you / You're welcome" }, { phrase: "La cuenta, por favor", meaning: "The check, please" }, { phrase: "Un cabrito / arrachera", meaning: "A goat / skirt steak (local specialties)" }] },
    packingList: ["Lightweight clothing - June 80-100°F (27-38°C), can be very dry", "Light layer for AC", "Sunscreen SPF 50+ - intense sun", "Sunglasses + hat", "Plenty of water", "Stadium clear bag for Estadio BBVA"],
    connectivity: "Telcel and AT&T strong. Buy SIM at airport or Oxxo. Free WiFi at upscale hotels, cafes, malls.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Monterrey airport to Estadio BBVA?", answer: "Estadio BBVA is in Guadalupe, southeast of central Monterrey. From the airport, authorized taxi (MX$500-700) or Uber ($20-30 USD), 35-55 min depending on traffic. No direct rail or bus to the stadium - rideshare is most reliable on match days." },
      { question: "Is Monterrey safe for World Cup visitors?", answer: "San Pedro Garza García - the upscale municipality where most visitors stay - is considered the safest area in all of Mexico. Centro and Barrio Antiguo are safe in tourist hours. Use Uber/DiDi rather than street taxis. Avoid peripheral neighborhoods at night." },
      { question: "What is the best food in Monterrey?", answer: "Cabrito (slow-roasted young goat) is the regional specialty - try El Rey del Cabrito downtown. Arrachera (skirt steak) is everywhere and excellent. Carne asada culture is taken seriously - any neighborhood spot will be good. The food scene is meat-heavy and outstanding." },
      { question: "How hot is Monterrey during the World Cup?", answer: "Hot and dry - June daytime 90-100°F (32-38°C). Estadio BBVA is open-air. Hydrate aggressively, wear sun protection, and plan outdoor activities early morning or evening. The dry heat is more tolerable than humid heat." },
      { question: "Where should I stay in Monterrey?", answer: "San Pedro Garza García for safety, modernity, and upscale dining - it's like a Texan suburb. Centro for the historic feel and cheaper hotels. Barrio Antiguo for nightlife and bohemian atmosphere. San Pedro is closer to the stadium." },
    ],
  },

  // ── TORONTO ──────────────────────────────────────────────────────────────
  {
    slug: "toronto",
    airports: [
      { code: "YYZ", name: "Toronto Pearson International", distanceToStadium: "25 km / 30-50 min", routeToStadium: "Main international airport. UP Express train to Union Station ($12 CAD, 25 min), then 5-min walk to BMO Field. Easiest of any World Cup host city." },
      { code: "YTZ", name: "Billy Bishop Toronto City", distanceToStadium: "5 km / 10-20 min", routeToStadium: "Downtown island airport. Free shuttle to mainland, then 10-min walk or taxi to BMO Field. Closest airport-to-stadium for a major host city." },
    ],
    hotelTiers: {
      budget: { area: "West Queen West / Liberty Village / Kensington", nightlyUSD: "$120-200 (CAD$170-280)", why: "Hip neighborhoods walking distance to BMO Field. Liberty Village especially is right next to the stadium." },
      mid: { area: "Downtown / Entertainment District / Distillery", nightlyUSD: "$200-350 (CAD$280-490)", why: "Walking distance to BMO Field, restaurants, CN Tower, harbourfront. Best mix of access and atmosphere." },
      luxury: { area: "Yorkville (Four Seasons, Hazelton, Park Hyatt) / Downtown (Ritz, Shangri-La)", nightlyUSD: "$400-1500+ (CAD$560-2100+)", why: "Yorkville is Toronto's luxury district with premium hotels and shopping. Concierge arranges everything." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Nathan Phillips Square (in front of Toronto City Hall) and the harbourfront at Harbour Square. Toronto hosts 6 group-stage matches so the fan festival will run extensively in June.",
      locations: ["Nathan Phillips Square - expected primary fan festival", "Harbourfront Centre", "Yonge-Dundas Square big screen"],
    },
    whereToWatchOtherGames: [
      "The Football Factory - downtown, dedicated football pub showing every match",
      "The Madison Avenue Pub - Annex, classic university-area pub",
      "C'est What - downtown, eclectic with multiple screens",
      "Cherry St Bar-B-Que - east end, gastropub with screens",
    ],
    safetyNotes: "Toronto is one of the safest big cities in North America. Tourist areas (downtown, Distillery, Kensington, Annex, Liberty Village, Yorkville) are very safe day and night. The TTC subway is safe. Standard urban precautions apply.",
    neighborhoodsToAvoid: ["parts of Jane and Finch at night - far from any tourist area"],
    currency: { code: "CAD", symbol: "$ (Canadian dollar)", tippingNorm: "15-20% at restaurants; $1 per drink; 15-20% rideshare. Some restaurants now suggest 18-25% on card readers - it's optional.", cardAccepted: "Cards/Apple Pay accepted everywhere including the TTC. Most places accept tap. Carry $20-40 CAD cash for tips and small purchases.", taxNotes: "Ontario HST 13% added to most purchases. Restaurant menu prices don't include tax or tip - bill ~30% above with tax + tip." },
    language: { primary: "English (French is the other official Canadian language but rarely needed in Toronto)", phrases: [] },
    packingList: ["Layers - June 60-78°F (15-26°C), can be cool in evenings", "Light rain jacket", "Comfortable walking shoes", "Stadium clear bag for BMO Field", "Sunglasses", "A nicer outfit for downtown nightlife", "Adapter is not needed for US visitors (same plugs)"],
    connectivity: "Excellent 5G. Most Canadian carriers offer day passes for visiting US plans. Free WiFi at airport, on TTC, in cafes. Roaming from US is often free with major carriers.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Pearson airport to BMO Field?", answer: "Take the UP Express train from Pearson to Union Station - $12 CAD, 25 minutes, runs every 15 minutes. From Union Station, BMO Field is a 5-minute walk or one streetcar stop. This is one of the most efficient airport-to-stadium routes in the World Cup." },
      { question: "Is Toronto safe for World Cup visitors?", answer: "Yes - Toronto is one of the safest large cities in North America. Tourist areas, downtown, the entertainment district, and the harbourfront are very safe day and night. The TTC subway is safe. Standard urban precautions apply." },
      { question: "Do I need Canadian dollars or will US dollars work?", answer: "Use Canadian dollars (CAD). Most places technically accept USD but at a poor exchange rate. Use a credit card with no foreign transaction fees, or withdraw CAD from any major bank ATM. Currency exchange at the airport is the worst rate - avoid." },
      { question: "What's the best neighborhood to stay in Toronto for the World Cup?", answer: "Downtown / Entertainment District for walkability to BMO Field and nightlife. Liberty Village is closer to the stadium and hipper. Yorkville for upscale luxury and shopping. Distillery District for charm and great restaurants. All connected by streetcar/subway." },
      { question: "Where is the FIFA Fan Festival in Toronto?", answer: "Nathan Phillips Square in front of City Hall is the expected primary FIFA Fan Festival site - a large central plaza with the iconic 'Toronto' sign. The harbourfront and Yonge-Dundas Square will likely host secondary big-screen viewings." },
    ],
  },

  // ── VANCOUVER ────────────────────────────────────────────────────────────
  {
    slug: "vancouver",
    airports: [
      { code: "YVR", name: "Vancouver International", distanceToStadium: "15 km / 25-40 min", routeToStadium: "Take the Canada Line (SkyTrain) from YVR directly to Stadium-Chinatown station - $9.50 CAD, 25 min, no transfers. BC Place is a 5-min walk." },
    ],
    hotelTiers: {
      budget: { area: "Mount Pleasant / Commercial Drive / East Vancouver", nightlyUSD: "$130-220 (CAD$180-310)", why: "Authentic neighborhoods with great food. SkyTrain access keeps you mobile." },
      mid: { area: "Downtown / Yaletown / Gastown", nightlyUSD: "$220-380 (CAD$310-530)", why: "Walking distance to BC Place, harbourfront, Stanley Park access. Best food and nightlife." },
      luxury: { area: "Coal Harbour (Pan Pacific, Fairmont Pacific Rim) / Downtown (Shangri-La, Rosewood Hotel Georgia)", nightlyUSD: "$450-1200+ (CAD$630-1700+)", why: "Vancouver luxury with stunning harbour views. Pan Pacific has a famous sail-shaped roof; Pacific Rim is sleek modern." },
    },
    fanZones: {
      summary: "FIFA Fan Festival expected at Jack Poole Plaza (next to the Vancouver Convention Centre and the Olympic Cauldron) - waterfront with stunning North Shore Mountain views. Robson Square may host secondary viewings.",
      locations: ["Jack Poole Plaza - expected primary fan festival", "Robson Square (downtown)", "Granville Island Public Market"],
    },
    whereToWatchOtherGames: [
      "The Pint Public House - Yaletown, dedicated football pub",
      "The Library Square Public House - downtown, multiple screens",
      "Doolin's Irish Pub - downtown, traditional pub with all matches",
      "The Roxy - Granville, lively venue with screens",
    ],
    safetyNotes: "Downtown, Yaletown, Gastown, Coal Harbour, Kitsilano, and the West End are all very safe. The Downtown Eastside (centered on Hastings and Main) has serious open-drug-use and homelessness issues - avoid it day or night. Otherwise Vancouver is among the safest cities in North America.",
    neighborhoodsToAvoid: ["Downtown Eastside (Hastings/Main area) entirely"],
    currency: { code: "CAD", symbol: "$ (Canadian dollar)", tippingNorm: "15-20% at restaurants; $1 per drink; 15-20% rideshare. Card prompts often suggest 18-25% - optional.", cardAccepted: "Cards/Apple Pay accepted everywhere including SkyTrain (use Compass card or contactless). Carry $20-40 CAD cash.", taxNotes: "BC has 7% PST + 5% GST = 12% total on most purchases. Restaurants add it to your bill at the till. Bills end up ~30% above menu prices after tax + tip." },
    language: { primary: "English", phrases: [] },
    packingList: ["Layers - June 55-72°F (13-22°C), often cool and damp", "Waterproof jacket - it can rain even in summer", "Comfortable walking shoes (waterproof if possible)", "Sunglasses (sun is bright when it appears)", "Light warm layer for evenings", "Stadium clear bag for BC Place"],
    connectivity: "Excellent 5G. Canadian SIM available at YVR, or US carriers often offer day passes. Free WiFi at airport, SkyTrain stations, most cafes.",
    emergencyNumber: "911",
    faqs: [
      { question: "How do I get from Vancouver airport (YVR) to BC Place?", answer: "Take the Canada Line (SkyTrain) from YVR directly to Stadium-Chinatown station - $9.50 CAD, 25 minutes, no transfers. BC Place is a 5-minute walk from the station. This is one of the most efficient airport-to-stadium transit routes in the entire World Cup." },
      { question: "Is Vancouver safe for World Cup visitors?", answer: "Vancouver is one of the safest big cities in North America. Downtown, Yaletown, Gastown, Coal Harbour, Kitsilano, the West End - all very safe. The Downtown Eastside (around Hastings and Main) has visible homelessness and drug crisis - avoid that specific area." },
      { question: "What should I do in Vancouver when there's no match?", answer: "Stanley Park - one of the world's great urban parks, walk or rent a bike for the 10 km seawall loop. Grouse Mountain (gondola up for views and hiking). Granville Island Public Market. Kitsilano Beach. Day trip to Whistler (90 min) or Victoria (ferry). Capilano Suspension Bridge." },
      { question: "What's the weather like in Vancouver in June?", answer: "Cool and often damp - 55-72°F (13-22°C). Rain is possible even in summer though June is one of the drier months. Pack a waterproof jacket and layers. Evenings can be chilly. The mountains backdrop and ocean views make it stunning regardless of weather." },
      { question: "Where is the FIFA Fan Festival in Vancouver?", answer: "Jack Poole Plaza - next to the Vancouver Convention Centre and the Olympic Cauldron, on the harbourfront with North Shore Mountain views - is the expected primary FIFA Fan Festival. Robson Square downtown is the likely secondary site for big-screen viewings." },
    ],
  },
]

export function getCityGuideBySlug(slug: string): CityGuide | undefined {
  return cityGuides.find((g) => g.slug === slug)
}
