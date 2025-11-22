"use client"

import { useState, useMemo, useEffect } from "react"
import TwitchStream from "./components/twitch-stream"
import MarbleLeaderboard from "./components/marble-leaderboard"
import EmotesSection from "./components/emotes-section"
import LatestContent from "./components/latest-content"
import NavTabs from "./components/nav-tabs"
import { AnimatedBackground } from "./components/animated-background"

export default function App() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "emotes" | "latest">("leaderboard")
  const [playerCount, setPlayerCount] = useState(0)

  const [navReady, setNavReady] = useState(false)
  const [contentReady, setContentReady] = useState(false)

  const showTabs = useMemo(() => playerCount > 20, [playerCount])

  useEffect(() => {
    // Load navigation/structure first
    const navTimer = setTimeout(() => {
      setNavReady(true)
    }, 100)

    return () => clearTimeout(navTimer)
  }, [])

  useEffect(() => {
    if (navReady) {
      // Load heavy content after navigation is ready
      const contentTimer = setTimeout(() => {
        setContentReady(true)
      }, 800) // Slightly longer delay to ensure distinct steps
      return () => clearTimeout(contentTimer)
    }
  }, [navReady])

  return (
    <div className="min-h-screen relative overflow-x-hidden text-white">
      <AnimatedBackground />

      <div className="relative z-10 pb-20">
        <div
          className={`transition-all duration-700 z-50 relative ${navReady ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
        >
          {showTabs && <NavTabs activeTab={activeTab} onTabChange={setActiveTab} showTabs={showTabs} />}
        </div>

        <div className={`transition-opacity duration-1000 delay-300 ${navReady ? "opacity-100" : "opacity-0"}`}>
          <TwitchStream />
        </div>

        {/* Main content loads last to prevent pop-in/jank */}
        <main
          className={`transition-all duration-700 ${contentReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {contentReady ? (
            <>
              {(!showTabs || activeTab === "leaderboard") && <MarbleLeaderboard onPlayerCountChange={setPlayerCount} />}
              {(!showTabs || activeTab === "emotes") && <EmotesSection />}
              {(!showTabs || activeTab === "latest") && <LatestContent />}
            </>
          ) : (
            <div className="h-[200px] w-full flex flex-col items-center justify-center text-white/20 gap-4">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-sm animate-pulse">Chargement du contenu...</p>
            </div>
          )}
        </main>

        <footer className="mt-16 pb-8 flex items-center justify-center gap-3 text-sm font-medium text-white/30">
          <span>Développé par marso</span>
          <a
            href="https://x.com/marso__"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-300"
            aria-label="X (formerly Twitter)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </footer>
      </div>
    </div>
  )
}
