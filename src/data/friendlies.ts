// Pre-tournament international friendlies leading into the 2026 World Cup.
// Window: late May through June 10, 2026 (FIFA international match window).
//
// Times are US Eastern Time (ET) for matches in North America, and local-broadcast
// time for matches in Europe/Asia/Africa . Google's match schedule defaults to the
// viewer's timezone, which we display as-is here. We label times as "local US ET
// (approx)" so visitors know to verify the kickoff in their own timezone.
//
// Includes matches from non-WC-qualified teams (Singapore vs Mongolia etc.)
// because the full friendlies window is a discrete content target on its own.

export type Friendly = {
  id: string                 // f<date>-<homeISO>-<awayISO>
  date: string               // YYYY-MM-DD
  time?: string              // "14:30" 24h, undefined for TBD
  homeTeam: string
  awayTeam: string
  /** true if both teams are 2026 WC qualifiers . used for filtering */
  bothWcTeams?: boolean
  /** Full-time score, set once the match has been played. Both required together. */
  homeScore?: number
  awayScore?: number
}

export const friendlies: Friendly[] = [
  // ── Wed May 27 ──────────────────────────────────────────────────────────────
  { id: "f0527-jam-ind", date: "2026-05-27", time: "14:30", homeTeam: "Jamaica",                 awayTeam: "India", homeScore: 2, awayScore: 0 },

  // ── Thu May 28 ──────────────────────────────────────────────────────────────
  { id: "f0528-egy-rus", date: "2026-05-28", time: "14:00", homeTeam: "Egypt",                   awayTeam: "Russia", homeScore: 1, awayScore: 0 },
  { id: "f0528-irl-qat", date: "2026-05-28", time: "14:45", homeTeam: "Ireland",                 awayTeam: "Qatar", homeScore: 1, awayScore: 0 },

  // ── Fri May 29 ──────────────────────────────────────────────────────────────
  { id: "f0529-irn-gam", date: "2026-05-29", time: "08:00", homeTeam: "Iran",                    awayTeam: "Gambia", homeScore: 3, awayScore: 1 },
  { id: "f0529-and-irq", date: "2026-05-29", time: "12:00", homeTeam: "Andorra",                 awayTeam: "Iraq", homeScore: 0, awayScore: 1 },
  { id: "f0529-rsa-nic", date: "2026-05-29", time: "12:00", homeTeam: "South Africa",            awayTeam: "Nicaragua", homeScore: 0, awayScore: 0 },
  { id: "f0529-bih-mkd", date: "2026-05-29", time: "14:30", homeTeam: "Bosnia and Herzegovina",  awayTeam: "North Macedonia", homeScore: 0, awayScore: 0 },

  // ── Sat May 30 ──────────────────────────────────────────────────────────────
  { id: "f0530-sco-cuw", date: "2026-05-30", time: "08:00", homeTeam: "Scotland",                awayTeam: "Curaçao",                  bothWcTeams: true, homeScore: 4, awayScore: 1 },
  { id: "f0530-ecu-ksa", date: "2026-05-30", time: "19:30", homeTeam: "Ecuador",                 awayTeam: "Saudi Arabia",             bothWcTeams: true, homeScore: 2, awayScore: 1 },
  { id: "f0530-kor-tri", date: "2026-05-30", time: "21:00", homeTeam: "South Korea",             awayTeam: "Trinidad and Tobago", homeScore: 5, awayScore: 0 },
  { id: "f0530-mex-aus", date: "2026-05-30", time: "22:00", homeTeam: "Mexico",                  awayTeam: "Australia",                bothWcTeams: true, homeScore: 1, awayScore: 0 },

  // ── Sun May 31 ──────────────────────────────────────────────────────────────
  { id: "f0531-jpn-isl", date: "2026-05-31", time: "06:25", homeTeam: "Japan",                   awayTeam: "Iceland", homeScore: 1, awayScore: 0 },
  { id: "f0531-sgp-mng", date: "2026-05-31", time: "07:30", homeTeam: "Singapore",               awayTeam: "Mongolia", homeScore: 4, awayScore: 0 },
  { id: "f0531-sui-jor", date: "2026-05-31", time: "09:00", homeTeam: "Switzerland",             awayTeam: "Jordan",                   bothWcTeams: true, homeScore: 4, awayScore: 1 },
  { id: "f0531-cze-kos", date: "2026-05-31", time: "10:00", homeTeam: "Czech Republic",          awayTeam: "Kosovo", homeScore: 2, awayScore: 1 },
  { id: "f0531-cpv-srb", date: "2026-05-31", time: "10:30", homeTeam: "Cape Verde",              awayTeam: "Serbia", homeScore: 3, awayScore: 0 },
  { id: "f0531-pol-ukr", date: "2026-05-31", time: "11:30", homeTeam: "Poland",                  awayTeam: "Ukraine", homeScore: 0, awayScore: 2 },
  { id: "f0531-ger-fin", date: "2026-05-31", time: "14:45", homeTeam: "Germany",                 awayTeam: "Finland", homeScore: 4, awayScore: 0 },
  { id: "f0531-usa-sen", date: "2026-05-31", time: "15:30", homeTeam: "United States",           awayTeam: "Senegal",                  bothWcTeams: true, homeScore: 3, awayScore: 2 },
  { id: "f0531-bra-pan", date: "2026-05-31", time: "17:30", homeTeam: "Brazil",                  awayTeam: "Panama",                   bothWcTeams: true, homeScore: 6, awayScore: 2 },

  // ── Mon Jun 01 ──────────────────────────────────────────────────────────────
  { id: "f0601-svk-mlt", date: "2026-06-01", time: "12:00", homeTeam: "Slovakia",                awayTeam: "Malta", homeScore: 2, awayScore: 1 },
  { id: "f0601-bgr-mne", date: "2026-06-01", time: "12:00", homeTeam: "Bulgaria",                awayTeam: "Montenegro", homeScore: 0, awayScore: 1 },
  { id: "f0601-nor-swe", date: "2026-06-01", time: "13:00", homeTeam: "Norway",                  awayTeam: "Sweden", homeScore: 3, awayScore: 1 },
  { id: "f0601-tur-mkd", date: "2026-06-01", time: "13:30", homeTeam: "Türkiye",                 awayTeam: "North Macedonia", homeScore: 4, awayScore: 0 },
  { id: "f0601-aut-tun", date: "2026-06-01", time: "14:45", homeTeam: "Austria",                 awayTeam: "Tunisia",                  bothWcTeams: true, homeScore: 1, awayScore: 0 },
  { id: "f0601-col-crc", date: "2026-06-01", time: "19:00", homeTeam: "Colombia",                awayTeam: "Costa Rica", homeScore: 3, awayScore: 1 },
  { id: "f0601-can-uzb", date: "2026-06-01", time: "21:00", homeTeam: "Canada",                  awayTeam: "Uzbekistan",               bothWcTeams: true, homeScore: 2, awayScore: 0 },

  // ── Tue Jun 02 ──────────────────────────────────────────────────────────────
  { id: "f0602-cro-bel", date: "2026-06-02", time: "12:00", homeTeam: "Croatia",                 awayTeam: "Belgium",                  bothWcTeams: true, homeScore: 0, awayScore: 2 },
  { id: "f0602-mar-mdg", date: "2026-06-02", time: "13:00", homeTeam: "Morocco",                 awayTeam: "Madagascar", homeScore: 4, awayScore: 0 },
  { id: "f0602-geo-rou", date: "2026-06-02", time: "13:00", homeTeam: "Georgia",                 awayTeam: "Romania", homeScore: 1, awayScore: 1 },
  { id: "f0602-wal-gha", date: "2026-06-02", time: "14:45", homeTeam: "Wales",                   awayTeam: "Ghana", homeScore: 1, awayScore: 1 },
  { id: "f0602-hai-nzl", date: "2026-06-02", time: "19:30", homeTeam: "Haiti",                   awayTeam: "New Zealand",              bothWcTeams: true, homeScore: 4, awayScore: 0 },

  // ── Wed Jun 03 ──────────────────────────────────────────────────────────────
  { id: "f0603-phi-gum", date: "2026-06-03", time: "07:30", homeTeam: "Philippines",             awayTeam: "Guam", homeScore: 5, awayScore: 1 },
  { id: "f0603-gib-vgb", date: "2026-06-03", time: "13:00", homeTeam: "Gibraltar",               awayTeam: "British Virgin Islands", homeScore: 4, awayScore: 0 },
  { id: "f0603-den-cod", date: "2026-06-03", time: "14:00", homeTeam: "Denmark",                 awayTeam: "DR Congo", homeScore: 0, awayScore: 0 },
  { id: "f0603-alb-isr", date: "2026-06-03", time: "14:00", homeTeam: "Albania",                 awayTeam: "Israel", homeScore: 0, awayScore: 1 },
  { id: "f0603-pol-ngr", date: "2026-06-03", time: "14:45", homeTeam: "Poland",                  awayTeam: "Nigeria", homeScore: 2, awayScore: 2 },
  { id: "f0603-ned-alg", date: "2026-06-03", time: "14:45", homeTeam: "Netherlands",             awayTeam: "Algeria",                  bothWcTeams: true, homeScore: 0, awayScore: 1 },
  { id: "f0603-lux-ita", date: "2026-06-03", time: "14:45", homeTeam: "Luxembourg",              awayTeam: "Italy", homeScore: 0, awayScore: 1 },
  { id: "f0603-kor-slv", date: "2026-06-03", time: "19:00", homeTeam: "South Korea",             awayTeam: "El Salvador", homeScore: 1, awayScore: 0 },
  { id: "f0603-pan-dom", date: "2026-06-03", time: "20:45", homeTeam: "Panama",                  awayTeam: "Dominican Republic", homeScore: 4, awayScore: 2 },

  // ── Thu Jun 04 ──────────────────────────────────────────────────────────────
  { id: "f0604-cam-bhu", date: "2026-06-04", time: "08:00", homeTeam: "Cambodia",                awayTeam: "Bhutan", homeScore: 4, awayScore: 0 },
  { id: "f0604-svn-cyp", date: "2026-06-04", time: "12:00", homeTeam: "Slovenia",                awayTeam: "Cyprus", homeScore: 1, awayScore: 1 },
  { id: "f0604-nir-gui", date: "2026-06-04", time: "12:00", homeTeam: "Northern Ireland",        awayTeam: "Guinea", homeScore: 1, awayScore: 0 },
  { id: "f0604-and-lie", date: "2026-06-04", time: "13:00", homeTeam: "Andorra",                 awayTeam: "Liechtenstein", homeScore: 2, awayScore: 0 },
  { id: "f0604-swe-gre", date: "2026-06-04", time: "13:00", homeTeam: "Sweden",                  awayTeam: "Greece", homeScore: 2, awayScore: 2 },
  { id: "f0604-esp-irq", date: "2026-06-04", time: "15:00", homeTeam: "Spain",                   awayTeam: "Iraq",                     bothWcTeams: true, homeScore: 1, awayScore: 1 },
  { id: "f0604-fra-civ", date: "2026-06-04", time: "15:10", homeTeam: "France",                  awayTeam: "Ivory Coast",              bothWcTeams: true, homeScore: 1, awayScore: 2 },
  { id: "f0604-cze-gua", date: "2026-06-04", time: "20:00", homeTeam: "Czech Republic",          awayTeam: "Guatemala", homeScore: 3, awayScore: 1 },
  { id: "f0604-mex-srb", date: "2026-06-04", time: "22:00", homeTeam: "Mexico",                  awayTeam: "Serbia", homeScore: 5, awayScore: 1 },

  // ── Fri Jun 05 ──────────────────────────────────────────────────────────────
  { id: "f0605-hkg-mng", date: "2026-06-05", time: "08:00", homeTeam: "Hong Kong",               awayTeam: "Mongolia", homeScore: 2, awayScore: 0 },
  { id: "f0605-tha-kuw", date: "2026-06-05", time: "08:30", homeTeam: "Thailand",                awayTeam: "Kuwait", homeScore: 2, awayScore: 2 },
  { id: "f0605-idn-omn", date: "2026-06-05", time: "09:00", homeTeam: "Indonesia",               awayTeam: "Oman", homeScore: 3, awayScore: 0 },
  { id: "f0605-blr-syr", date: "2026-06-05", time: "12:00", homeTeam: "Belarus",                 awayTeam: "Syria", homeScore: 4, awayScore: 1 },
  { id: "f0605-geo-bhr", date: "2026-06-05", time: "12:00", homeTeam: "Georgia",                 awayTeam: "Bahrain", homeScore: 2, awayScore: 0 },
  { id: "f0605-svk-mne", date: "2026-06-05", time: "12:30", homeTeam: "Slovakia",                awayTeam: "Montenegro", homeScore: 2, awayScore: 2 },
  { id: "f0605-smr-ban", date: "2026-06-05", time: "13:00", homeTeam: "San Marino",              awayTeam: "Bangladesh", homeScore: 1, awayScore: 2 },
  { id: "f0605-rus-bfa", date: "2026-06-05",                  homeTeam: "Russia",                   awayTeam: "Burkina Faso", homeScore: 3, awayScore: 0 },
  { id: "f0605-mda-bgr", date: "2026-06-05", time: "13:00", homeTeam: "Moldova",                 awayTeam: "Bulgaria", homeScore: 2, awayScore: 2 },
  { id: "f0605-hun-fin", date: "2026-06-05", time: "13:45", homeTeam: "Hungary",                 awayTeam: "Finland", homeScore: 2, awayScore: 1 },
  { id: "f0605-aze-mlt", date: "2026-06-05", time: "14:00", homeTeam: "Azerbaijan",              awayTeam: "Malta", homeScore: 0, awayScore: 2 },
  { id: "f0605-par-nic", date: "2026-06-05", time: "18:15", homeTeam: "Paraguay",                awayTeam: "Nicaragua", homeScore: 4, awayScore: 0 },
  { id: "f0605-can-irl", date: "2026-06-05", time: "19:30", homeTeam: "Canada",                  awayTeam: "Ireland", homeScore: 1, awayScore: 1 },
  { id: "f0605-hai-per", date: "2026-06-05", time: "20:00", homeTeam: "Haiti",                   awayTeam: "Peru", homeScore: 1, awayScore: 2 },

  // ── Sat Jun 06 ──────────────────────────────────────────────────────────────
  { id: "f0606-bel-tun", date: "2026-06-06", time: "09:00", homeTeam: "Belgium",                 awayTeam: "Tunisia",                  bothWcTeams: true, homeScore: 5, awayScore: 0 },
  { id: "f0606-arm-kaz", date: "2026-06-06", time: "10:00", homeTeam: "Armenia",                 awayTeam: "Kazakhstan", homeScore: 1, awayScore: 1 },
  { id: "f0606-gib-cay", date: "2026-06-06", time: "13:00", homeTeam: "Gibraltar",               awayTeam: "Cayman Islands", homeScore: 4, awayScore: 1 },
  { id: "f0606-por-chi", date: "2026-06-06", time: "13:45", homeTeam: "Portugal",                awayTeam: "Chile", homeScore: 2, awayScore: 1 },
  { id: "f0606-rou-wal", date: "2026-06-06", time: "13:45", homeTeam: "Romania",                 awayTeam: "Wales", homeScore: 2, awayScore: 1 },
  { id: "f0606-alb-lux", date: "2026-06-06", time: "14:00", homeTeam: "Albania",                 awayTeam: "Luxembourg", homeScore: 0, awayScore: 1 },
  { id: "f0606-usa-ger", date: "2026-06-06", time: "14:30", homeTeam: "United States",           awayTeam: "Germany",                  bothWcTeams: true, homeScore: 1, awayScore: 2 },
  { id: "f0606-sui-aus", date: "2026-06-06", time: "15:00", homeTeam: "Switzerland",             awayTeam: "Australia",                bothWcTeams: true, homeScore: 1, awayScore: 1 },
  { id: "f0606-pan-bih", date: "2026-06-06", time: "15:00", homeTeam: "Panama",                  awayTeam: "Bosnia and Herzegovina",   bothWcTeams: true, homeScore: 1, awayScore: 1 },
  { id: "f0606-bol-sco", date: "2026-06-06", time: "16:00", homeTeam: "Bolivia",                 awayTeam: "Scotland", homeScore: 0, awayScore: 4 },
  { id: "f0606-eng-nzl", date: "2026-06-06", time: "16:00", homeTeam: "England",                 awayTeam: "New Zealand",              bothWcTeams: true, homeScore: 1, awayScore: 0 },
  { id: "f0606-qat-slv", date: "2026-06-06", time: "16:00", homeTeam: "Qatar",                   awayTeam: "El Salvador", homeScore: 0, awayScore: 0 },
  { id: "f0606-bra-egy", date: "2026-06-06", time: "18:00", homeTeam: "Brazil",                  awayTeam: "Egypt", homeScore: 2, awayScore: 1 },
  { id: "f0606-ven-tur", date: "2026-06-06", time: "19:00", homeTeam: "Venezuela",               awayTeam: "Türkiye", homeScore: 1, awayScore: 2 },
  { id: "f0606-arg-hon", date: "2026-06-06", time: "20:00", homeTeam: "Argentina",               awayTeam: "Honduras", homeScore: 2, awayScore: 0 },
  { id: "f0606-cuw-aru", date: "2026-06-06", time: "20:00", homeTeam: "Curaçao",                 awayTeam: "Aruba", homeScore: 4, awayScore: 0 },

  // ── Sun Jun 07 ──────────────────────────────────────────────────────────────
  { id: "f0607-lie-cyp", date: "2026-06-07", time: "09:00", homeTeam: "Liechtenstein",           awayTeam: "Cyprus", homeScore: 0, awayScore: 2 },
  { id: "f0607-den-ukr", date: "2026-06-07", time: "12:30", homeTeam: "Denmark",                 awayTeam: "Ukraine", homeScore: 2, awayScore: 1 },
  { id: "f0607-kos-and", date: "2026-06-07", time: "14:00", homeTeam: "Kosovo",                  awayTeam: "Andorra", homeScore: 3, awayScore: 0 },
  { id: "f0607-cro-svn", date: "2026-06-07", time: "14:45", homeTeam: "Croatia",                 awayTeam: "Slovenia", homeScore: 2, awayScore: 1 },
  { id: "f0607-mar-nor", date: "2026-06-07", time: "15:00", homeTeam: "Morocco",                 awayTeam: "Norway",                   bothWcTeams: true, homeScore: 1, awayScore: 1 },
  { id: "f0607-gre-ita", date: "2026-06-07", time: "15:00", homeTeam: "Greece",                  awayTeam: "Italy", homeScore: 0, awayScore: 1 },
  { id: "f0607-ecu-gua", date: "2026-06-07", time: "16:00", homeTeam: "Ecuador",                 awayTeam: "Guatemala", homeScore: 3, awayScore: 0 },
  { id: "f0607-col-jor", date: "2026-06-07", time: "19:00", homeTeam: "Colombia",                awayTeam: "Jordan",                   bothWcTeams: true, homeScore: 2, awayScore: 0 },

  // ── Mon Jun 08 ──────────────────────────────────────────────────────────────
  { id: "f0608-ned-uzb", date: "2026-06-08", time: "14:45", homeTeam: "Netherlands",             awayTeam: "Uzbekistan",               bothWcTeams: true, homeScore: 2, awayScore: 1 },
  { id: "f0608-fra-nir", date: "2026-06-08", time: "15:10", homeTeam: "France",                  awayTeam: "Northern Ireland", homeScore: 3, awayScore: 1 },
  { id: "f0608-esp-per", date: "2026-06-08", time: "22:00", homeTeam: "Spain",                   awayTeam: "Peru", homeScore: 3, awayScore: 1 },

  // ── Tue Jun 09 ──────────────────────────────────────────────────────────────
  { id: "f0609-kuw-omn", date: "2026-06-09",                  homeTeam: "Kuwait",                   awayTeam: "Oman", homeScore: 2, awayScore: 4 },
  { id: "f0609-phi-mya", date: "2026-06-09", time: "07:30", homeTeam: "Philippines",             awayTeam: "Myanmar", homeScore: 5, awayScore: 1 },
  { id: "f0609-cam-hkg", date: "2026-06-09", time: "08:00", homeTeam: "Cambodia",                awayTeam: "Hong Kong", homeScore: 2, awayScore: 0 },
  { id: "f0609-cod-chi", date: "2026-06-09", time: "10:00", homeTeam: "DR Congo",                awayTeam: "Chile", homeScore: 1, awayScore: 2 },
  { id: "f0609-bhr-syr", date: "2026-06-09", time: "10:00", homeTeam: "Bahrain",                 awayTeam: "Syria" },
  { id: "f0609-arm-mda", date: "2026-06-09", time: "12:00", homeTeam: "Armenia",                 awayTeam: "Moldova", homeScore: 1, awayScore: 1 },
  { id: "f0609-rus-tri", date: "2026-06-09", time: "12:00", homeTeam: "Russia",                  awayTeam: "Trinidad and Tobago", homeScore: 3, awayScore: 0 },
  { id: "f0609-gnq-com", date: "2026-06-09",                  homeTeam: "Equatorial Guinea",        awayTeam: "Comoros", homeScore: 0, awayScore: 1 },
  { id: "f0609-blr-bfa", date: "2026-06-09", time: "12:30", homeTeam: "Belarus",                 awayTeam: "Burkina Faso", homeScore: 2, awayScore: 2 },
  { id: "f0609-hun-kaz", date: "2026-06-09", time: "13:00", homeTeam: "Hungary",                 awayTeam: "Kazakhstan", homeScore: 3, awayScore: 1 },
  { id: "f0609-smr-aze", date: "2026-06-09", time: "14:00", homeTeam: "San Marino",              awayTeam: "Azerbaijan", homeScore: 1, awayScore: 2 },
  { id: "f0609-arg-isl", date: "2026-06-09",                  homeTeam: "Argentina",                awayTeam: "Iceland", homeScore: 3, awayScore: 0 },
  { id: "f0609-sen-ksa", date: "2026-06-09", time: "19:00", homeTeam: "Senegal",                 awayTeam: "Saudi Arabia",             bothWcTeams: true, homeScore: 0, awayScore: 0 },

  // ── Wed Jun 10 ──────────────────────────────────────────────────────────────
  { id: "f0610-por-ngr", date: "2026-06-10", time: "15:45", homeTeam: "Portugal",                awayTeam: "Nigeria", homeScore: 2, awayScore: 1 },
  { id: "f0610-eng-crc", date: "2026-06-10", time: "16:00", homeTeam: "England",                 awayTeam: "Costa Rica", homeScore: 3, awayScore: 0 },

  // ── Thu Jun 11 (kickoff day) ────────────────────────────────────────────────
  { id: "f0611-aut-gua", date: "2026-06-11",                  homeTeam: "Austria",                  awayTeam: "Guatemala" },
]

export function friendliesByDate(): [string, Friendly[]][] {
  const map = new Map<string, Friendly[]>()
  for (const f of friendlies) {
    if (!map.has(f.date)) map.set(f.date, [])
    map.get(f.date)!.push(f)
  }
  // Within a date, sort by time (TBD entries last)
  const dates = [...map.entries()]
  for (const [, arr] of dates) {
    arr.sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      return 0
    })
  }
  return dates.sort(([a], [b]) => a.localeCompare(b))
}
