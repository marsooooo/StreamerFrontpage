import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const youtubeChannelId = process.env.YOUTUBE_USER_ID

    if (!apiKey || !youtubeChannelId) {
      return NextResponse.json({ error: "Missing parameters or credentials" }, { status: 400 })
    }

    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${youtubeChannelId}&key=${apiKey}`
    const channelResponse = await fetch(channelUrl)
    const channelData = await channelResponse.json()

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads
    const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${apiKey}`
    const videosResponse = await fetch(videosUrl)
    const videosData = await videosResponse.json()

    if (!videosData.items || videosData.items.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    const videos = videosData.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch YouTube videos" }, { status: 500 })
  }
}
