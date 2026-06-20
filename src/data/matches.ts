export type Match = {
  id: string
  matchNumber: number
  round: "Group Stage" | "Round of 32" | "Round of 16" | "Quarterfinal" | "Semi-final" | "3rd Place" | "Final"
  group?: string
  date: string        // "2026-06-11"
  time: string        // local stadium time "20:00"
  homeTeam: string
  awayTeam: string
  stadiumSlug: string
  citySlug: string
}

// Authoritative 104-match fixture list for the 2026 FIFA World Cup.
// Source: FIFA / ESPN official schedule. Times are local stadium time.
// Regenerate by running: node scripts/rebuild-matches.mjs
export const matches: Match[] = [
  { id:"m01", matchNumber:1, round:"Group Stage", group:"A", date:"2026-06-11", time:"13:00", homeTeam:"Mexico", awayTeam:"South Africa", stadiumSlug:"estadio-azteca", citySlug:"mexico-city" },
  { id:"m02", matchNumber:2, round:"Group Stage", group:"A", date:"2026-06-11", time:"20:00", homeTeam:"South Korea", awayTeam:"Czech Republic", stadiumSlug:"estadio-akron", citySlug:"guadalajara" },
  { id:"m03", matchNumber:3, round:"Group Stage", group:"B", date:"2026-06-12", time:"15:00", homeTeam:"Canada", awayTeam:"Bosnia and Herzegovina", stadiumSlug:"bmo-field", citySlug:"toronto" },
  { id:"m04", matchNumber:4, round:"Group Stage", group:"D", date:"2026-06-12", time:"18:00", homeTeam:"United States", awayTeam:"Paraguay", stadiumSlug:"sofi-stadium", citySlug:"los-angeles" },
  { id:"m05", matchNumber:5, round:"Group Stage", group:"B", date:"2026-06-13", time:"12:00", homeTeam:"Qatar", awayTeam:"Switzerland", stadiumSlug:"levis-stadium", citySlug:"san-francisco-bay-area" },
  { id:"m06", matchNumber:6, round:"Group Stage", group:"C", date:"2026-06-13", time:"18:00", homeTeam:"Brazil", awayTeam:"Morocco", stadiumSlug:"metlife-stadium", citySlug:"new-york-new-jersey" },
  { id:"m07", matchNumber:7, round:"Group Stage", group:"C", date:"2026-06-13", time:"21:00", homeTeam:"Haiti", awayTeam:"Scotland", stadiumSlug:"gillette-stadium", citySlug:"boston" },
  { id:"m08", matchNumber:8, round:"Group Stage", group:"D", date:"2026-06-13", time:"21:00", homeTeam:"Australia", awayTeam:"Turkey", stadiumSlug:"bc-place", citySlug:"vancouver" },
  { id:"m09", matchNumber:9, round:"Group Stage", group:"E", date:"2026-06-14", time:"12:00", homeTeam:"Germany", awayTeam:"Curaçao", stadiumSlug:"nrg-stadium", citySlug:"houston" },
  { id:"m10", matchNumber:10, round:"Group Stage", group:"F", date:"2026-06-14", time:"15:00", homeTeam:"Netherlands", awayTeam:"Japan", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m11", matchNumber:11, round:"Group Stage", group:"E", date:"2026-06-14", time:"19:00", homeTeam:"Ivory Coast", awayTeam:"Ecuador", stadiumSlug:"lincoln-financial-field", citySlug:"philadelphia" },
  { id:"m12", matchNumber:12, round:"Group Stage", group:"F", date:"2026-06-14", time:"20:00", homeTeam:"Sweden", awayTeam:"Tunisia", stadiumSlug:"estadio-bbva", citySlug:"monterrey" },
  { id:"m13", matchNumber:13, round:"Group Stage", group:"H", date:"2026-06-15", time:"12:00", homeTeam:"Spain", awayTeam:"Cape Verde", stadiumSlug:"mercedes-benz-stadium", citySlug:"atlanta" },
  { id:"m14", matchNumber:14, round:"Group Stage", group:"G", date:"2026-06-15", time:"15:00", homeTeam:"Belgium", awayTeam:"Egypt", stadiumSlug:"lumen-field", citySlug:"seattle" },
  { id:"m15", matchNumber:15, round:"Group Stage", group:"H", date:"2026-06-15", time:"18:00", homeTeam:"Saudi Arabia", awayTeam:"Uruguay", stadiumSlug:"hard-rock-stadium", citySlug:"miami" },
  { id:"m16", matchNumber:16, round:"Group Stage", group:"G", date:"2026-06-15", time:"18:00", homeTeam:"Iran", awayTeam:"New Zealand", stadiumSlug:"sofi-stadium", citySlug:"los-angeles" },
  { id:"m17", matchNumber:17, round:"Group Stage", group:"I", date:"2026-06-16", time:"15:00", homeTeam:"France", awayTeam:"Senegal", stadiumSlug:"metlife-stadium", citySlug:"new-york-new-jersey" },
  { id:"m18", matchNumber:18, round:"Group Stage", group:"I", date:"2026-06-16", time:"18:00", homeTeam:"Iraq", awayTeam:"Norway", stadiumSlug:"gillette-stadium", citySlug:"boston" },
  { id:"m19", matchNumber:19, round:"Group Stage", group:"J", date:"2026-06-16", time:"20:00", homeTeam:"Argentina", awayTeam:"Algeria", stadiumSlug:"arrowhead-stadium", citySlug:"kansas-city" },
  { id:"m20", matchNumber:20, round:"Group Stage", group:"J", date:"2026-06-16", time:"21:00", homeTeam:"Austria", awayTeam:"Jordan", stadiumSlug:"levis-stadium", citySlug:"san-francisco-bay-area" },
  { id:"m21", matchNumber:21, round:"Group Stage", group:"K", date:"2026-06-17", time:"12:00", homeTeam:"Portugal", awayTeam:"DR Congo", stadiumSlug:"nrg-stadium", citySlug:"houston" },
  { id:"m22", matchNumber:22, round:"Group Stage", group:"L", date:"2026-06-17", time:"15:00", homeTeam:"England", awayTeam:"Croatia", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m23", matchNumber:23, round:"Group Stage", group:"L", date:"2026-06-17", time:"19:00", homeTeam:"Ghana", awayTeam:"Panama", stadiumSlug:"bmo-field", citySlug:"toronto" },
  { id:"m24", matchNumber:24, round:"Group Stage", group:"K", date:"2026-06-17", time:"20:00", homeTeam:"Uzbekistan", awayTeam:"Colombia", stadiumSlug:"estadio-azteca", citySlug:"mexico-city" },
  { id:"m25", matchNumber:25, round:"Group Stage", group:"A", date:"2026-06-18", time:"12:00", homeTeam:"Czech Republic", awayTeam:"South Africa", stadiumSlug:"mercedes-benz-stadium", citySlug:"atlanta" },
  { id:"m26", matchNumber:26, round:"Group Stage", group:"B", date:"2026-06-18", time:"12:00", homeTeam:"Switzerland", awayTeam:"Bosnia and Herzegovina", stadiumSlug:"sofi-stadium", citySlug:"los-angeles" },
  { id:"m27", matchNumber:27, round:"Group Stage", group:"B", date:"2026-06-18", time:"18:00", homeTeam:"Canada", awayTeam:"Qatar", stadiumSlug:"bc-place", citySlug:"vancouver" },
  { id:"m28", matchNumber:28, round:"Group Stage", group:"A", date:"2026-06-18", time:"21:00", homeTeam:"Mexico", awayTeam:"South Korea", stadiumSlug:"estadio-akron", citySlug:"guadalajara" },
  { id:"m29", matchNumber:29, round:"Group Stage", group:"D", date:"2026-06-19", time:"12:00", homeTeam:"United States", awayTeam:"Australia", stadiumSlug:"lumen-field", citySlug:"seattle" },
  { id:"m30", matchNumber:30, round:"Group Stage", group:"C", date:"2026-06-19", time:"18:00", homeTeam:"Scotland", awayTeam:"Morocco", stadiumSlug:"gillette-stadium", citySlug:"boston" },
  { id:"m31", matchNumber:31, round:"Group Stage", group:"C", date:"2026-06-19", time:"21:00", homeTeam:"Brazil", awayTeam:"Haiti", stadiumSlug:"lincoln-financial-field", citySlug:"philadelphia" },
  { id:"m32", matchNumber:32, round:"Group Stage", group:"D", date:"2026-06-19", time:"20:00", homeTeam:"Turkey", awayTeam:"Paraguay", stadiumSlug:"levis-stadium", citySlug:"san-francisco-bay-area" },
  { id:"m33", matchNumber:33, round:"Group Stage", group:"F", date:"2026-06-20", time:"12:00", homeTeam:"Netherlands", awayTeam:"Sweden", stadiumSlug:"nrg-stadium", citySlug:"houston" },
  { id:"m34", matchNumber:34, round:"Group Stage", group:"E", date:"2026-06-20", time:"16:00", homeTeam:"Germany", awayTeam:"Ivory Coast", stadiumSlug:"bmo-field", citySlug:"toronto" },
  { id:"m35", matchNumber:35, round:"Group Stage", group:"E", date:"2026-06-20", time:"19:00", homeTeam:"Ecuador", awayTeam:"Curaçao", stadiumSlug:"arrowhead-stadium", citySlug:"kansas-city" },
  { id:"m36", matchNumber:36, round:"Group Stage", group:"F", date:"2026-06-20", time:"22:00", homeTeam:"Tunisia", awayTeam:"Japan", stadiumSlug:"estadio-bbva", citySlug:"monterrey" },
  { id:"m37", matchNumber:37, round:"Group Stage", group:"H", date:"2026-06-21", time:"12:00", homeTeam:"Spain", awayTeam:"Saudi Arabia", stadiumSlug:"mercedes-benz-stadium", citySlug:"atlanta" },
  { id:"m38", matchNumber:38, round:"Group Stage", group:"G", date:"2026-06-21", time:"15:00", homeTeam:"Belgium", awayTeam:"Iran", stadiumSlug:"sofi-stadium", citySlug:"los-angeles" },
  { id:"m39", matchNumber:39, round:"Group Stage", group:"H", date:"2026-06-21", time:"18:00", homeTeam:"Uruguay", awayTeam:"Cape Verde", stadiumSlug:"hard-rock-stadium", citySlug:"miami" },
  { id:"m40", matchNumber:40, round:"Group Stage", group:"G", date:"2026-06-21", time:"21:00", homeTeam:"New Zealand", awayTeam:"Egypt", stadiumSlug:"bc-place", citySlug:"vancouver" },
  { id:"m41", matchNumber:41, round:"Group Stage", group:"J", date:"2026-06-22", time:"12:00", homeTeam:"Argentina", awayTeam:"Austria", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m42", matchNumber:42, round:"Group Stage", group:"I", date:"2026-06-22", time:"17:00", homeTeam:"France", awayTeam:"Iraq", stadiumSlug:"lincoln-financial-field", citySlug:"philadelphia" },
  { id:"m43", matchNumber:43, round:"Group Stage", group:"I", date:"2026-06-22", time:"20:00", homeTeam:"Norway", awayTeam:"Senegal", stadiumSlug:"metlife-stadium", citySlug:"new-york-new-jersey" },
  { id:"m44", matchNumber:44, round:"Group Stage", group:"J", date:"2026-06-22", time:"20:00", homeTeam:"Jordan", awayTeam:"Algeria", stadiumSlug:"levis-stadium", citySlug:"san-francisco-bay-area" },
  { id:"m45", matchNumber:45, round:"Group Stage", group:"K", date:"2026-06-23", time:"12:00", homeTeam:"Portugal", awayTeam:"Uzbekistan", stadiumSlug:"nrg-stadium", citySlug:"houston" },
  { id:"m46", matchNumber:46, round:"Group Stage", group:"L", date:"2026-06-23", time:"16:00", homeTeam:"England", awayTeam:"Ghana", stadiumSlug:"gillette-stadium", citySlug:"boston" },
  { id:"m47", matchNumber:47, round:"Group Stage", group:"L", date:"2026-06-23", time:"19:00", homeTeam:"Panama", awayTeam:"Croatia", stadiumSlug:"bmo-field", citySlug:"toronto" },
  { id:"m48", matchNumber:48, round:"Group Stage", group:"K", date:"2026-06-23", time:"20:00", homeTeam:"Colombia", awayTeam:"DR Congo", stadiumSlug:"estadio-akron", citySlug:"guadalajara" },
  { id:"m49", matchNumber:49, round:"Group Stage", group:"B", date:"2026-06-24", time:"12:00", homeTeam:"Switzerland", awayTeam:"Canada", stadiumSlug:"bc-place", citySlug:"vancouver" },
  { id:"m50", matchNumber:50, round:"Group Stage", group:"B", date:"2026-06-24", time:"12:00", homeTeam:"Bosnia and Herzegovina", awayTeam:"Qatar", stadiumSlug:"lumen-field", citySlug:"seattle" },
  { id:"m51", matchNumber:51, round:"Group Stage", group:"C", date:"2026-06-24", time:"18:00", homeTeam:"Scotland", awayTeam:"Brazil", stadiumSlug:"hard-rock-stadium", citySlug:"miami" },
  { id:"m52", matchNumber:52, round:"Group Stage", group:"C", date:"2026-06-24", time:"18:00", homeTeam:"Morocco", awayTeam:"Haiti", stadiumSlug:"mercedes-benz-stadium", citySlug:"atlanta" },
  { id:"m53", matchNumber:53, round:"Group Stage", group:"A", date:"2026-06-24", time:"19:00", homeTeam:"Czech Republic", awayTeam:"Mexico", stadiumSlug:"estadio-azteca", citySlug:"mexico-city" },
  { id:"m54", matchNumber:54, round:"Group Stage", group:"A", date:"2026-06-24", time:"19:00", homeTeam:"South Africa", awayTeam:"South Korea", stadiumSlug:"estadio-bbva", citySlug:"monterrey" },
  { id:"m55", matchNumber:55, round:"Group Stage", group:"E", date:"2026-06-25", time:"16:00", homeTeam:"Ecuador", awayTeam:"Germany", stadiumSlug:"metlife-stadium", citySlug:"new-york-new-jersey" },
  { id:"m56", matchNumber:56, round:"Group Stage", group:"E", date:"2026-06-25", time:"16:00", homeTeam:"Curaçao", awayTeam:"Ivory Coast", stadiumSlug:"lincoln-financial-field", citySlug:"philadelphia" },
  { id:"m57", matchNumber:57, round:"Group Stage", group:"F", date:"2026-06-25", time:"18:00", homeTeam:"Japan", awayTeam:"Sweden", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m58", matchNumber:58, round:"Group Stage", group:"F", date:"2026-06-25", time:"18:00", homeTeam:"Tunisia", awayTeam:"Netherlands", stadiumSlug:"arrowhead-stadium", citySlug:"kansas-city" },
  { id:"m59", matchNumber:59, round:"Group Stage", group:"D", date:"2026-06-25", time:"19:00", homeTeam:"Turkey", awayTeam:"United States", stadiumSlug:"sofi-stadium", citySlug:"los-angeles" },
  { id:"m60", matchNumber:60, round:"Group Stage", group:"D", date:"2026-06-25", time:"19:00", homeTeam:"Paraguay", awayTeam:"Australia", stadiumSlug:"levis-stadium", citySlug:"san-francisco-bay-area" },
  { id:"m61", matchNumber:61, round:"Group Stage", group:"I", date:"2026-06-26", time:"15:00", homeTeam:"Norway", awayTeam:"France", stadiumSlug:"gillette-stadium", citySlug:"boston" },
  { id:"m62", matchNumber:62, round:"Group Stage", group:"I", date:"2026-06-26", time:"15:00", homeTeam:"Senegal", awayTeam:"Iraq", stadiumSlug:"bmo-field", citySlug:"toronto" },
  { id:"m63", matchNumber:63, round:"Group Stage", group:"H", date:"2026-06-26", time:"19:00", homeTeam:"Cape Verde", awayTeam:"Saudi Arabia", stadiumSlug:"nrg-stadium", citySlug:"houston" },
  { id:"m64", matchNumber:64, round:"Group Stage", group:"H", date:"2026-06-26", time:"20:00", homeTeam:"Uruguay", awayTeam:"Spain", stadiumSlug:"estadio-akron", citySlug:"guadalajara" },
  { id:"m65", matchNumber:65, round:"Group Stage", group:"G", date:"2026-06-26", time:"20:00", homeTeam:"Egypt", awayTeam:"Iran", stadiumSlug:"lumen-field", citySlug:"seattle" },
  { id:"m66", matchNumber:66, round:"Group Stage", group:"G", date:"2026-06-26", time:"20:00", homeTeam:"New Zealand", awayTeam:"Belgium", stadiumSlug:"bc-place", citySlug:"vancouver" },
  { id:"m67", matchNumber:67, round:"Group Stage", group:"L", date:"2026-06-27", time:"17:00", homeTeam:"Panama", awayTeam:"England", stadiumSlug:"metlife-stadium", citySlug:"new-york-new-jersey" },
  { id:"m68", matchNumber:68, round:"Group Stage", group:"L", date:"2026-06-27", time:"17:00", homeTeam:"Croatia", awayTeam:"Ghana", stadiumSlug:"lincoln-financial-field", citySlug:"philadelphia" },
  { id:"m69", matchNumber:69, round:"Group Stage", group:"K", date:"2026-06-27", time:"19:30", homeTeam:"Colombia", awayTeam:"Portugal", stadiumSlug:"hard-rock-stadium", citySlug:"miami" },
  { id:"m70", matchNumber:70, round:"Group Stage", group:"K", date:"2026-06-27", time:"19:30", homeTeam:"DR Congo", awayTeam:"Uzbekistan", stadiumSlug:"mercedes-benz-stadium", citySlug:"atlanta" },
  { id:"m71", matchNumber:71, round:"Group Stage", group:"J", date:"2026-06-27", time:"22:00", homeTeam:"Algeria", awayTeam:"Austria", stadiumSlug:"arrowhead-stadium", citySlug:"kansas-city" },
  { id:"m72", matchNumber:72, round:"Group Stage", group:"J", date:"2026-06-27", time:"22:00", homeTeam:"Jordan", awayTeam:"Argentina", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m73", matchNumber:73, round:"Round of 32", date:"2026-06-28", time:"15:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"sofi-stadium", citySlug:"los-angeles" },
  { id:"m74", matchNumber:74, round:"Round of 32", date:"2026-06-29", time:"13:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"nrg-stadium", citySlug:"houston" },
  { id:"m75", matchNumber:75, round:"Round of 32", date:"2026-06-29", time:"16:30", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"gillette-stadium", citySlug:"boston" },
  { id:"m76", matchNumber:76, round:"Round of 32", date:"2026-06-29", time:"19:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"estadio-bbva", citySlug:"monterrey" },
  { id:"m77", matchNumber:77, round:"Round of 32", date:"2026-06-30", time:"13:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m78", matchNumber:78, round:"Round of 32", date:"2026-06-30", time:"17:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"metlife-stadium", citySlug:"new-york-new-jersey" },
  { id:"m79", matchNumber:79, round:"Round of 32", date:"2026-06-30", time:"19:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"estadio-azteca", citySlug:"mexico-city" },
  { id:"m80", matchNumber:80, round:"Round of 32", date:"2026-07-01", time:"12:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"mercedes-benz-stadium", citySlug:"atlanta" },
  { id:"m81", matchNumber:81, round:"Round of 32", date:"2026-07-01", time:"17:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"levis-stadium", citySlug:"san-francisco-bay-area" },
  { id:"m82", matchNumber:82, round:"Round of 32", date:"2026-07-01", time:"13:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"lumen-field", citySlug:"seattle" },
  { id:"m83", matchNumber:83, round:"Round of 32", date:"2026-07-02", time:"15:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"sofi-stadium", citySlug:"los-angeles" },
  { id:"m84", matchNumber:84, round:"Round of 32", date:"2026-07-02", time:"19:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"bmo-field", citySlug:"toronto" },
  { id:"m85", matchNumber:85, round:"Round of 32", date:"2026-07-02", time:"20:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"bc-place", citySlug:"vancouver" },
  { id:"m86", matchNumber:86, round:"Round of 32", date:"2026-07-03", time:"14:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m87", matchNumber:87, round:"Round of 32", date:"2026-07-03", time:"18:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"hard-rock-stadium", citySlug:"miami" },
  { id:"m88", matchNumber:88, round:"Round of 32", date:"2026-07-03", time:"21:30", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"arrowhead-stadium", citySlug:"kansas-city" },
  { id:"m89", matchNumber:89, round:"Round of 16", date:"2026-07-04", time:"13:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"nrg-stadium", citySlug:"houston" },
  { id:"m90", matchNumber:90, round:"Round of 16", date:"2026-07-04", time:"17:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"lincoln-financial-field", citySlug:"philadelphia" },
  { id:"m91", matchNumber:91, round:"Round of 16", date:"2026-07-05", time:"16:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"metlife-stadium", citySlug:"new-york-new-jersey" },
  { id:"m92", matchNumber:92, round:"Round of 16", date:"2026-07-05", time:"18:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"estadio-azteca", citySlug:"mexico-city" },
  { id:"m93", matchNumber:93, round:"Round of 16", date:"2026-07-06", time:"15:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m94", matchNumber:94, round:"Round of 16", date:"2026-07-06", time:"17:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"lumen-field", citySlug:"seattle" },
  { id:"m95", matchNumber:95, round:"Round of 16", date:"2026-07-07", time:"12:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"mercedes-benz-stadium", citySlug:"atlanta" },
  { id:"m96", matchNumber:96, round:"Round of 16", date:"2026-07-07", time:"16:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"bc-place", citySlug:"vancouver" },
  { id:"m97", matchNumber:97, round:"Quarterfinal", date:"2026-07-09", time:"16:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"gillette-stadium", citySlug:"boston" },
  { id:"m98", matchNumber:98, round:"Quarterfinal", date:"2026-07-10", time:"15:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"sofi-stadium", citySlug:"los-angeles" },
  { id:"m99", matchNumber:99, round:"Quarterfinal", date:"2026-07-11", time:"17:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"hard-rock-stadium", citySlug:"miami" },
  { id:"m100", matchNumber:100, round:"Quarterfinal", date:"2026-07-11", time:"21:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"arrowhead-stadium", citySlug:"kansas-city" },
  { id:"m101", matchNumber:101, round:"Semi-final", date:"2026-07-14", time:"15:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"att-stadium", citySlug:"dallas" },
  { id:"m102", matchNumber:102, round:"Semi-final", date:"2026-07-15", time:"15:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"mercedes-benz-stadium", citySlug:"atlanta" },
  { id:"m103", matchNumber:103, round:"3rd Place", date:"2026-07-18", time:"17:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"hard-rock-stadium", citySlug:"miami" },
  { id:"m104", matchNumber:104, round:"Final", date:"2026-07-19", time:"15:00", homeTeam:"TBD", awayTeam:"TBD", stadiumSlug:"metlife-stadium", citySlug:"new-york-new-jersey" },
]

export function getMatchesByCity(citySlug: string): Match[] {
  return matches.filter((m) => m.citySlug === citySlug)
}

export function getMatchesByStadium(stadiumSlug: string): Match[] {
  return matches.filter((m) => m.stadiumSlug === stadiumSlug)
}

function slugifyName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function slugForMatch(m: Match): string {
  if (m.homeTeam === "TBD" || m.awayTeam === "TBD") {
    return `${slugifyName(m.round)}-match-${m.matchNumber}`
  }
  return `${slugifyName(m.homeTeam)}-vs-${slugifyName(m.awayTeam)}-${m.matchNumber}`
}

export function getMatchBySlug(slug: string): Match | undefined {
  return matches.find((m) => slugForMatch(m) === slug)
}

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id)
}
