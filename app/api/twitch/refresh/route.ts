import { NextResponse } from "next/server"

export async function POST() {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const refreshToken = process.env.TWITCH_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({ error: "Missing Twitch credentials" }, { status: 500 })
  }

  try {
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      return NextResponse.json({ error: tokenData.message || "Failed to refresh token" }, { status: 400 })
    }

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 })
  }
}
