"use client"

import { useState, useEffect } from "react"
import { fetchSheetNames, fetchSheetData } from "../api/client"

type MarbleData = {
  displayname: string
  originalRank: number
  wins: number
  points: number
  totalRaces: number
}

interface MarbleLeaderboardProps {
  onPlayerCountChange?: (count: number) => void
}

export default function MarbleLeaderboard({ onPlayerCountChange }: MarbleLeaderboardProps) {
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState<MarbleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const sheets = await fetchSheetNames()
        setAvailableSheets(sheets)
        if (sheets.length > 0) {
          setSelectedSheet(sheets[0])
        }
      } catch (err) {
        console.error("Error fetching sheet names:", err)
      }
    }
    fetchSheets()
  }, [])

  useEffect(() => {
    if (!selectedSheet) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const parsed = await fetchSheetData(selectedSheet)
        setData(parsed)
        onPlayerCountChange?.(parsed.length)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedSheet, onPlayerCountChange])

  const filteredData = data
    .filter((player) => player.displayname.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.originalRank - b.originalRank)

  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Classement <span className="text-purple-400">Marble</span>
          </h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <select
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-auto"
              disabled={availableSheets.length === 0}
            >
              {availableSheets.length === 0 ? (
                <option>Chargement...</option>
              ) : (
                availableSheets.map((sheetName) => (
                  <option key={sheetName} value={sheetName}>
                    {sheetName}
                  </option>
                ))
              )}
            </select>

            <input
              type="text"
              placeholder="Rechercher un joueur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-64"
            />
          </div>

          {loading && (
            <div className="text-center text-white py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4">Chargement des données...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-white px-6 py-4 rounded-lg text-center">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="bg-gray-800/50 backdrop-blur rounded-xl shadow-2xl overflow-hidden border border-white/5">
              <div className={`${filteredData.length > 50 ? "max-h-[70vh] overflow-y-auto" : ""}`}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[300px]">
                    <thead className="bg-purple-900/80 sticky top-0 backdrop-blur-md z-10">
                      <tr>
                        <th className="px-2 py-3 md:px-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Rang
                        </th>
                        <th className="px-2 py-3 md:px-3 md:py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Joueur
                        </th>
                        <th className="px-1 py-3 md:px-3 md:py-4 text-center text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Vict.
                        </th>
                        <th className="px-1 py-3 md:px-3 md:py-4 text-center text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Pts
                        </th>
                        <th className="px-3 py-4 text-center text-xs md:text-sm font-semibold text-white uppercase tracking-wider hidden sm:table-cell">
                          Courses
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredData.map((player) => {
                        const rank = player.originalRank
                        const isMedal = rank <= 3
                        return (
                          <tr
                            key={player.displayname}
                            className={`hover:bg-white/5 transition-colors ${
                              isMedal ? "bg-gradient-to-r from-purple-500/10 to-transparent" : ""
                            }`}
                          >
                            <td className="px-2 py-3 md:px-3 md:py-4">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full font-bold text-xs md:text-sm ${
                                  rank === 1
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : rank === 2
                                      ? "bg-gray-400/20 text-gray-300"
                                      : rank === 3
                                        ? "bg-orange-500/20 text-orange-400"
                                        : "text-gray-500"
                                }`}
                              >
                                {rank}
                              </span>
                            </td>
                            <td className="px-2 py-3 md:px-3 md:py-4">
                              <div className="text-white font-medium text-sm md:text-base break-words whitespace-normal max-w-[120px] sm:max-w-none leading-tight">
                                {player.displayname}
                              </div>
                            </td>
                            <td className="px-1 py-3 md:px-3 md:py-4 text-center text-purple-300 font-bold text-sm md:text-base">
                              {player.wins}
                            </td>
                            <td className="px-1 py-3 md:px-3 md:py-4 text-center text-green-400 font-bold text-sm md:text-base whitespace-nowrap">
                              {player.points}
                            </td>
                            <td className="px-3 py-3 md:py-4 text-center text-gray-400 hidden sm:table-cell">
                              {player.totalRaces}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
