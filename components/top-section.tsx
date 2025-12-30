"use client"

import useSWR from "swr"
import { fetchTopData, type TopData } from "@/lib/api-client"
import { Gift, Sparkles, Heart, Trophy, Star } from "lucide-react"

export default function TopSection() {
  const { data, error, isLoading } = useSWR<TopData>("top-data", fetchTopData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 120000, // 2 minutes
  })

  if (isLoading) {
    return (
      <section className="px-4 py-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Top du mois</h2>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="px-4 py-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Top du mois</h2>
        <p className="text-center text-white/50">Impossible de charger les données</p>
      </section>
    )
  }

  const topItems = [
    {
      icon: Gift,
      label: "Top Subgifter",
      name: data.topSubgifter?.name,
      value: data.topSubgifter ? `${data.topSubgifter.count} subs offerts` : null,
      color: "from-pink-500 to-purple-500",
      showPlaceholder: !data.topSubgifter,
    },
    {
      icon: Sparkles,
      label: "Top Cheerer",
      name: data.topCheerer?.name,
      value: data.topCheerer ? `${data.topCheerer.bits.toLocaleString()} bits` : null,
      color: "from-purple-500 to-blue-500",
      showPlaceholder: !data.topCheerer,
    },
    {
      icon: Heart,
      label: "Top Donateur",
      name: null,
      value: null,
      color: "from-red-500 to-pink-500",
      placeholder: true,
      placeholderText: "Bientôt disponible",
    },
    {
      icon: Trophy,
      label: "Top Viewer",
      name: data.topViewerLevel?.name,
      value: data.topViewerLevel ? `${data.topViewerLevel.uptime} • ${data.topViewerLevel.messages} msgs` : null,
      color: "from-yellow-500 to-orange-500",
      showPlaceholder: !data.topViewerLevel,
    },
    {
      icon: Star,
      label: data.rewardRedeemer?.reward || "Récompense",
      name: null,
      value: null,
      color: "from-green-500 to-teal-500",
      placeholder: true,
      placeholderText: "Bientôt disponible",
    },
  ]

  return (
    <section className="px-4 py-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Top du mois</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {topItems.map((item, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
          >
            <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${item.color}`} />
            <div className="relative z-10 flex flex-col items-center text-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wide">{item.label}</span>
              {item.placeholder ? (
                <span className="text-sm text-white/40 italic">{item.placeholderText}</span>
              ) : item.name ? (
                <>
                  <span className="font-bold text-white truncate w-full">{item.name}</span>
                  <span className="text-sm text-white/70">{item.value}</span>
                </>
              ) : (
                <span className="text-sm text-white/40 italic">
                  {item.showPlaceholder ? "Non disponible" : "Aucune donnée"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
