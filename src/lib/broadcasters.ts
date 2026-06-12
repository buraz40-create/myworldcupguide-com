import { broadcasters, type CountryBroadcast } from "@/data/broadcasters"
import overrideData from "@/data/matchBroadcasters.json"

type OverrideMap = Record<string, Record<string, string>>
const overrides = ((overrideData as { overrides: OverrideMap }).overrides) ?? {}

// Returns the country-level broadcaster list (always) plus any per-match
// override notes the curator has added for that match.
export function getMatchBroadcasters(matchId: string): {
  countries: CountryBroadcast[]
  notes: Record<string, string>
} {
  return {
    countries: broadcasters,
    notes: overrides[matchId] ?? {},
  }
}
