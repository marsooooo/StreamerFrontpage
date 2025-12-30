import { NextResponse } from "next/server"
import { corsHeaders } from "@/lib/cors"
import { twitchFetch, validateToken, getValidAccessToken } from "@/lib/twitch"

// Server-side cache (shared across all users)
let cache: { data: TopData | null; timestamp: number } = { data: null, timestamp: 0 }
const CACHE_TTL = 120 * 1000 // 120 seconds

interface TopData {
  topSubgifter: { name: string; count: number } | null
  topCheerer: { name: string; bits: number } | null
  topDonator: { name: string; amount: number } | null
  topViewerLevel: { name: string; uptime: string; messages: number } | null
  rewardRedeemer: { name: string; reward: string } | null
}

export async function GET() {
  try {
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      console.log("Returning cached data")
      return NextResponse.json(cache.data, { headers: corsHeaders() })
    }

    const clientId = process.env.TWITCH_CLIENT_ID
    const broadcasterId = process.env.TWITCH_BROADCASTER_ID
    const wizebotApiKey = process.env.WIZEBOT_API_KEY
    const rewardName = process.env.TWITCH_REWARD_NAME
    const streamlabsApiKey = process.env.STREAMLABS_API_KEY

    console.log("Config - clientId:", !!clientId, "broadcasterId:", broadcasterId, "rewardName:", rewardName)

    const token = await getValidAccessToken()
    if (token) {
      const validation = await validateToken(token)
      if (validation.userId !== broadcasterId) {
        console.log("WARNING: Token userId", validation.userId, "does not match broadcasterId", broadcasterId)
      }
    }

    const topData: TopData = {
      topSubgifter: null,
      topCheerer: null,
      topDonator: null,
      topViewerLevel: null,
      rewardRedeemer: null,
    }

    // 1. Top Subgifter
    if (clientId && broadcasterId) {
      try {
        const gifterCounts: Record<string, { name: string; count: number }> = {}
        let cursor: string | null = null

        do {
          const subUrl =
            "https://api.twitch.tv/helix/subscriptions?broadcaster_id=" +
            broadcasterId +
            "&first=100" +
            (cursor ? "&after=" + cursor : "")
          const subResponse = await twitchFetch(subUrl, clientId)

          if (subResponse.ok) {
            const subData = await subResponse.json()
            console.log("Subs - total:", subData.total, "page count:", subData.data?.length)

            for (const sub of subData.data || []) {
              if (sub.is_gift && sub.gifter_id) {
                if (!gifterCounts[sub.gifter_id]) {
                  gifterCounts[sub.gifter_id] = { name: sub.gifter_name, count: 0 }
                }
                gifterCounts[sub.gifter_id].count++
              }
            }
            cursor = subData.pagination?.cursor || null
          } else {
            console.log("Subs error:", await subResponse.text())
            break
          }
        } while (cursor)

        const topGifter = Object.values(gifterCounts).sort((a, b) => b.count - a.count)[0]
        if (topGifter) {
          topData.topSubgifter = { name: topGifter.name, count: topGifter.count }
          console.log("Top subgifter:", topGifter.name, "count:", topGifter.count)
        }
      } catch (e) {
        console.error("Subgifter error:", e)
      }
    }

    // 2. Top Cheerer
    if (clientId && broadcasterId) {
      try {
        const now = new Date()
        const parisTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }))
        const startOfMonth = new Date(parisTime.getFullYear(), parisTime.getMonth(), 1, 0, 0, 0)
        const startedAt = startOfMonth.toISOString().replace(/\.\d{3}Z$/, "Z")

        const bitsUrl =
          "https://api.twitch.tv/helix/bits/leaderboard?count=1&period=month&started_at=" +
          encodeURIComponent(startedAt)
        const bitsResponse = await twitchFetch(bitsUrl, clientId)

        if (bitsResponse.ok) {
          const bitsData = await bitsResponse.json()
          console.log("Bits data:", JSON.stringify(bitsData))
          if (bitsData.data && bitsData.data[0]) {
            topData.topCheerer = { name: bitsData.data[0].user_name, bits: bitsData.data[0].score }
          }
        } else {
          console.log("Bits error:", await bitsResponse.text())
        }
      } catch (e) {
        console.error("Bits error:", e)
      }
    }

    // 3. Top Donator - Streamlabs
    if (streamlabsApiKey) {
      try {
        const now = new Date()
        const parisTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }))
        const startOfMonth = new Date(parisTime.getFullYear(), parisTime.getMonth(), 1, 0, 0, 0)
        const afterTimestamp = Math.floor(startOfMonth.getTime() / 1000)

        const streamlabsUrl = "https://streamlabs.com/api/v2.0/donations?currency=EUR&after=" + afterTimestamp
        const streamlabsResponse = await fetch(streamlabsUrl, {
          headers: {
            Authorization: "Bearer " + streamlabsApiKey,
            Accept: "application/json",
          },
        })

        if (streamlabsResponse.ok) {
          const streamlabsData = await streamlabsResponse.json()
          console.log("Streamlabs donations count:", streamlabsData.data?.length || 0)

          const donatorTotals: Record<string, { name: string; amount: number }> = {}

          for (const donation of streamlabsData.data || []) {
            const name = donation.name || "Anonymous"
            const amount = Number.parseFloat(donation.amount) || 0

            if (!donatorTotals[name]) {
              donatorTotals[name] = { name, amount: 0 }
            }
            donatorTotals[name].amount += amount
          }

          const topDonator = Object.values(donatorTotals).sort((a, b) => b.amount - a.amount)[0]

          if (topDonator) {
            topData.topDonator = { name: topDonator.name, amount: Math.round(topDonator.amount * 100) / 100 }
            console.log("Top donator:", topDonator.name, "amount:", topDonator.amount)
          }
        } else {
          const errorText = await streamlabsResponse.text()
          console.log("Streamlabs error:", errorText)
          topData.topDonator = { name: "Erreur API", amount: 0 }
        }
      } catch (e) {
        console.error("Streamlabs error:", e)
        topData.topDonator = { name: "Erreur", amount: 0 }
      }
    } else {
      topData.topDonator = { name: "Non configuré", amount: 0 }
    }

    // 4. Top Viewer Level (Wizebot)
    if (wizebotApiKey) {
      try {
        const uptimeUrl = "https://wapi.wizebot.tv/api/ranking/" + wizebotApiKey + "/top/uptime/month/100"
        const messagesUrl = "https://wapi.wizebot.tv/api/ranking/" + wizebotApiKey + "/top/message/month/100"

        const [uptimeResponse, messagesResponse] = await Promise.all([fetch(uptimeUrl), fetch(messagesUrl)])

        if (uptimeResponse.ok && messagesResponse.ok) {
          const uptimeData = await uptimeResponse.json()
          const messagesData = await messagesResponse.json()

          console.log("Uptime data:", JSON.stringify(uptimeData))
          console.log("Messages data:", JSON.stringify(messagesData))

          const uptimeUsers = new Set<string>()
          const messagesUsers = new Set<string>()
          const userScores: Record<string, { name: string; score: number; uptime: number; messages: number }> = {}

          // Process uptime rankings (rank 1 = 1 point, rank 2 = 2 points, etc.)
          if (uptimeData.list) {
            uptimeData.list.forEach((user: { user_name: string; value: number }, index: number) => {
              const userName = user.user_name.toLowerCase()
              uptimeUsers.add(userName)
              if (!userScores[userName]) {
                userScores[userName] = { name: user.user_name, score: 0, uptime: 0, messages: 0 }
              }
              userScores[userName].score += index + 1 // rank position as points
              userScores[userName].uptime = user.value // uptime in seconds
            })
          }

          // Process messages rankings
          if (messagesData.list) {
            messagesData.list.forEach((user: { user_name: string; value: number }, index: number) => {
              const userName = user.user_name.toLowerCase()
              messagesUsers.add(userName)
              if (!userScores[userName]) {
                userScores[userName] = { name: user.user_name, score: 0, uptime: 0, messages: 0 }
              }
              userScores[userName].score += index + 1 // rank position as points
              userScores[userName].messages = user.value // message count
            })
          }

          const eligibleUsers = Object.values(userScores).filter((user) => {
            const userName = user.name.toLowerCase()
            return uptimeUsers.has(userName) && messagesUsers.has(userName)
          })

          console.log("Total users with scores:", Object.keys(userScores).length)
          console.log("Eligible users (in both lists):", eligibleUsers.length)

          // Find the user with the lowest score (only from eligible users)
          const topViewer = eligibleUsers.sort((a, b) => a.score - b.score)[0]

          if (topViewer) {
            // Convert uptime from seconds to hours and minutes
            const totalMinutes = Math.floor(topViewer.uptime / 60)
            const hours = Math.floor(totalMinutes / 60)
            const minutes = totalMinutes % 60
            const uptimeFormatted = `${hours}h ${minutes}m`

            topData.topViewerLevel = {
              name: topViewer.name,
              uptime: uptimeFormatted,
              messages: topViewer.messages,
            }
            console.log(
              "Top viewer:",
              topViewer.name,
              "score:",
              topViewer.score,
              "uptime:",
              uptimeFormatted,
              "messages:",
              topViewer.messages,
            )
          }
        } else {
          console.log(
            "Wizebot error - uptime status:",
            uptimeResponse.status,
            "messages status:",
            messagesResponse.status,
          )
        }
      } catch (e) {
        console.error("Wizebot error:", e)
      }
    }

    // 5. Reward Redemption
    if (clientId && broadcasterId && rewardName) {
      try {
        const rewardsUrl = "https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=" + broadcasterId
        const rewardsResponse = await twitchFetch(rewardsUrl, clientId)

        if (rewardsResponse.ok) {
          const rewardsData = await rewardsResponse.json()
          const rewardTitles = rewardsData.data?.map((r: { title: string }) => r.title) || []
          console.log("Available rewards:", rewardTitles.join(", "))

          const targetReward = rewardsData.data?.find(
            (r: { title: string }) => r.title.toLowerCase() === rewardName.toLowerCase(),
          )

          if (targetReward) {
            console.log("Found reward:", targetReward.title, "id:", targetReward.id)

            const redemptionsUrl =
              "https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=" +
              broadcasterId +
              "&reward_id=" +
              targetReward.id +
              "&status=FULFILLED&first=1"
            const redemptionsResponse = await twitchFetch(redemptionsUrl, clientId)

            if (redemptionsResponse.status === 403) {
              console.log("Redemptions 403 - cannot access")
              topData.rewardRedeemer = { name: "Non disponible", reward: targetReward.title }
            } else if (redemptionsResponse.ok) {
              const redemptionsData = await redemptionsResponse.json()
              console.log("Redemptions:", JSON.stringify(redemptionsData))
              if (redemptionsData.data && redemptionsData.data[0]) {
                topData.rewardRedeemer = { name: redemptionsData.data[0].user_name, reward: targetReward.title }
              } else {
                topData.rewardRedeemer = { name: "Aucun", reward: targetReward.title }
              }
            }
          } else {
            console.log("Reward not found:", rewardName)
          }
        } else {
          console.log("Rewards error:", await rewardsResponse.text())
        }
      } catch (e) {
        console.error("Reward error:", e)
      }
    }

    console.log("Final topData:", JSON.stringify(topData))
    cache = { data: topData, timestamp: Date.now() }

    return NextResponse.json(topData, { headers: corsHeaders() })
  } catch (error) {
    console.error("Top route error:", error)
    return NextResponse.json({ error: "Failed to fetch top data" }, { status: 500, headers: corsHeaders() })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}
