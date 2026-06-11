import results from "@/data/matchResults.json"

export type MatchResult = {
  homeScore: number
  awayScore: number
  status: "FT" | "AET" | "PEN" | "live" | "scheduled"
  penaltyHome?: number
  penaltyAway?: number
  videoId?: string
  videoTitle?: string
  videoChannel?: string
  videoFetchedAt?: string
}

const data = results as Record<string, MatchResult>

export function getResult(matchId: string): MatchResult | undefined {
  return data[matchId]
}

export function hasResult(matchId: string): boolean {
  const r = data[matchId]
  return !!r && (r.status === "FT" || r.status === "AET" || r.status === "PEN")
}

export function getAllResults(): Record<string, MatchResult> {
  return data
}
