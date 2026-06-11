export type GroupTeam = {
  name: string
  flag: string
  iso2: string
  confederation: "UEFA" | "CONMEBOL" | "CAF" | "AFC" | "CONCACAF" | "OFC"
  isHost?: boolean
  isDebutant?: boolean
  isPlayoff?: boolean
  isHistoricReturn?: boolean
}

export type GroupStrength = "Weak" | "Moderate" | "Strong"

export type Group = {
  letter: string
  strength: GroupStrength
  favorites: [string, string]
  teams: GroupTeam[]
}

export const groups: Group[] = [
  {
    letter: "A",
    strength: "Moderate",
    favorites: ["Mexico", "South Korea"],
    teams: [
      { name: "Mexico", flag: "🇲🇽", iso2: "mx", confederation: "CONCACAF", isHost: true },
      { name: "South Korea", flag: "🇰🇷", iso2: "kr", confederation: "AFC" },
      { name: "South Africa", flag: "🇿🇦", iso2: "za", confederation: "CAF" },
      { name: "Czech Republic", flag: "🇨🇿", iso2: "cz", confederation: "UEFA", isPlayoff: true },
    ],
  },
  {
    letter: "B",
    strength: "Moderate",
    favorites: ["Canada", "Switzerland"],
    teams: [
      { name: "Canada", flag: "🇨🇦", iso2: "ca", confederation: "CONCACAF", isHost: true },
      { name: "Switzerland", flag: "🇨🇭", iso2: "ch", confederation: "UEFA" },
      { name: "Qatar", flag: "🇶🇦", iso2: "qa", confederation: "AFC" },
      { name: "Bosnia and Herzegovina", flag: "🇧🇦", iso2: "ba", confederation: "UEFA", isPlayoff: true },
    ],
  },
  {
    letter: "C",
    strength: "Moderate",
    favorites: ["Brazil", "Morocco"],
    teams: [
      { name: "Brazil", flag: "🇧🇷", iso2: "br", confederation: "CONMEBOL" },
      { name: "Morocco", flag: "🇲🇦", iso2: "ma", confederation: "CAF" },
      { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", iso2: "gb-sct", confederation: "UEFA", isHistoricReturn: true },
      { name: "Haiti", flag: "🇭🇹", iso2: "ht", confederation: "CONCACAF", isHistoricReturn: true },
    ],
  },
  {
    letter: "D",
    strength: "Moderate",
    favorites: ["United States", "Turkey"],
    teams: [
      { name: "United States", flag: "🇺🇸", iso2: "us", confederation: "CONCACAF", isHost: true },
      { name: "Australia", flag: "🇦🇺", iso2: "au", confederation: "AFC" },
      { name: "Paraguay", flag: "🇵🇾", iso2: "py", confederation: "CONMEBOL" },
      { name: "Turkey", flag: "🇹🇷", iso2: "tr", confederation: "UEFA", isPlayoff: true },
    ],
  },
  {
    letter: "E",
    strength: "Weak",
    favorites: ["Germany", "Ivory Coast"],
    teams: [
      { name: "Germany", flag: "🇩🇪", iso2: "de", confederation: "UEFA" },
      { name: "Ecuador", flag: "🇪🇨", iso2: "ec", confederation: "CONMEBOL" },
      { name: "Ivory Coast", flag: "🇨🇮", iso2: "ci", confederation: "CAF" },
      { name: "Curaçao", flag: "🇨🇼", iso2: "cw", confederation: "CONCACAF", isDebutant: true },
    ],
  },
  {
    letter: "F",
    strength: "Strong",
    favorites: ["Netherlands", "Japan"],
    teams: [
      { name: "Netherlands", flag: "🇳🇱", iso2: "nl", confederation: "UEFA" },
      { name: "Japan", flag: "🇯🇵", iso2: "jp", confederation: "AFC" },
      { name: "Tunisia", flag: "🇹🇳", iso2: "tn", confederation: "CAF" },
      { name: "Sweden", flag: "🇸🇪", iso2: "se", confederation: "UEFA", isPlayoff: true },
    ],
  },
  {
    letter: "G",
    strength: "Weak",
    favorites: ["Belgium", "Egypt"],
    teams: [
      { name: "Belgium", flag: "🇧🇪", iso2: "be", confederation: "UEFA" },
      { name: "Iran", flag: "🇮🇷", iso2: "ir", confederation: "AFC" },
      { name: "Egypt", flag: "🇪🇬", iso2: "eg", confederation: "CAF" },
      { name: "New Zealand", flag: "🇳🇿", iso2: "nz", confederation: "OFC" },
    ],
  },
  {
    letter: "H",
    strength: "Moderate",
    favorites: ["Spain", "Uruguay"],
    teams: [
      { name: "Spain", flag: "🇪🇸", iso2: "es", confederation: "UEFA" },
      { name: "Uruguay", flag: "🇺🇾", iso2: "uy", confederation: "CONMEBOL" },
      { name: "Saudi Arabia", flag: "🇸🇦", iso2: "sa", confederation: "AFC" },
      { name: "Cape Verde", flag: "🇨🇻", iso2: "cv", confederation: "CAF", isDebutant: true },
    ],
  },
  {
    letter: "I",
    strength: "Strong",
    favorites: ["France", "Senegal"],
    teams: [
      { name: "France", flag: "🇫🇷", iso2: "fr", confederation: "UEFA" },
      { name: "Senegal", flag: "🇸🇳", iso2: "sn", confederation: "CAF" },
      { name: "Norway", flag: "🇳🇴", iso2: "no", confederation: "UEFA", isHistoricReturn: true },
      { name: "Iraq", flag: "🇮🇶", iso2: "iq", confederation: "AFC", isPlayoff: true, isHistoricReturn: true },
    ],
  },
  {
    letter: "J",
    strength: "Moderate",
    favorites: ["Argentina", "Algeria"],
    teams: [
      { name: "Argentina", flag: "🇦🇷", iso2: "ar", confederation: "CONMEBOL" },
      { name: "Austria", flag: "🇦🇹", iso2: "at", confederation: "UEFA" },
      { name: "Algeria", flag: "🇩🇿", iso2: "dz", confederation: "CAF" },
      { name: "Jordan", flag: "🇯🇴", iso2: "jo", confederation: "AFC", isDebutant: true },
    ],
  },
  {
    letter: "K",
    strength: "Moderate",
    favorites: ["Portugal", "Colombia"],
    teams: [
      { name: "Portugal", flag: "🇵🇹", iso2: "pt", confederation: "UEFA" },
      { name: "Colombia", flag: "🇨🇴", iso2: "co", confederation: "CONMEBOL" },
      { name: "Uzbekistan", flag: "🇺🇿", iso2: "uz", confederation: "AFC", isDebutant: true },
      { name: "DR Congo", flag: "🇨🇩", iso2: "cd", confederation: "CAF", isPlayoff: true },
    ],
  },
  {
    letter: "L",
    strength: "Strong",
    favorites: ["England", "Croatia"],
    teams: [
      { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", iso2: "gb-eng", confederation: "UEFA" },
      { name: "Croatia", flag: "🇭🇷", iso2: "hr", confederation: "UEFA" },
      { name: "Panama", flag: "🇵🇦", iso2: "pa", confederation: "CONCACAF" },
      { name: "Ghana", flag: "🇬🇭", iso2: "gh", confederation: "CAF" },
    ],
  },
]
