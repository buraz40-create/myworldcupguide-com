import data from "@/data/contentVideos.json"

export type ContentVideo = {
  videoId: string
  title: string
  channel: string
  fetchedAt: string
}

type ContentVideosFile = {
  stadiums: Record<string, ContentVideo>
  cities: Record<string, ContentVideo>
  teams: Record<string, ContentVideo>
}

const v = data as ContentVideosFile

export function getStadiumVideo(slug: string): ContentVideo | undefined {
  return v.stadiums[slug]
}
export function getCityVideo(slug: string): ContentVideo | undefined {
  return v.cities[slug]
}
export function getTeamVideo(slug: string): ContentVideo | undefined {
  return v.teams[slug]
}
