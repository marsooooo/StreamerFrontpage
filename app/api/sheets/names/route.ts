import { NextResponse } from "next/server"

interface CacheEntry {
  data: string[]
  timestamp: number
}

let cache: CacheEntry | null = null
const CACHE_TTL = 60 * 1000 // 60 seconds

export async function GET() {
  try {
    // Return cached data if valid
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({ sheets: cache.data, cached: true })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!apiKey || !sheetId) {
      return NextResponse.json({ error: "Missing API credentials" }, { status: 500 })
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
    const response = await fetch(url)
    const result = await response.json()

    if (result.sheets) {
      const sheets = result.sheets.map((sheet: any) => sheet.properties.title)
      // Store in cache
      cache = { data: sheets, timestamp: Date.now() }
      return NextResponse.json({ sheets })
    } else {
      return NextResponse.json({ error: "No sheets found" }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sheets" }, { status: 500 })
  }
}
