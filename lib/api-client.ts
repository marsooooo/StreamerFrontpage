interface SheetData {
  displayname: string
  originalRank: number
  wins: number
  points: number
  totalRaces: number
}

export async function fetchSheetNames(): Promise<string[]> {
  const response = await fetch(`/api/sheets/names`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Failed to fetch sheets")
  return result.sheets
}

export async function fetchSheetData(sheetName: string): Promise<SheetData[]> {
  const response = await fetch(`/api/sheets/data?sheetName=${encodeURIComponent(sheetName)}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Failed to fetch data")
  return result.data
}

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
}

export async function fetchYouTubeVideos(youtubeUser: string): Promise<YouTubeVideo[]> {
  const response = await fetch(`/api/youtube/videos?youtubeUser=${encodeURIComponent(youtubeUser)}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Failed to fetch videos")
  return result.videos
}

export interface MatchResult {
  championName: string
  win: boolean
}

export interface LoLAccountData {
  gameName: string
  tagLine: string
  profileIconId: number
  summonerLevel: number
  rankedSolo: {
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  } | null
  matchHistory: MatchResult[] // Added match history
}

export async function fetchLoLAccounts(): Promise<LoLAccountData[]> {
  const response = await fetch(`/api/lol/accounts`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Failed to fetch LoL accounts")
  return result.accounts
}
