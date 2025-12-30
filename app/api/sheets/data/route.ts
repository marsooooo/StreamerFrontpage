import { type NextRequest, NextResponse } from "next/server"

interface SheetData {
  displayname: string
  originalRank: number
  wins: number
  points: number
  totalRaces: number
}

interface CacheEntry {
  data: SheetData[]
  timestamp: number
}

const cache: Map<string, CacheEntry> = new Map()
const CACHE_TTL = 60 * 1000

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams
    const sheetName = searchParams.get("sheetName")
    const apiKey = process.env.GOOGLE_API_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!apiKey || !sheetId || !sheetName) {
      return NextResponse.json({ error: "Missing parameters or credentials" }, { status: 400 })
    }

    const cacheKey = sheetName
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ data: cached.data, cached: true })
    }

    const range = sheetName + "!A2:Z"
    const url =
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      sheetId +
      "/values/" +
      encodeURIComponent(range) +
      "?key=" +
      apiKey
    const response = await fetch(url)
    const result = await response.json()

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const rows = result.values || []
    const seen = new Set<string>()
    const parsed = rows
      .map((row: string[], index: number) => ({
        displayname: row[0] || "",
        originalRank: index + 1,
        wins: Number.parseInt(row[2]) || 0,
        points: Number.parseInt(row[3]) || 0,
        totalRaces: Number.parseInt(row[6]) || 0,
      }))
      .filter((item: SheetData) => {
        if (!item.displayname || item.points <= 0 || item.totalRaces <= 0) return false
        const key = item.displayname.toLowerCase().trim()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

    cache.set(cacheKey, { data: parsed, timestamp: Date.now() })

    return NextResponse.json({ data: parsed })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sheet data" }, { status: 500 })
  }
}
