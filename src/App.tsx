"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import TwitchStream from "./components/twitch-stream"
import MarbleLeaderboard from "./components/marble-leaderboard"
import EmotesSection from "./components/emotes-section"
import LatestContent from "./components/latest-content"
import NavTabs from "./components/nav-tabs"
import "./animated-background.css"

export default function App() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "emotes" | "latest">("leaderboard")
  const [playerCount, setPlayerCount] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  const showTabs = useMemo(() => playerCount > 20, [playerCount])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div
      className="min-h-screen animated-bg"
      style={
        {
          "--mouse-x": `${mousePos.x}px`,
          "--mouse-y": `${mousePos.y}px`,
          "--scroll-y": `${scrollY}px`,
        } as React.CSSProperties
      }
    >
      <div className="animated-bg-overlay" />

      <div className="relative z-10">
        <TwitchStream />

        {showTabs && <NavTabs activeTab={activeTab} onTabChange={setActiveTab} showTabs={showTabs} />}

        {(!showTabs || activeTab === "leaderboard") && <MarbleLeaderboard onPlayerCountChange={setPlayerCount} />}
        {(!showTabs || activeTab === "emotes") && <EmotesSection />}
        {(!showTabs || activeTab === "latest") && <LatestContent />}
      </div>
    </div>
  )
}
