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
  matchHistory: MatchResult[]
}

// ---------------------------------------------------------------------------
// Module-level cache — persists for the lifetime of the server process.
// Each account is stored by its 0-based index in RIOT_ACCOUNTS.
// ---------------------------------------------------------------------------
const accountCache = new Map<number, LoLAccountData>()
let ddragonVersion = "15.1.1"
let initialized = false

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes per account cycle
const ACCOUNT_STAGGER  = 60 * 1000      // 1 minute between account starts

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------
async function refreshDDragonVersion(): Promise<void> {
  try {
    const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
    if (!res.ok) return
    const versions: string[] = await res.json()
    if (versions[0]) ddragonVersion = versions[0]
  } catch {
    // keep previous value
  }
}

async function fetchMatchHistory(puuid: string, apiKey: string): Promise<MatchResult[]> {
  try {
    const matchIdsUrl =
      "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" +
      puuid +
      "/ids?queue=420&start=0&count=10&api_key=" +
      apiKey
    const matchIdsRes = await fetch(matchIdsUrl)
    if (!matchIdsRes.ok) return []
    const matchIds: string[] = await matchIdsRes.json()

    const matchResults: MatchResult[] = []
    for (const matchId of matchIds) {
      const matchUrl =
        "https://europe.api.riotgames.com/lol/match/v5/matches/" + matchId + "?api_key=" + apiKey
      const matchRes = await fetch(matchUrl)
      if (!matchRes.ok) continue
      const matchData: MatchData = await matchRes.json()
      const participant = matchData.info.participants.find((p) => p.puuid === puuid)
      if (participant) {
        matchResults.push({ championName: participant.championName, win: participant.win })
      }
    }
    return matchResults
  } catch (error) {
    console.error("Error fetching match history:", error)
    return []
  }
}

async function fetchAccountData(
  gameName: string,
  tagLine: string,
  apiKey: string
): Promise<LoLAccountData | null> {
  try {
    const accountUrl =
      "https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/" +
      encodeURIComponent(gameName) +
      "/" +
      encodeURIComponent(tagLine) +
      "?api_key=" +
      apiKey
    const accountRes = await fetch(accountUrl)
    if (!accountRes.ok) return null
    const accountData: RiotAccount = await accountRes.json()

    const leagueUrl =
      "https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/" +
      accountData.puuid +
      "?api_key=" +
      apiKey
    const leagueRes = await fetch(leagueUrl)
    const leagueData: LeagueEntry[] = leagueRes.ok ? await leagueRes.json() : []

    const summonerUrl =
      "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/" +
      accountData.puuid +
      "?api_key=" +
      apiKey
    const summonerRes = await fetch(summonerUrl)
    const summonerData: SummonerInfo = summonerRes.ok
      ? await summonerRes.json()
      : { profileIconId: 29, summonerLevel: 0 }

    const matchHistory = await fetchMatchHistory(accountData.puuid, apiKey)
    const rankedSolo = leagueData.find((e) => e.queueType === "RANKED_SOLO_5x5")

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
      matchHistory,
    }
  } catch (error) {
    console.error("Error fetching data for " + gameName + "#" + tagLine + ":", error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Background scheduler — one independent loop per account, staggered by 1 min
// ---------------------------------------------------------------------------
function scheduleAccount(index: number, gameName: string, tagLine: string, apiKey: string): void {
  const run = async () => {
    console.log(`[LoL] Refreshing account ${index + 1}: ${gameName}#${tagLine}`)
    const data = await fetchAccountData(gameName, tagLine, apiKey)
    if (data) accountCache.set(index, data)
    setTimeout(run, REFRESH_INTERVAL)
  }

  // Stagger: account 0 → immediate, account 1 → +1 min, account 2 → +2 min, …
  setTimeout(run, index * ACCOUNT_STAGGER)
}

function initializeBackgroundFetches(): void {
  if (initialized) return
  initialized = true

  const apiKey = process.env.RIOT_API_KEY
  const accountsEnv = process.env.RIOT_ACCOUNTS
  if (!apiKey || !accountsEnv) return

  // DDragon version: fetch now, then every 5 minutes
  const versionLoop = async () => {
    await refreshDDragonVersion()
    setTimeout(versionLoop, REFRESH_INTERVAL)
  }
  versionLoop()

  // Per-account loops, staggered
  const accountStrings = accountsEnv.split(",").map((s) => s.trim()).filter(Boolean)
  accountStrings.forEach((accountStr, index) => {
    const parts = accountStr.split("_")
    const gameName = parts[0]
    const tagLine = parts[1]
    if (gameName && tagLine) {
      scheduleAccount(index, gameName, tagLine, apiKey)
    }
  })
}

// ---------------------------------------------------------------------------
// GET handler — just reads from cache, triggers init on first call
// ---------------------------------------------------------------------------
export async function GET() {
  const apiKey = process.env.RIOT_API_KEY
  const accountsEnv = process.env.RIOT_ACCOUNTS

  if (!apiKey) {
    return NextResponse.json({ error: "RIOT_API_KEY not configured" }, { status: 500 })
  }
  if (!accountsEnv) {
    return NextResponse.json({ error: "RIOT_ACCOUNTS not configured" }, { status: 500 })
  }

  // Start background loops on the very first request (no-op afterwards)
  initializeBackgroundFetches()

  // Return accounts in their original RIOT_ACCOUNTS order
  const accountStrings = accountsEnv.split(",").map((s) => s.trim()).filter(Boolean)
  const accounts: LoLAccountData[] = accountStrings
    .map((_, index) => accountCache.get(index))
    .filter((d): d is LoLAccountData => d !== undefined)

  return NextResponse.json({ accounts, version: ddragonVersion })
}
