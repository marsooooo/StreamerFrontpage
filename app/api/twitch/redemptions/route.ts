import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID
    const accessToken = process.env.TWITCH_ACCESS_TOKEN
    const broadcasterId = process.env.TWITCH_BROADCASTER_ID

    if (!clientId || !accessToken || !broadcasterId) {
      return NextResponse.json({ error: "Missing Twitch API credentials" }, { status: 500 })
    }

    const url = `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`

    const response = await fetch(url, {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Twitch API error", message: data.message },
        { status: response.status },
      )
    }

    return NextResponse.json({ redemptions: data.data || [] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch Twitch redemptions" }, { status: 500 })
  }
}
