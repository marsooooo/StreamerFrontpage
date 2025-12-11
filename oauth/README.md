# OAuth - Twitch Authorization Helper

A standalone Next.js app to generate Twitch OAuth tokens for the main application.
NOTE : This app has no need to stay online, terminate once tokens are stored

## Purpose

This app provides a simple UI to authenticate with Twitch and obtain access/refresh tokens required for the main app's Twitch API features (channel point redemptions).

## Required Scopes

- `channel:read:redemptions` - Read channel point redemptions
- `channel:manage:redemptions` - Manage channel point redemptions

## Environment Variables

\`\`\`env
#Check oauth/.env-dist
\`\`\`

## Setup

1. Install dependencies:
\`\`\`bash
cd oauth
npm install
\`\`\`

2. Create `.env.local`:
\`\`\`env
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id
NEXT_PUBLIC_BACKEND_URL=https://yourdomain.com
\`\`\`

3. Run the app (require main app to run at the same time):
\`\`\`bash
npm run dev
\`\`\`

4. Open `http://localhost:3002` and click "Connect with Twitch"

## OAuth Flow

1. User clicks "Connect with Twitch" button
2. Redirects to Twitch authorization page
3. User approves the requested scopes
4. Twitch redirects to `{BACKEND_URL}/api/twitch/callback` with authorization code
5. Main app exchanges code for access/refresh tokens

## Token Endpoints (Main App)

- `GET /api/twitch/callback?code={code}` - Exchange authorization code for tokens
- `POST /api/twitch/refresh` - Refresh expired access token (body: `{ refresh_token }`)

## Notes

- This is a separate app meant to run locally for token generation
- Once you have the tokens, store them securely in your main app's environment variables.
- This app is not supposed to stay online, terminate once tokens are stored
- Tokens can be refreshed using the `/api/twitch/refresh` endpoint as long as the refresh token is still up to date
