// Confirmed FIFA World Cup 2026 broadcast rights by country. Per-match
// network splits (e.g. which exact FOX channel a match airs on) come from
// src/data/matchBroadcasters.json . see src/lib/broadcasters.ts for the
// merger.

export type Broadcaster = {
  name: string           // "FOX" / "Telemundo" / "BBC"
  url?: string           // homepage or schedule page
  type: "tv" | "stream"  // TV vs streaming
  note?: string          // "English" / "Spanish" / "free-to-air" etc
}

export type CountryBroadcast = {
  countryCode: string    // ISO-3166-1 alpha-2
  countryName: string
  emoji: string          // flag emoji for visual
  broadcasters: Broadcaster[]
}

// Confirmed rights as of June 2026. Pulled from FIFA's official broadcaster
// list + each rights-holder's public announcements. Verify before any
// region we don't host the tournament in.
export const broadcasters: CountryBroadcast[] = [
  {
    countryCode: "US", countryName: "United States", emoji: "🇺🇸",
    broadcasters: [
      { name: "FOX", url: "https://www.foxsports.com/soccer/fifa-world-cup", type: "tv", note: "English, FOX + FS1" },
      { name: "Telemundo", url: "https://www.telemundodeportes.com/futbol/copa-mundial", type: "tv", note: "Spanish, Telemundo + Universo" },
      { name: "Peacock", url: "https://www.peacocktv.com/sports/soccer", type: "stream", note: "Spanish, all 104 matches" },
      { name: "FOX Sports App", url: "https://www.foxsports.com/live/", type: "stream", note: "English, FOX live stream" },
    ],
  },
  {
    countryCode: "CA", countryName: "Canada", emoji: "🇨🇦",
    broadcasters: [
      { name: "CTV", url: "https://www.ctv.ca/sports", type: "tv", note: "English, Bell Media" },
      { name: "TSN", url: "https://www.tsn.ca/soccer", type: "tv", note: "English" },
      { name: "TSN+", url: "https://www.tsn.ca/plus", type: "stream", note: "English stream" },
      { name: "RDS", url: "https://www.rds.ca/soccer", type: "tv", note: "French" },
    ],
  },
  {
    countryCode: "MX", countryName: "Mexico", emoji: "🇲🇽",
    broadcasters: [
      { name: "TUDN", url: "https://www.tudn.com/futbol/copa-mundial", type: "tv", note: "TelevisaUnivision" },
      { name: "Canal 5", url: "https://www.televisa.com/canal-5/", type: "tv", note: "Free-to-air" },
      { name: "TV Azteca", url: "https://www.tvazteca.com/aztecadeportes", type: "tv", note: "Free-to-air, Azteca 7" },
      { name: "ViX", url: "https://vix.com/", type: "stream", note: "Spanish stream" },
    ],
  },
  {
    countryCode: "GB", countryName: "United Kingdom", emoji: "🇬🇧",
    broadcasters: [
      { name: "BBC", url: "https://www.bbc.co.uk/sport/football/world-cup", type: "tv", note: "Free-to-air, BBC One/Two" },
      { name: "BBC iPlayer", url: "https://www.bbc.co.uk/iplayer", type: "stream", note: "Free" },
      { name: "ITV", url: "https://www.itv.com/sport", type: "tv", note: "Free-to-air, ITV1" },
      { name: "ITVX", url: "https://www.itv.com/watch", type: "stream", note: "Free" },
    ],
  },
  {
    countryCode: "AU", countryName: "Australia", emoji: "🇦🇺",
    broadcasters: [
      { name: "SBS", url: "https://www.sbs.com.au/sport", type: "tv", note: "Free-to-air" },
      { name: "SBS On Demand", url: "https://www.sbs.com.au/ondemand", type: "stream", note: "Free" },
    ],
  },
  {
    countryCode: "DE", countryName: "Germany", emoji: "🇩🇪",
    broadcasters: [
      { name: "ARD", url: "https://www.sportschau.de/fussball/wm/", type: "tv", note: "Free-to-air, Das Erste" },
      { name: "ZDF", url: "https://www.zdf.de/sport/", type: "tv", note: "Free-to-air" },
      { name: "MagentaTV", url: "https://www.telekom.de/magenta-tv", type: "stream", note: "All 104 matches" },
    ],
  },
  {
    countryCode: "FR", countryName: "France", emoji: "🇫🇷",
    broadcasters: [
      { name: "TF1", url: "https://www.tf1.fr/", type: "tv", note: "Free-to-air" },
      { name: "beIN Sports", url: "https://www.beinsports.com/fr-fr/", type: "tv", note: "Premium" },
    ],
  },
  {
    countryCode: "ES", countryName: "Spain", emoji: "🇪🇸",
    broadcasters: [
      { name: "La 1 (RTVE)", url: "https://www.rtve.es/deportes/futbol/mundial/", type: "tv", note: "Free-to-air" },
      { name: "RTVE Play", url: "https://www.rtve.es/play/", type: "stream", note: "Free" },
    ],
  },
  {
    countryCode: "BR", countryName: "Brazil", emoji: "🇧🇷",
    broadcasters: [
      { name: "TV Globo", url: "https://globo.com/", type: "tv", note: "Free-to-air" },
      { name: "SporTV", url: "https://sportv.globo.com/", type: "tv", note: "Pay-TV" },
      { name: "GE.globo", url: "https://ge.globo.com/", type: "stream", note: "Streaming" },
    ],
  },
  {
    countryCode: "AR", countryName: "Argentina", emoji: "🇦🇷",
    broadcasters: [
      { name: "TV Pública", url: "https://www.tvpublica.com.ar/", type: "tv", note: "Free-to-air" },
      { name: "DSports", url: "https://www.directv.com.ar/dsports", type: "tv", note: "Premium" },
      { name: "Telefe", url: "https://telefe.com/", type: "tv", note: "Selected matches" },
    ],
  },
  {
    countryCode: "JP", countryName: "Japan", emoji: "🇯🇵",
    broadcasters: [
      { name: "NHK", url: "https://www.nhk.or.jp/sports/", type: "tv", note: "Free-to-air" },
      { name: "ABEMA", url: "https://abema.tv/", type: "stream", note: "Free streaming" },
    ],
  },
  {
    countryCode: "KR", countryName: "South Korea", emoji: "🇰🇷",
    broadcasters: [
      { name: "KBS / MBC / SBS", url: "https://www.kbs.co.kr/", type: "tv", note: "Pool coverage" },
      { name: "Coupang Play", url: "https://www.coupangplay.com/", type: "stream", note: "Streaming" },
    ],
  },
]

export function getBroadcasterByCountry(code: string): CountryBroadcast | undefined {
  return broadcasters.find((b) => b.countryCode === code.toUpperCase())
}
