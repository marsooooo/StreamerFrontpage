"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavTabsProps {
  activeTab: "top" | "lol" | "leaderboard" | "emotes" | "latest"
  onTabChange: (tab: "top" | "lol" | "leaderboard" | "emotes" | "latest") => void
  showTabs: boolean
}

export default function NavTabs({ activeTab, onTabChange, showTabs }: NavTabsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!showTabs) return null

  const tabs = [
    { id: "top", label: "Top" },
    { id: "lol", label: "LoL" },
    { id: "leaderboard", label: "Marble" },
    { id: "emotes", label: "Emotes" },
    { id: "latest", label: "Contenus" },
  ] as const

  return (
    <nav className="px-4 mb-8">
      {/* Desktop */}
      <div className="hidden md:flex justify-center mt-8">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/5",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 h-10 w-10"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menu</span>
          </Button>
        </div>

        {isOpen && (
          <div className="fixed top-16 right-4 z-40 animate-in slide-in-from-top-2 fade-in duration-150">
            <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg p-2 flex flex-col gap-1 min-w-[140px]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 text-left",
                    activeTab === tab.id
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5",
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
