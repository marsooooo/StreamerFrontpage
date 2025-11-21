import dotenv from "dotenv"
import express from "express"
import cors from "cors"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = {
  origin: [
    "https://peaxy.fr",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())

app.get("/api/sheets/names", async (req, res) => {
  try {
    console.log("api/sheets/names")
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
  console.log("api/sheets/data")

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
  console.log("api/youtube/videos")
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
    console.error("YouTube fetch error:", error)
    res.status(500).json({ error: "Failed to fetch YouTube videos" })
  }
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`)
})
