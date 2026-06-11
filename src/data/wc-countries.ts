export type WCCountry = {
  name: string
  flag: string
  confederation: "UEFA" | "CONMEBOL" | "CAF" | "AFC" | "CONCACAF" | "OFC"
  lat: number
  lng: number
  isHost?: boolean
}

export const wcCountries: WCCountry[] = [
  // CONCACAF - Hosts
  { name: "United States", flag: "🇺🇸", confederation: "CONCACAF", lat: 38.9, lng: -95.7, isHost: true },
  { name: "Canada", flag: "🇨🇦", confederation: "CONCACAF", lat: 56.1, lng: -96.3, isHost: true },
  { name: "Mexico", flag: "🇲🇽", confederation: "CONCACAF", lat: 23.6, lng: -102.6, isHost: true },

  // CONCACAF
  { name: "Panama", flag: "🇵🇦", confederation: "CONCACAF", lat: 8.5, lng: -80.8 },
  { name: "Haiti", flag: "🇭🇹", confederation: "CONCACAF", lat: 19.0, lng: -72.3 },
  { name: "Curaçao", flag: "🇨🇼", confederation: "CONCACAF", lat: 12.2, lng: -69.0 },

  // CONMEBOL
  { name: "Argentina", flag: "🇦🇷", confederation: "CONMEBOL", lat: -38.4, lng: -63.6 },
  { name: "Brazil", flag: "🇧🇷", confederation: "CONMEBOL", lat: -14.2, lng: -51.9 },
  { name: "Uruguay", flag: "🇺🇾", confederation: "CONMEBOL", lat: -32.5, lng: -55.8 },
  { name: "Colombia", flag: "🇨🇴", confederation: "CONMEBOL", lat: 4.6, lng: -74.1 },
  { name: "Ecuador", flag: "🇪🇨", confederation: "CONMEBOL", lat: -1.8, lng: -78.2 },
  { name: "Paraguay", flag: "🇵🇾", confederation: "CONMEBOL", lat: -23.4, lng: -58.4 },

  // UEFA
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confederation: "UEFA", lat: 52.4, lng: -1.7 },
  { name: "France", flag: "🇫🇷", confederation: "UEFA", lat: 46.2, lng: 2.2 },
  { name: "Germany", flag: "🇩🇪", confederation: "UEFA", lat: 51.2, lng: 10.5 },
  { name: "Spain", flag: "🇪🇸", confederation: "UEFA", lat: 40.5, lng: -3.7 },
  { name: "Portugal", flag: "🇵🇹", confederation: "UEFA", lat: 39.4, lng: -8.2 },
  { name: "Netherlands", flag: "🇳🇱", confederation: "UEFA", lat: 52.1, lng: 5.3 },
  { name: "Belgium", flag: "🇧🇪", confederation: "UEFA", lat: 50.8, lng: 4.5 },
  { name: "Croatia", flag: "🇭🇷", confederation: "UEFA", lat: 45.1, lng: 15.2 },
  { name: "Switzerland", flag: "🇨🇭", confederation: "UEFA", lat: 46.8, lng: 8.2 },
  { name: "Austria", flag: "🇦🇹", confederation: "UEFA", lat: 47.5, lng: 14.6 },
  { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confederation: "UEFA", lat: 56.5, lng: -4.2 },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦", confederation: "UEFA", lat: 44.2, lng: 17.9 },
  { name: "Turkey", flag: "🇹🇷", confederation: "UEFA", lat: 38.9, lng: 35.2 },
  { name: "Norway", flag: "🇳🇴", confederation: "UEFA", lat: 60.5, lng: 8.5 },
  { name: "Sweden", flag: "🇸🇪", confederation: "UEFA", lat: 60.1, lng: 18.6 },
  { name: "Czech Republic", flag: "🇨🇿", confederation: "UEFA", lat: 49.8, lng: 15.5 },

  // CAF
  { name: "Morocco", flag: "🇲🇦", confederation: "CAF", lat: 31.8, lng: -7.1 },
  { name: "Senegal", flag: "🇸🇳", confederation: "CAF", lat: 14.5, lng: -14.5 },
  { name: "Egypt", flag: "🇪🇬", confederation: "CAF", lat: 26.8, lng: 30.8 },
  { name: "Ivory Coast", flag: "🇨🇮", confederation: "CAF", lat: 7.5, lng: -5.5 },
  { name: "South Africa", flag: "🇿🇦", confederation: "CAF", lat: -30.6, lng: 22.9 },
  { name: "Tunisia", flag: "🇹🇳", confederation: "CAF", lat: 33.9, lng: 9.6 },
  { name: "Algeria", flag: "🇩🇿", confederation: "CAF", lat: 28.0, lng: 1.7 },
  { name: "Ghana", flag: "🇬🇭", confederation: "CAF", lat: 7.9, lng: -1.0 },
  { name: "DR Congo", flag: "🇨🇩", confederation: "CAF", lat: -4.0, lng: 21.8 },
  { name: "Cape Verde", flag: "🇨🇻", confederation: "CAF", lat: 14.9, lng: -23.5 },

  // AFC
  { name: "Japan", flag: "🇯🇵", confederation: "AFC", lat: 36.2, lng: 138.3 },
  { name: "South Korea", flag: "🇰🇷", confederation: "AFC", lat: 35.9, lng: 127.8 },
  { name: "Australia", flag: "🇦🇺", confederation: "AFC", lat: -25.3, lng: 133.8 },
  { name: "Saudi Arabia", flag: "🇸🇦", confederation: "AFC", lat: 23.9, lng: 45.1 },
  { name: "Iran", flag: "🇮🇷", confederation: "AFC", lat: 32.4, lng: 53.7 },
  { name: "Iraq", flag: "🇮🇶", confederation: "AFC", lat: 33.2, lng: 43.7 },
  { name: "Uzbekistan", flag: "🇺🇿", confederation: "AFC", lat: 41.4, lng: 64.6 },
  { name: "Jordan", flag: "🇯🇴", confederation: "AFC", lat: 31.0, lng: 36.1 },
  { name: "Qatar", flag: "🇶🇦", confederation: "AFC", lat: 25.4, lng: 51.2 },

  // OFC
  { name: "New Zealand", flag: "🇳🇿", confederation: "OFC", lat: -40.9, lng: 174.9 },
]

export const confederationColors: Record<WCCountry["confederation"], string> = {
  UEFA: "#7E43FF",
  CONMEBOL: "#10b981",
  CAF: "#f59e0b",
  AFC: "#ef4444",
  CONCACAF: "#3b82f6",
  OFC: "#ec4899",
}
