import { NextResponse } from "next/server"
import { refreshTwitchToken } from "@/lib/twitch"

export async function POST() {
  console.log("Manual token refresh requested")
  const newToken = await refreshTwitchToken()

  if (newToken) {
    return NextResponse.json({
      message:
        "Token refreshed successfully and cached. Check server logs for the new token value to update your environment variables.",
      success: true,
    })
  }

  return NextResponse.json({ error: "Failed to refresh token", success: false }, { status: 400 })
}
