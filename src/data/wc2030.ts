// 2030 FIFA World Cup facts. Verified known info as of early 2026; items marked
// estimated/proposed are not yet officially fixed by FIFA. Update this file as
// real news lands (draw date, format decision, exact schedule).

export type Milestone = {
  date: string          // ISO or approximate anchor date used for ordering
  label: string
  detail: string
  status: "confirmed" | "expected"
}

export const WC2030 = {
  // Estimated tournament opening. Exact dates not yet fixed by FIFA (typically
  // mid-June). Used for the countdown; clearly labelled as an estimate on-page.
  estimatedOpening: "2030-06-13",
  estimatedFinal: "2030-07-14",

  hostsMain: [
    { name: "Spain", iso2: "es" },
    { name: "Portugal", iso2: "pt" },
    { name: "Morocco", iso2: "ma" },
  ],
  hostsCentenary: [
    { name: "Uruguay", iso2: "uy" },
    { name: "Argentina", iso2: "ar" },
    { name: "Paraguay", iso2: "py" },
  ],

  // Format: 48 teams is the confirmed baseline (as in 2026). A one-off 64-team
  // edition for the centenary was proposed in 2025 and is under FIFA review.
  format: {
    confirmed: 48,
    proposed: 64,
    proposedStatus: "Under review, not confirmed",
  },

  milestones: [
    { date: "2024-12-11", label: "Hosts confirmed", detail: "FIFA Congress ratified Spain, Portugal and Morocco as the main 2030 hosts, with three centenary opening matches in Uruguay, Argentina and Paraguay.", status: "confirmed" as const },
    { date: "2025-03-01", label: "64-team proposal raised", detail: "CONMEBOL floated a one-off expansion to 64 teams to mark 100 years of the World Cup. FIFA agreed to examine it; UEFA and CONCACAF voiced opposition.", status: "confirmed" as const },
    { date: "2027-09-01", label: "Qualifying begins", detail: "Regional qualifying campaigns are expected to get under way across the confederations. Exact windows to be confirmed.", status: "expected" as const },
    { date: "2029-12-01", label: "Final draw", detail: "The group-stage draw is expected in late 2029, once qualifying concludes and the format is locked in.", status: "expected" as const },
    { date: "2030-06-13", label: "Centenary opening", detail: "The tournament is expected to open with celebration matches in South America (starting at Montevideo's Estadio Centenario) before the main event across Spain, Portugal and Morocco.", status: "expected" as const },
    { date: "2030-07-14", label: "The Final", detail: "The 2030 World Cup final is expected in mid-July, most likely in Spain. Venue to be confirmed.", status: "expected" as const },
  ] as Milestone[],
}
