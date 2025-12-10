import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.json({ error: `Twitch OAuth error: ${error}` }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const redirectUri = process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/twitch/callback`
    : ""

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Missing Twitch credentials" }, { status: 500 })
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      return NextResponse.json({ error: tokenData.message || "Failed to exchange code" }, { status: 400 })
    }

    // Return tokens to user (they should store these securely)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitch OAuth Success</title>
          <style>
            body { font-family: system-ui; background: #0e0e10; color: white; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #9146FF; }
            pre { background: #1f1f23; padding: 16px; border-radius: 8px; overflow-x: auto; }
            code { color: #efeff1; }
            .warning { color: #ffb31a; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Twitch OAuth Success!</h1>
            <p>Here are your tokens. Store them securely as environment variables:</p>
            <pre><code>TWITCH_ACCESS_TOKEN=${tokenData.access_token}

TWITCH_REFRESH_TOKEN=${tokenData.refresh_token}</code></pre>
            <p class="warning">Warning: These tokens are sensitive. Do not share them publicly.</p>
            <p>Token expires in: ${tokenData.expires_in} seconds</p>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } },
    )
  } catch (err) {
    return NextResponse.json({ error: "Failed to complete OAuth flow" }, { status: 500 })
  }
}
