import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.WIZEBOT_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Missing WIZEBOT_API_KEY" }, { status: 500 })
    }

    const TOP_TYPE = "level"
    const TOP_SUB_TYPE = "month"
    const LIMIT = 5

    const url = "https://wapi.wizebot.tv/api/ranking/" + apiKey + "/top/" + TOP_TYPE + "/" + TOP_SUB_TYPE + "/" + LIMIT

    const response = await fetch(url, {
      headers: { accept: "application/json" },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "WizeBot API error", status: response.status }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch WizeBot level ranking" }, { status: 500 })
  }
}
