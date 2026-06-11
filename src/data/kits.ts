// Kit data for the /kits ranking page. Mirrors the Daily Mail format:
// each team has Home + Away kits, each kit has Front + Back images, each
// kit gets thumbs-up / thumbs-down voting.
//
// Image source: hand-downloaded once from Daily Mail's CDN by
// scripts/fetch-kit-images.mjs and stored in public/images/kits/.
// File naming convention: <slug>-<home|away>-<front|back>.jpg
//
// Vote ID convention: <iso3>_<home|away>  (e.g. "ARG_home", "USA_away")
// This matches the format the backend stores in public/api/votes.json.

import { teams } from "./teams"

export type Kit = {
  /** Team name as it appears in src/data/teams.ts (must match exactly) */
  team: string
  /** Daily Mail uses this exact spelling in image URLs; preserved for the fetch script */
  dailyMailName: string
  /** 3-letter ISO code, used as the vote-id prefix */
  iso3: string
  /** Group letter (A through L) */
  group: string
  /** Editorial blurb. Empty string = render a generic placeholder. */
  blurb: string
  /** Awin merchant ID for the "Buy Home" button. Empty = placeholder Amazon search. */
  buyHomeMid?: string
  /** Awin merchant ID for the "Buy Away" button. Empty = placeholder Amazon search. */
  buyAwayMid?: string
}

// Sarcastic-British tabloid voice. Mirror the Daily Mail format: 2-3 sentences,
// one observation about the home kit, one about the away kit, often a quip.
// Empty blurb = page renders "Review coming soon" placeholder.
export const kits: Kit[] = [
  // GROUP A
  { team: "Mexico",                  dailyMailName: "Mexico",                  iso3: "MEX", group: "A", blurb: "El Tri lean hard on tradition with a deep green home kit and the eagle crest done in subtle gold. The away strip flips to white with a serpent motif running down the sleeves. Solid, if not exactly daring for a host nation." },
  { team: "South Korea",             dailyMailName: "South Korea",             iso3: "KOR", group: "A", blurb: "Taeguk Warriors stick to the classic red home with a subtle taegeuk-inspired pattern across the chest. Away is a clean white with red and blue accents on the sleeves. Nike playing it safe but it lands." },
  { team: "South Africa",            dailyMailName: "South Africa",            iso3: "RSA", group: "A", blurb: "Bafana Bafana home is the traditional yellow with green trim, instantly recognisable. The away is a deeper navy with the protea flower picked out subtly. Le Coq Sportif doing inoffensive work." },
  { team: "Czech Republic",          dailyMailName: "Czechia",                 iso3: "CZE", group: "A", blurb: "Národní Tým's home is the unmistakable red and white that's been their look for decades. The away is a navy with a subtle Bohemian glass pattern, which sounds twee but actually lands. adidas have done worse." },

  // GROUP B
  { team: "Canada",                  dailyMailName: "Canada",                  iso3: "CAN", group: "B", blurb: "Hosts Canada keep it brand-consistent with a clean red home shirt and a thin maple-leaf detail at the neck. The white away is more interesting, with the leaf veins picked out in a tonal print. Looks like something Davies will actually want to wear." },
  { team: "Switzerland",             dailyMailName: "Switzerland",             iso3: "SUI", group: "B", blurb: "Die Nati go with a bold red home and clean white cross, no surprises there. The away is the controversial one, Puma went with a soft pink that's drawn mixed responses. Bold move for a team that does not do bold." },
  { team: "Qatar",                   dailyMailName: "Qatar",                   iso3: "QAT", group: "B", blurb: "Maroon home with subtle Arabic calligraphy on the inside collar. The away is white with a deep maroon panel that looks better in motion than still. Restrained, very Qatar." },
  { team: "Bosnia and Herzegovina",  dailyMailName: "Bosnia and Herzegovina",  iso3: "BIH", group: "B", blurb: "Zmajevi keep the classic blue home with the yellow chevron that nods to the flag. Away is white with the same chevron in blue. adidas being adidas, no risks taken, none lost." },

  // GROUP C
  { team: "Brazil",                  dailyMailName: "Brazil",                  iso3: "BRA", group: "C", blurb: "The canary yellow home shirt is back to basics after a few cycles of busy designs. Just yellow, green collar, the CBF badge, and nothing trying too hard. The away is darker blue than usual with a subtle starfield pattern. Both work because Brazil's kits work when they get out of their own way." },
  { team: "Morocco",                 dailyMailName: "Morocco",                 iso3: "MAR", group: "C", blurb: "Atlas Lions home is the classic deep red with green accents that nods to the flag. The away is white with a Zellige tile pattern across the body, actually one of the standout designs of the tournament. Puma know what they're doing here." },
  { team: "Scotland",                dailyMailName: "Scotland",                iso3: "SCO", group: "C", blurb: "Tartan Army home is the rich navy with a subtle tartan jacquard print, very on brand. Away is a clean white with a small thistle on the chest. adidas have given Scotland a kit that finally looks like the country they represent." },
  { team: "Haiti",                   dailyMailName: "Haiti",                   iso3: "HAI", group: "C", blurb: "Haiti's first World Cup kit in 50 years is a confident blue home with red trim. The away is white with a deep blue panel across the chest. Caribbean colors done with restraint, which is half the battle." },

  // GROUP D
  { team: "United States",           dailyMailName: "USA",                     iso3: "USA", group: "D", blurb: "USMNT go with a clean white home featuring red and blue stripes on the sleeves, very mid-90s in a good way. The away is the more interesting one, a denim-effect blue with the wordmark across the chest. The kit nerds will fight about whether the denim move is genius or gimmick for the next six months." },
  { team: "Australia",               dailyMailName: "Australia",               iso3: "AUS", group: "D", blurb: "Socceroos home is the unmistakable yellow-and-green, picked out with a wave-pattern across the chest that nods to the coast. The away is the more distinctive one, dark green fading into coral, allegedly inspired by Aussie sunrises. Bold for a team historically averse to bold." },
  { team: "Paraguay",                dailyMailName: "Paraguay",                iso3: "PAR", group: "D", blurb: "La Albirroja home shirt is the classic red and white stripes, no funny business. The away is a clean navy with the puma crest oversized. Knock-off-of-Argentina vibes are unavoidable but they wear it better than they have a right to." },
  { team: "Turkey",                  dailyMailName: "Turkey",                  iso3: "TUR", group: "D", blurb: "Ay-Yıldızlılar home is the iconic red with a white crescent and star, classic Nike Turkey. The away is white with a deep red panel and the crest oversized. Confident, brand-consistent, will sell well in Istanbul." },

  // GROUP E
  { team: "Germany",                 dailyMailName: "Germany",                 iso3: "GER", group: "E", blurb: "Die Mannschaft pull a clever move and reference both their 1990 and 2014 winning shirts in one design, which should be deeply unsettling reading for an England fan. The home is white with the iconic black-red-gold chest stripes. The away is a deep red with subtle geometric print. Quietly one of the best shirts of the tournament." },
  { team: "Ecuador",                 dailyMailName: "Ecuador",                 iso3: "ECU", group: "E", blurb: "La Tri home is the iconic yellow with subtle Andean-pattern detailing on the sleeves. Away is navy with a yellow chevron, actually one of the better South American away kits. Marathon Sports doing more with less than their bigger-budget rivals." },
  { team: "Ivory Coast",             dailyMailName: "Ivory Coast",             iso3: "CIV", group: "E", blurb: "Les Éléphants home is the classic orange with green and white trim, instantly recognisable. The away is white with elephant-pattern detail on the chest, which sounds cheesy but works. Puma occasionally remember they know how to design football kits." },
  { team: "Curaçao",                 dailyMailName: "Curacao",                 iso3: "CUW", group: "E", blurb: "First-time qualifiers and the home kit reflects that energy, bright cobalt blue with yellow accents, very Caribbean. Away is white with subtle wave patterns. They want everyone watching them at this tournament, and they should be." },

  // GROUP F
  { team: "Netherlands",             dailyMailName: "Netherlands",             iso3: "NED", group: "F", blurb: "Oranje's home is the unmistakable bright orange that's been a fixture since the 70s. The away is a deep black with subtle orange piping, which is the most interesting Dutch away in years. Nike finally let them have some fun." },
  { team: "Japan",                   dailyMailName: "Japan",                   iso3: "JPN", group: "F", blurb: "Samurai Blue home is the deep blue with adidas's signature three stripes, plus a subtle wave-pattern jacquard that nods to traditional Japanese art. Away is the cherry-blossom pink that won the 'best football kit of March' vote. Easily one of the prettiest shirts of the tournament." },
  { team: "Tunisia",                 dailyMailName: "Tunisia",                 iso3: "TUN", group: "F", blurb: "Eagles of Carthage home is the classic red with the white eagle picked out on the chest. Away is white with a tonal Carthaginian pattern across the body, easily their best away kit in two decades. Kappa quietly putting in a shift." },
  { team: "Sweden",                  dailyMailName: "Sweden",                  iso3: "SWE", group: "F", blurb: "Blågult home is the perennial yellow with blue trim, a kit you've seen a thousand times. Away is the dark blue with subtle pinstripes and a deeper crest. Standard adidas work, but Sweden in yellow always looks right." },

  // GROUP G
  { team: "Belgium",                 dailyMailName: "Belgium",                 iso3: "BEL", group: "G", blurb: "Rode Duivels home is the deep red with black and gold trim that adidas have leaned on for years. The away is the white one with a busy diamond pattern that's split opinion. Cool or chaotic depending on how generous you're feeling." },
  { team: "Iran",                    dailyMailName: "Iran",                    iso3: "IRN", group: "G", blurb: "Team Melli's home is the white with green and red accents that's been their look forever. The away is a darker green with the lion-and-sun crest oversized. Reliable, traditional, suits a side that does the basics well." },
  { team: "Egypt",                   dailyMailName: "Egypt",                   iso3: "EGY", group: "G", blurb: "Pharaohs home is the deep red with the unmistakable Eye of Horus motif on the inside collar. Away is white with hieroglyph-pattern detail on the sleeves, Puma actually leaning into the brief for once. Salah's farewell kit looks the part." },
  { team: "New Zealand",             dailyMailName: "New Zealand",             iso3: "NZL", group: "G", blurb: "All Whites home is the white that gives them their name, with a subtle silver-fern jacquard on the chest. The away is a deep black with white piping. Nike making sure their first WC since 2010 looks like a real return." },

  // GROUP H
  { team: "Spain",                   dailyMailName: "Spain",                   iso3: "ESP", group: "H", blurb: "La Roja stick to the red home with yellow trim that they've leaned on for two decades, no big swings here. The away is the navy one with the Spanish crest oversized on the front. After winning Euro 2024 they probably figured if it ain't broke, don't break it." },
  { team: "Uruguay",                 dailyMailName: "Uruguay",                 iso3: "URU", group: "H", blurb: "La Celeste's home is THAT pale sky blue with the four-star crest, currently the leading contender for 'best home kit' of the tournament. Away is a deep navy with subtle sun motifs. Puma have absolutely nailed it, even Argentinians grudgingly admit it." },
  { team: "Saudi Arabia",            dailyMailName: "Saudi Arabia",            iso3: "KSA", group: "H", blurb: "Falcons home is the classic green and white with palm tree detail at the neck. Away is white with green trim, basically the home kit inverted. Nike not trying very hard but Saudi Arabia have other things going on." },
  { team: "Cape Verde",              dailyMailName: "Cape Verde",              iso3: "CPV", group: "H", blurb: "Tubarões Azuis make their World Cup debut with a confident blue home shirt featuring the islands picked out in subtle tonal print. Away is white with the same map detail. First WC kit ever and they nailed it, with Macron of all brands." },

  // GROUP I
  { team: "France",                  dailyMailName: "France",                  iso3: "FRA", group: "I", blurb: "Les Bleus's home is the classic dark blue with the cockerel done in subtle gold thread. Standard issue Nike France, you've seen it before. The away is white with a very busy blue print that's somehow both elegant and slightly chaotic, which is appropriate for this French team." },
  { team: "Senegal",                 dailyMailName: "Senegal",                 iso3: "SEN", group: "I", blurb: "Lions of Teranga home is the classic green with the yellow star and red accents. The away is a darker red with subtle Wolof-pattern detailing. Puma giving Senegal a kit worthy of their AFCON-champion status." },
  { team: "Norway",                  dailyMailName: "Norway",                  iso3: "NOR", group: "I", blurb: "Norge home is the deep red with Nike's signature swoosh in white, very 90s in a good way. The away is white with subtle Viking-knot pattern across the chest. Haaland will sell a million of these regardless of how it looks." },
  { team: "Iraq",                    dailyMailName: "Iraq",                    iso3: "IRQ", group: "I", blurb: "Lions of Mesopotamia home is the white kit with green trim and a subtle palm-tree motif. The away is the deep green inverse. First WC in 40 years and adidas have given them something dignified to wear." },

  // GROUP J
  { team: "Argentina",               dailyMailName: "Argentina",               iso3: "ARG", group: "J", blurb: "Argentina have practically copied and pasted last time's home jersey, perhaps Adidas were miffed that Lionel Messi's cloak obscured their badge in the 2022 trophy lift and asked them to try again. Big credit for the swirly away strip though, it looks almost intergalactic." },
  { team: "Austria",                 dailyMailName: "Austria",                 iso3: "AUT", group: "J", blurb: "Das Team's home is the deep red with the bald-eagle crest done in white. Away is white with red trim. Puma keeping it tight and brand-consistent, Austria wear what they're given and play hard regardless." },
  { team: "Algeria",                 dailyMailName: "Algeria",                 iso3: "ALG", group: "J", blurb: "Les Fennecs home is a minimalist white with a thin green crescent across the chest, very on-brand for the federation. Away is a clean green with white trim. Neither shirt is bad but neither is interesting, a missed opportunity for a country with rich visual heritage." },
  { team: "Jordan",                  dailyMailName: "Jordan",                  iso3: "JOR", group: "J", blurb: "Al-Nashama home is the classic red with white trim and the eagle crest oversized. Away is white with subtle desert-pattern detail. First WC kit ever and adidas have done the bare minimum, which for a debut is actually fine." },

  // GROUP K
  { team: "Portugal",                dailyMailName: "Portugal",                iso3: "POR", group: "K", blurb: "Seleção das Quinas home is the deep red with green accents and Nike's flag-inspired chest stripe. Away is the famous green-and-yellow striped one that's a love-it-or-hate-it design. Ronaldo's last WC kit and they made it count." },
  { team: "Colombia",                dailyMailName: "Colombia",                iso3: "COL", group: "K", blurb: "Los Cafeteros home is the iconic yellow with blue and red trim that James Rodríguez wore in 2014. Away is the blue with yellow accents. adidas haven't reinvented anything but Colombia in yellow is always a top-five aesthetic." },
  { team: "Uzbekistan",              dailyMailName: "Uzbekistan",              iso3: "UZB", group: "K", blurb: "First-time World Cup qualifiers and the home kit reflects the moment, a deep blue with off-white detailing and a subtle vertical stripe texture. Away is white with navy and green accents. Local brand 7Saber pulling off a proud debut." },
  { team: "DR Congo",                dailyMailName: "DR Congo",                iso3: "COD", group: "K", blurb: "Léopards home is the deep blue with the red and yellow accents from the flag. Away is the famous yellow with leopard-spot pattern across the body. One of the more visually distinctive kits of the tournament, and that's not a low bar." },

  // GROUP L
  { team: "England",                 dailyMailName: "England",                 iso3: "ENG", group: "L", blurb: "Three Lions go with the traditional white home and a navy away that nobody asked for but is fine. The home has subtle red and blue piping at the shoulders that you'll only notice on TV close-ups. Solid, safe, the visual equivalent of Gareth Southgate's team selections." },
  { team: "Croatia",                 dailyMailName: "Croatia",                 iso3: "CRO", group: "L", blurb: "Vatreni's home is the iconic red-and-white checkerboard that's been their identity for 30 years. Away is a deep navy with subtle checkerboard pattern that you only notice up close. Nike know not to mess with this template." },
  { team: "Panama",                  dailyMailName: "Panama",                  iso3: "PAN", group: "L", blurb: "La Marea Roja home is the deep red with white and blue trim, classic CONCACAF energy. Away is the dark blue with red panels and the canal motif on the chest, actually one of the more creative away kits of the tournament. New Balance trying hard." },
  { team: "Ghana",                   dailyMailName: "Ghana",                   iso3: "GHA", group: "L", blurb: "Black Stars home is the white with red, gold, and green stripes across the chest, the Kente-cloth pattern done by Puma is exceptional. Away is the more traditional red. Easily one of the standout kits of the tournament, regardless of how Ghana actually play." },
]

// Verify every entry maps to a real team in teams.ts (build-time sanity check)
const teamNames = new Set(teams.map((t) => t.name))
for (const k of kits) {
  if (!teamNames.has(k.team)) {
    throw new Error(`kits.ts: "${k.team}" doesn't match any team in teams.ts`)
  }
}

export function getKitByIso3(iso3: string): Kit | undefined {
  return kits.find((k) => k.iso3 === iso3)
}

// Returns local image path. The fetch script downloads to this path.
export function kitImagePath(kit: Kit, side: "home" | "away", view: "front" | "back"): string {
  const slug = kit.team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  return `/images/kits/${slug}-${side}-${view}.jpg`
}

// flag-icons CSS class for a given iso3 (the lib uses iso2 lowercase, derive here)
const ISO3_TO_ISO2: Record<string, string> = {
  MEX: "mx", KOR: "kr", RSA: "za", CZE: "cz",
  CAN: "ca", SUI: "ch", QAT: "qa", BIH: "ba",
  BRA: "br", MAR: "ma", SCO: "gb-sct", HAI: "ht",
  USA: "us", AUS: "au", PAR: "py", TUR: "tr",
  GER: "de", ECU: "ec", CIV: "ci", CUW: "cw",
  NED: "nl", JPN: "jp", TUN: "tn", SWE: "se",
  BEL: "be", IRN: "ir", EGY: "eg", NZL: "nz",
  ESP: "es", URU: "uy", KSA: "sa", CPV: "cv",
  FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq",
  ARG: "ar", AUT: "at", ALG: "dz", JOR: "jo",
  POR: "pt", COL: "co", UZB: "uz", COD: "cd",
  ENG: "gb-eng", CRO: "hr", PAN: "pa", GHA: "gh",
}

export function flagClass(iso3: string): string {
  const iso2 = ISO3_TO_ISO2[iso3] ?? ""
  return iso2 ? `fi fi-${iso2}` : ""
}

// flagcdn.com raster code for an iso3 (used by canvas share cards, which can't
// use the CSS flag-icons font). flagcdn supports the gb-eng/gb-sct subdivisions.
export function flagCdnCode(iso3: string): string {
  return ISO3_TO_ISO2[iso3] ?? ""
}

export function teamByIso3(iso3: string): Kit | undefined {
  return kits.find((k) => k.iso3 === iso3)
}
