import { NextResponse } from "next/server"

interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

interface LeagueEntry {
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
}

interface SummonerInfo {
  profileIconId: number
  summonerLevel: number
}

interface MatchParticipant {
  puuid: string
  championName: string
  win: boolean
}

interface MatchInfo {
  participants: MatchParticipant[]
}

interface MatchData {
  info: MatchInfo
}

export interface MatchResult {
  championName: string
  win: boolean
}

export interface LoLAccountData {
  gameName: string
  tagLine: string
  profileIconId: number
  summonerLevel: number
  rankedSolo: {
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  } | null
  matchHistory: MatchResult[] // Added match history
}

interface CacheEntry {
  data: LoLAccountData[]
  timestamp: number
}

let cache: CacheEntry | null = null
const CACHE_TTL = 120 * 1000 // 120 seconds

async function fetchMatchHistory(puuid: string, apiKey: string): Promise<MatchResult[]> {
  try {
    // Get last 10 ranked solo queue match IDs
    const matchIdsRes = await fetch(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=10&api_key=${apiKey}`,
    )
    if (!matchIdsRes.ok) return []
    const matchIds: string[] = await matchIdsRes.json()

    // Fetch each match details
    const matchResults: MatchResult[] = []
    for (const matchId of matchIds) {
      const matchRes = await fetch(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`)
      if (!matchRes.ok) continue
      const matchData: MatchData = await matchRes.json()

      // Find the player in participants
      const participant = matchData.info.participants.find((p) => p.puuid === puuid)
      if (participant) {
        matchResults.push({
          championName: participant.championName,
          win: participant.win,
        })
      }
    }
    return matchResults
  } catch (error) {
    console.error("Error fetching match history:", error)
    return []
  }
}

async function fetchAccountData(gameName: string, tagLine: string, apiKey: string): Promise<LoLAccountData | null> {
  try {
    // Step 1: Get PUUID from Riot ID
    const accountRes = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${apiKey}`,
    )
    if (!accountRes.ok) return null
    const accountData: RiotAccount = await accountRes.json()

    // Step 2: Get league entries (ranked data)
    const leagueRes = await fetch(
      `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}?api_key=${apiKey}`,
    )
    const leagueData: LeagueEntry[] = leagueRes.ok ? await leagueRes.json() : []

    // Step 3: Get summoner info (profile icon, level)
    const summonerRes = await fetch(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${apiKey}`,
    )
    const summonerData: SummonerInfo = summonerRes.ok
      ? await summonerRes.json()
      : { profileIconId: 29, summonerLevel: 0 }

    const matchHistory = await fetchMatchHistory(accountData.puuid, apiKey)

    // Find RANKED_SOLO_5x5 entry
    const rankedSolo = leagueData.find((entry) => entry.queueType === "RANKED_SOLO_5x5")

    return {
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      profileIconId: summonerData.profileIconId,
      summonerLevel: summonerData.summonerLevel,
      rankedSolo: rankedSolo
        ? {
            tier: rankedSolo.tier,
            rank: rankedSolo.rank,
            leaguePoints: rankedSolo.leaguePoints,
            wins: rankedSolo.wins,
            losses: rankedSolo.losses,
          }
        : null,
      matchHistory, // Include match history
    }
  } catch (error) {
    console.error(`Error fetching data for ${gameName}#${tagLine}:`, error)
    return null
  }
}

export async function GET() {
  const apiKey = process.env.RIOT_API_KEY
  const accountsEnv = process.env.RIOT_ACCOUNTS

  if (!apiKey) {
    return NextResponse.json({ error: "RIOT_API_KEY not configured" }, { status: 500 })
  }

  if (!accountsEnv) {
    return NextResponse.json({ error: "RIOT_ACCOUNTS not configured" }, { status: 500 })
  }

  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({ accounts: cache.data, cached: true })
  }

  // Parse accounts from env (format: "gameName_tagLine,gameName_tagLine")
  const accountStrings = accountsEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const accounts: LoLAccountData[] = []

  for (const accountStr of accountStrings) {
    const [gameName, tagLine] = accountStr.split("_")
    if (gameName && tagLine) {
      const data = await fetchAccountData(gameName, tagLine, apiKey)
      if (data) {
        accounts.push(data)
      }
    }
  }

  cache = { data: accounts, timestamp: Date.now() }

  return NextResponse.json({ accounts })
}
