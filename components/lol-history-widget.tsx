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
        width={40}
        height={40}
        className="block w-full h-auto"
      />
      <div className={`absolute inset-0 ${match.win ? "bg-green-500/30" : "bg-red-500/30"}`} />
    </div>
  )
}

export default function LolHistoryWidget({ accountIndex }: { accountIndex: number }) {
  const { data, isLoading: loading, error } = useSWR("lol-accounts", fetchLoLAccounts, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
    refreshInterval: 300000,
  })

  const allAccounts = data?.accounts ?? []
  const version = data?.version ?? "15.1.1"
  const account = allAccounts[accountIndex - 1]

  const [mockMatches, setMockMatches] = useState<MatchResult[] | null>(null)
  const realMatches = account?.matchHistory ?? []
  const effectiveMatches: MatchResult[] = mockMatches ?? realMatches

  const effectiveMatchesRef = useRef(effectiveMatches)
  effectiveMatchesRef.current = effectiveMatches

  const [newGameKey, setNewGameKey] = useState(0)
  const [exitingGame, setExitingGame] = useState<MatchResult | null>(null)

  const prevRef = useRef<{ firstChamp: string | undefined; matches: MatchResult[] }>({
    firstChamp: undefined,
    matches: [],
  })
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  if (effectiveMatches.length === 0) return null

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

      <div className="w-full bg-gray-800/80 backdrop-blur rounded-xl border border-white/5 p-4">
        <div className="grid grid-cols-10 gap-2 relative">
          {Array.from({ length: 10 }, (_, index) => {
            const match = effectiveMatches[index]
            return match ? (
              <div key={index === 0 ? `new-${newGameKey}` : `slot-${index}`}>
                <GameIcon match={match} version={version} animateIn={index === 0 && newGameKey > 0} />
              </div>
            ) : (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded border-2 border-white/10 bg-white/5"
              />
            )
          })}
          {exitingGame && (
            <div className="absolute top-0 right-0 w-[10%] lol-pop-out pointer-events-none">
              <GameIcon match={exitingGame} version={version} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
