"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"

interface NavTabsProps {
  activeTab: "leaderboard" | "emotes" | "latest"
  onTabChange: (tab: "leaderboard" | "emotes" | "latest") => void
  showTabs: boolean
}

export default function NavTabs({ activeTab, onTabChange, showTabs }: NavTabsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!showTabs) return null

  const tabs = [
    { id: "leaderboard", label: "Classement Marble" },
    { id: "emotes", label: "Emotes" },
    { id: "latest", label: "Derniers Contenus" },
  ] as const

  return (
    <nav className="px-4 mb-8">
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-center mt-8">
        <div className="flex items-center p-1 space-x-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-6 py-3 rounded-full text-sm font-bold transition-all duration-300",
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation (Custom Overlay) */}
      <div className="md:hidden">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-black/30 backdrop-blur-md rounded-full border border-white/10 p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full text-white hover:bg-white/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="fixed top-20 right-4 w-64 z-40 animate-in slide-in-from-top-5 fade-in duration-200">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all duration-200 w-full text-left",
                    activeTab === tab.id
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/50"
                      : "text-white/70 hover:text-white hover:bg-white/5",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
