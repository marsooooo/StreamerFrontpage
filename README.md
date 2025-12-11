# Streamer Frontpage (Peaxy)

Custom streamer frontpage application providing an interactive hub for viewers. Features live stream embedding, emotes display, marble race leaderboard, and League of Legends rank tracking. Production build available at https://peaxy.fr

## Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS v4** - Utility-first styling
- **SWR** - Data fetching with caching and deduplication

## External APIs

- **Twitch Embed API** - Live stream embedding
- **Google Sheets API** - Marble race leaderboard data
- **YouTube Data API** - Recent channel videos
- **Riot Games API** - League of Legends account ranks and match history
- **Wizebot API** - Viewer level data
- **Twitch API** - Channel redemptions

## API Routes

| Route | Description |
|-------|-------------|
| `/api/lol/accounts` | Fetches LoL ranks and match history (60s cache) |
| `/api/sheets/names` | Lists available Google Sheets (60s cache) |
| `/api/sheets/data` | Fetches leaderboard data from sheets (60s cache) |
| `/api/youtube/videos` | Fetches recent YouTube videos |
| `/api/twitch/callback` | OAuth callback for Twitch authentication |
| `/api/twitch/refresh` | Refreshes Twitch access token |
| `/api/twitch/redemptions` | Fetches channel point redemptions |
| `/api/wizebot/level` | Fetches viewer level from Wizebot |

## Environment Variables

\`\`\`env
#Check .env-dist and oauth/.env-dist
\`\`\`

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

The application will be available at `http://localhost:3000`.

## Features

- **Live Stream** - Embedded Twitch player
- **League of Legends Ranks** - Account ranks with match history (SOLO/DUO queue)
- **Marble Leaderboard** - Google Sheets integration with sorting
- **Latest Content** - Recent YouTube videos
- **Emotes** - Custom channel emotes display
- **OAuth App** - Twitch token management at `/oauth`
