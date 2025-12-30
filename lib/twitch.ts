let cachedAccessToken: string | null = null

export async function validateToken(
  token: string,
): Promise<{ valid: boolean; scopes: string[]; userId: string | null }> {
  try {
    const response = await fetch("https://id.twitch.tv/oauth2/validate", {
      headers: { Authorization: "OAuth " + token },
    })
    if (response.ok) {
      const data = await response.json()
      console.log("Token validation - userId:", data.user_id, "login:", data.login, "scopes:", data.scopes)
      return { valid: true, scopes: data.scopes || [], userId: data.user_id }
    }
    const errText = await response.text()
    console.log("Token validation failed:", errText)
    return { valid: false, scopes: [], userId: null }
  } catch (e) {
    console.log("Token validation error:", e)
    return { valid: false, scopes: [], userId: null }
  }
}

export async function refreshTwitchToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const refreshToken = process.env.TWITCH_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("Missing Twitch credentials for token refresh")
    return null
  }

  try {
    console.log("Attempting to refresh Twitch token...")

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      cachedAccessToken = data.access_token
      console.log("Token refreshed successfully and cached in memory")
      console.log(
        data.access_token,
      )
      return data.access_token
    } else {
      const errorData = await response.json()
      console.error("Token refresh failed:", JSON.stringify(errorData))
    }
  } catch (e) {
    console.error("Failed to refresh Twitch token:", e)
  }
  return null
}

export async function getValidAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken
  }
  const envToken = process.env.TWITCH_ACCESS_TOKEN
  if (envToken) {
    return envToken
  }
  return refreshTwitchToken()
}

export function clearCachedToken() {
  cachedAccessToken = null
}

export async function twitchFetch(url: string, clientId: string): Promise<Response> {
  const accessToken = await getValidAccessToken()

  if (!accessToken) {
    throw new Error("No valid Twitch access token available")
  }

  console.log("Making Twitch API request to:", url)

  let response = await fetch(url, {
    headers: {
      "Client-Id": clientId,
      Authorization: "Bearer " + accessToken,
    },
  })

  if (response.status === 401) {
    const errorBody = await response.text()
    console.error("401 Unauthorized error:", errorBody)

    if (errorBody.includes("Missing scope") || errorBody.includes("must match")) {
      console.error("Scope/permission issue - re-authenticate via OAuth app")
      return new Response(errorBody, { status: 401 })
    }

    console.log("Token expired, attempting automatic refresh...")
    clearCachedToken()
    const newToken = await refreshTwitchToken()
    if (newToken) {
      console.log("Retrying request with new token...")
      response = await fetch(url, {
        headers: {
          "Client-Id": clientId,
          Authorization: "Bearer " + newToken,
        },
      })
    } else {
      console.error("Token refresh failed, request will fail")
    }
  }

  return response
}
