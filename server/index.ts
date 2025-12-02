import dotenv from "dotenv"
import express from "express"
import cors from "cors"

dotenv.config()

const app = express()
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3001

const originsString = process.env.CORS_ORIGINS || ""
const corsOrigins = originsString.split(",").map((origin) => origin.trim())

const corsOptions = {
  origin: corsOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())

app.get("/api/sheets/names", async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!apiKey || !sheetId) {
      return res.status(500).json({ error: "Missing API credentials" })
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
    const response = await fetch(url)
    const result = await response.json()

    if (result.sheets) {
      const sheets = result.sheets.map((sheet: any) => sheet.properties.title)
      res.json({ sheets })
    } else {
      res.status(404).json({ error: "No sheets found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sheets" })
  }
})

app.get("/api/sheets/data", async (req, res) => {
  try {
    const { sheetName } = req.query
    const apiKey = process.env.GOOGLE_API_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!apiKey || !sheetId || !sheetName) {
      return res.status(400).json({ error: "Missing parameters or credentials" })
    }

    const range = `${sheetName}!A2:Z`
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    const response = await fetch(url)
    const result = await response.json()

    if (result.error) {
      return res.status(400).json({ error: result.error.message })
    }

    const rows = result.values || []
    const parsed = rows
      .map((row: string[], index: number) => ({
        displayname: row[0] || "",
        originalRank: index + 1,
        wins: Number.parseInt(row[2]) || 0,
        points: Number.parseInt(row[3]) || 0,
        totalRaces: Number.parseInt(row[6]) || 0,
      }))
      .filter((item: any) => item.displayname && item.points > 0 && item.totalRaces > 0)

    res.json({ data: parsed })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sheet data" })
  }
})

app.get("/api/youtube/videos", async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const youtubeChannelId = process.env.YOUTUBE_USER_ID

    if (!apiKey || !youtubeChannelId) {
      return res.status(400).json({ error: "Missing parameters or credentials" })
    }

    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${youtubeChannelId}&key=${apiKey}`
    const channelResponse = await fetch(channelUrl)
    const channelData = await channelResponse.json()

    if (!channelData.items || channelData.items.length === 0) {
      return res.status(404).json({ error: "Channel not found" })
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads
    const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${apiKey}`
    const videosResponse = await fetch(videosUrl)
    const videosData = await videosResponse.json()

    if (!videosData.items || videosData.items.length === 0) {
      return res.json({ videos: [] })
    }

    const videos = videosData.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
    }))

    res.json({ videos })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch YouTube videos" })
  }
})

app.get("/api/wizebot/level", async (req, res) => {
  try {
    const apiKey = process.env.WIZEBOT_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: "Missing WIZEBOT_API_KEY" })
    }

    const TOP_TYPE = "level"
    const TOP_SUB_TYPE = "month"
    const LIMIT = 5

    const url = `https://wapi.wizebot.tv/api/ranking/${apiKey}/top/${TOP_TYPE}/${TOP_SUB_TYPE}/${LIMIT}`

    const response = await fetch(url, {
      headers: { accept: "application/json" },
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: "WizeBot API error",
        status: response.status,
      })
    }

    const result = await response.json()
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch WizeBot level ranking" })
  }
})

app.get("/api/twitch/redemptions", async (req, res) => {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID
    const accessToken = process.env.TWITCH_ACCESS_TOKEN
    const broadcasterId = process.env.TWITCH_BROADCASTER_ID
    const rewardId = process.env.TWITCH_REWARD_ID

    if (!clientId || !accessToken || !broadcasterId || !rewardId) {
      return res.status(500).json({ error: "Missing Twitch API credentials" })
    }

    const status = "UNFULFILLED"
    const url = `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${broadcasterId}&reward_id=${rewardId}&status=${status}`

    const response = await fetch(url, {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Twitch API error",
        message: data.message,
      })
    }

    res.json({ redemptions: data.data || [] })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Twitch redemptions" })
  }
})

app.get("/api/twitch/callback", async (req, res) => {
  try {
    const code = req.query.code as string

    if (!code) {
      return res.status(400).json({ error: "Missing OAuth code" })
    }

    const clientId = process.env.TWITCH_CLIENT_ID
    const clientSecret = process.env.TWITCH_CLIENT_SECRET
    const redirectUri = "http://localhost:3001/api/twitch/callback"

    const url = "https://id.twitch.tv/oauth2/token"

    const body = new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    })

    const response = await fetch(url, {
      method: "POST",
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: data })
    }

    console.log("ACCESS TOKEN:", data.access_token)
    console.log("REFRESH TOKEN:", data.refresh_token)

    res.send("Twitch account succesfully connected ! You can now close this page.")
  } catch (error) {
    res.status(500).json({ error: "OAuth callback failed" })
  }
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`)
})
