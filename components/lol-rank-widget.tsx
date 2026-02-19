"use client"
import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { fetchLoLAccounts, type MatchResult } from "@/lib/api-client"


import Image from "next/image"

declare global {
  interface Window {
    newGame: () => void
  }
}

const DEMO_CHAMPIONS = [
  "Jinx", "Lux", "Ahri", "Zed", "Thresh",
  "Yasuo", "Vi", "Jhin", "Ekko", "Caitlyn",
  "Ezreal", "Leona", "Syndra", "Graves", "Riven",
]

const tiersWithoutDivision = new Set(["CHALLENGER", "GRANDMASTER", "MASTER"])

function formatTierRank(tier: string, rank: string): string {
  return tiersWithoutDivision.has(tier) ? tier : `${tier} ${rank}`
}

function getTierBg(tier: string): string {
  const colors: Record<string, string> = {
    CHALLENGER: "from-yellow-500/20 to-transparent",
    GRANDMASTER: "from-red-500/20 to-transparent",
    MASTER: "from-purple-500/20 to-transparent",
    DIAMOND: "from-cyan-500/20 to-transparent",
    EMERALD: "from-emerald-500/20 to-transparent",
    PLATINUM: "from-teal-500/20 to-transparent",
    GOLD: "from-yellow-600/20 to-transparent",
    SILVER: "from-gray-400/20 to-transparent",
    BRONZE: "from-orange-700/20 to-transparent",
    IRON: "from-stone-500/20 to-transparent",
  }
  return colors[tier] || ""
}

function GameIcon({ match, version, animateIn }: { match: MatchResult; version: string; animateIn?: boolean }) {
  return (
    <div
      className={`relative rounded overflow-hidden border-2 ${
        match.win ? "border-green-500/70" : "border-red-500/70"
      } ${animateIn ? "lol-pop-in" : ""}`}
    >
      <Image
        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${match.championName}.png`}
        alt={match.championName}
        width={28}
        height={28}
        className="block w-full h-auto"
      />
      <div className={`absolute inset-0 ${match.win ? "bg-green-500/30" : "bg-red-500/30"}`} />
    </div>
  )
}

function MatchHistory({
  matches,
  version,
  newGameKey,
  exitingGame,
}: {
  matches: MatchResult[]
  version: string
  newGameKey: number
  exitingGame: MatchResult | null
}) {
  if (matches.length === 0) return null

  return (
    <div className="grid grid-cols-5 gap-1 relative">
      {matches.slice(0, 10).map((match, index) => (
        <div key={index === 0 ? `new-${newGameKey}` : `slot-${index}`}>
          <GameIcon match={match} version={version} animateIn={index === 0 && newGameKey > 0} />
        </div>
      ))}
      {exitingGame && (
        <div className="absolute bottom-0 right-0 lol-pop-out pointer-events-none">
          <GameIcon match={exitingGame} version={version} />
        </div>
      )}
    </div>
  )
}

export default function LolRankWidget({ accountIndex }: { accountIndex: number }) {
  const { data, isLoading: loading, error } = useSWR("lol-accounts", fetchLoLAccounts, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
    refreshInterval: 300000,
  })

  const allAccounts = data?.accounts ?? []
  const version = data?.version ?? "15.1.1"
  const account = allAccounts[accountIndex - 1]

  // Mock matches injected via newGame() in browser console
  const [mockMatches, setMockMatches] = useState<MatchResult[] | null>(null)

  // Effective match history: mock overrides real data
  const realMatches = account?.matchHistory ?? []
  const effectiveMatches: MatchResult[] = mockMatches ?? realMatches

  // Always-current ref so effects don't rely on stale closures
  const effectiveMatchesRef = useRef(effectiveMatches)
  effectiveMatchesRef.current = effectiveMatches

  // Animation state
  const [newGameKey, setNewGameKey] = useState(0)
  const [exitingGame, setExitingGame] = useState<MatchResult | null>(null)

  // Track previous state for diffing
  const prevRef = useRef<{ firstChamp: string | undefined; matches: MatchResult[] }>({
    firstChamp: undefined,
    matches: [],
  })
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect new game by watching the first entry's champion
  const firstChamp = effectiveMatches[0]?.championName

  useEffect(() => {
    const { firstChamp: prevFirst, matches: prevMatches } = prevRef.current

    if (prevFirst !== undefined && prevFirst !== firstChamp) {
      setNewGameKey((k) => k + 1)
      const exiting = prevMatches[prevMatches.length - 1]
      if (exiting) {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
        setExitingGame(exiting)
        exitTimerRef.current = setTimeout(() => setExitingGame(null), 550)
      }
    }

    prevRef.current = { firstChamp, matches: effectiveMatchesRef.current }
  }, [firstChamp]) // eslint-disable-line react-hooks/exhaustive-deps

  // Expose newGame() on window for browser console testing
  useEffect(() => {
    window.newGame = () => {
      const champ = DEMO_CHAMPIONS[Math.floor(Math.random() * DEMO_CHAMPIONS.length)]
      const win = Math.random() > 0.5
      setMockMatches((prev) => {
        const base = prev ?? account?.matchHistory ?? []
        return [{ championName: champ, win }, ...base.slice(0, 9)]
      })
    }
    return () => {
      // @ts-expect-error cleanup
      delete window.newGame
    }
  }, [account?.matchHistory])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-white px-4 py-2 rounded-lg text-sm">
        Erreur de chargement
      </div>
    )
  }

  if (!account) {
    return (
      <div className="text-gray-400 text-sm p-2">
        Compte #{accountIndex} introuvable
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes lolPopIn {
          0%   { transform: scale(0.3); opacity: 0; }
          65%  { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes lolPopOut {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.3); opacity: 0; }
        }
        .lol-pop-in  { animation: lolPopIn  0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .lol-pop-out { animation: lolPopOut 0.5s ease-out forwards; }
      `}</style>

      <div
        className={`w-full bg-gray-800/50 backdrop-blur rounded-xl border border-white/5 p-4 ${
          account.rankedSolo ? `bg-gradient-to-r ${getTierBg(account.rankedSolo.tier)}` : ""
        }`}
      >
        {/* Top row: profile icon + name | rank */}
        <div className="flex items-center gap-3 mb-3">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${account.profileIconId}.png`}
            alt={`${account.gameName} profile icon`}
            width={48}
            height={48}
            className="rounded-full border-2 border-purple-500/50 shrink-0"
          />
          <span className="text-white font-bold text-lg truncate flex-1">{account.gameName}</span>
          <div className="text-right shrink-0">
            {account.rankedSolo ? (
              <>
                <div className="font-bold text-2xl text-white">
                  {formatTierRank(account.rankedSolo.tier, account.rankedSolo.rank)}
                </div>
                <div className="text-gray-400 text-sm">{account.rankedSolo.leaguePoints} LP</div>
                <div className="text-xs mt-1">
                  <span className="text-green-400">{account.rankedSolo.wins}W</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">{account.rankedSolo.losses}L</span>
                </div>
              </>
            ) : (
              <div className="text-gray-500 italic">Non classé</div>
            )}
          </div>
        </div>

        {/* Match history: 2×5 grid */}
        <MatchHistory
          matches={effectiveMatches}
          version={version}
          newGameKey={newGameKey}
          exitingGame={exitingGame}
        />
      </div>
    </>
  )
}
