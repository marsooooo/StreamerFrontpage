"use client"
import useSWR from "swr"
import { fetchLoLAccounts, type LoLAccountData } from "@/lib/api-client"
import Image from "next/image"

const tierOrder = [
  "CHALLENGER",
  "GRANDMASTER",
  "MASTER",
  "DIAMOND",
  "EMERALD",
  "PLATINUM",
  "GOLD",
  "SILVER",
  "BRONZE",
  "IRON",
]
const rankOrder = ["I", "II", "III", "IV"]

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    CHALLENGER: "text-yellow-300",
    GRANDMASTER: "text-red-400",
    MASTER: "text-purple-400",
    DIAMOND: "text-cyan-400",
    EMERALD: "text-emerald-400",
    PLATINUM: "text-teal-300",
    GOLD: "text-yellow-500",
    SILVER: "text-gray-300",
    BRONZE: "text-orange-600",
    IRON: "text-stone-400",
  }
  return colors[tier] || "text-gray-400"
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

function sortAccounts(accounts: LoLAccountData[]): LoLAccountData[] {
  return [...accounts].sort((a, b) => {
    if (!a.rankedSolo && !b.rankedSolo) return 0
    if (!a.rankedSolo) return 1
    if (!b.rankedSolo) return -1

    const tierDiff = tierOrder.indexOf(a.rankedSolo.tier) - tierOrder.indexOf(b.rankedSolo.tier)
    if (tierDiff !== 0) return tierDiff

    const rankDiff = rankOrder.indexOf(a.rankedSolo.rank) - rankOrder.indexOf(b.rankedSolo.rank)
    if (rankDiff !== 0) return rankDiff

    return b.rankedSolo.leaguePoints - a.rankedSolo.leaguePoints
  })
}

function MatchHistory({ matches }: { matches: LoLAccountData["matchHistory"] }) {
  if (!matches || matches.length === 0) return null

  return (
    <div className="flex items-center gap-1 flex-wrap justify-start">
      {matches.map((match, index) => (
        <div
          key={index}
          className={`relative rounded overflow-hidden border-2 ${
            match.win ? "border-green-500/70" : "border-red-500/70"
          }`}
        >
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/${match.championName}.png`}
            alt={match.championName}
            width={28}
            height={28}
            className="block"
          />
          {/* Win/Loss overlay */}
          <div className={`absolute inset-0 ${match.win ? "bg-green-500/30" : "bg-red-500/30"}`} />
        </div>
      ))}
    </div>
  )
}

export default function LoLRanks() {
  const {
    data: rawAccounts = [],
    isLoading: loading,
    error,
  } = useSWR("lol-accounts", fetchLoLAccounts, { revalidateOnFocus: false, dedupingInterval: 60000 })

  const accounts = sortAccounts(rawAccounts)

  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Rang <span className="text-purple-400">LoL</span>
          </h2>

          {loading && (
            <div className="text-center text-white py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4">Chargement des rangs...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-white px-6 py-4 rounded-lg text-center">
              <p className="font-semibold">Erreur</p>
              <p className="text-sm mt-2">{error instanceof Error ? error.message : "Error loading data"}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4">
              {accounts.map((account) => (
                <div
                  key={`${account.gameName}#${account.tagLine}`}
                  className={`bg-gray-800/50 backdrop-blur rounded-xl border border-white/5 p-4 transition-all hover:bg-gray-800/70 ${
                    account.rankedSolo ? `bg-gradient-to-r ${getTierBg(account.rankedSolo.tier)}` : ""
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Left: Profile icon and name */}
                    <div className="flex items-center gap-3 sm:w-[200px] shrink-0">
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/15.24.1/img/profileicon/${account.profileIconId}.png`}
                        alt={`${account.gameName} profile icon`}
                        width={56}
                        height={56}
                        className="rounded-full border-2 border-purple-500/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-white font-bold text-lg truncate">{account.gameName}</span>
                          <span className="text-gray-500 text-sm">#{account.tagLine}</span>
                        </div>
                        <div className="text-gray-400 text-sm">Niveau {account.summonerLevel}</div>
                      </div>
                    </div>

                    {/* Center: Match history - centered in available space */}
                    <div className="flex-1 flex justify-center order-3 sm:order-2">
                      <MatchHistory matches={account.matchHistory} />
                    </div>

                    {/* Right: Rank info */}
                    <div className="text-left sm:text-right order-2 sm:order-3 sm:w-[120px] shrink-0">
                      {account.rankedSolo ? (
                        <>
                          <div className={`font-bold text-lg ${getTierColor(account.rankedSolo.tier)}`}>
                            {account.rankedSolo.tier} {account.rankedSolo.rank}
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
                </div>
              ))}

              {accounts.length === 0 && <div className="text-center text-gray-400 py-8">Aucun compte configuré</div>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
