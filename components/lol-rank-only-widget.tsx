"use client"
import useSWR from "swr"
import { fetchLoLAccounts } from "@/lib/api-client"

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

export default function LolRankOnlyWidget({ accountIndex }: { accountIndex: number }) {
  const { data, isLoading: loading, error } = useSWR("lol-accounts", fetchLoLAccounts, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
    refreshInterval: 300000,
  })

  const allAccounts = data?.accounts ?? []
  const account = allAccounts[accountIndex - 1]

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

  const ranked = account.rankedSolo

  return (
    <div
      className={`w-full bg-gray-800/80 backdrop-blur rounded-xl border border-white/5 px-6 py-4 flex items-baseline gap-4 ${
        ranked ? `bg-gradient-to-r ${getTierBg(ranked.tier)}` : ""
      }`}
    >
      {ranked ? (
        <>
          <span className="font-bold text-3xl text-white">
            {formatTierRank(ranked.tier, ranked.rank)}
          </span>
          <span className="text-gray-400 text-2xl">{ranked.leaguePoints} LP</span>
          <span className="text-green-400 font-semibold text-xl">{ranked.wins}W</span>
          <span className="text-gray-500 text-xl">/</span>
          <span className="text-red-400 font-semibold text-xl">{ranked.losses}L</span>
        </>
      ) : (
        <span className="text-gray-500 italic text-2xl">Non classé</span>
      )}
    </div>
  )
}
