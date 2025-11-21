const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface SheetData {
  displayname: string
  originalRank: number
  wins: number
  points: number
  totalRaces: number
}

export async function fetchSheetNames(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/sheets/names`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to fetch sheets')
  return result.sheets
}

export async function fetchSheetData(sheetName: string): Promise<SheetData[]> {
  const response = await fetch(`${API_BASE_URL}/api/sheets/data?sheetName=${encodeURIComponent(sheetName)}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to fetch data')
  return result.data
}

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
}

export async function fetchYouTubeVideos(youtubeUser: string): Promise<YouTubeVideo[]> {
  const response = await fetch(`${API_BASE_URL}/api/youtube/videos?youtubeUser=${encodeURIComponent(youtubeUser)}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to fetch videos')
  return result.videos
}
