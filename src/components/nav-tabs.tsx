"use client"

interface NavTabsProps {
  activeTab: "leaderboard" | "emotes" | "latest"
  onTabChange: (tab: "leaderboard" | "emotes" | "latest") => void
  showTabs: boolean
}

export default function NavTabs({ activeTab, onTabChange, showTabs }: NavTabsProps) {
  if (!showTabs) return null

  const tabs = [
    { id: "leaderboard", label: "Classement Marble" },
    { id: "emotes", label: "Emotes" },
    { id: "latest", label: "Derniers Contenus" },
  ] as const

  return (
    <nav className="w-full bg-gray-900/95 backdrop-blur sticky top-0 z-40 border-b border-purple-500/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex justify-center gap-2 overflow-x-auto py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
