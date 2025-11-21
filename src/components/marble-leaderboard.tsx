import { useState, useEffect } from 'react'
import { fetchSheetNames, fetchSheetData } from '../api/client'

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
  const [selectedSheet, setSelectedSheet] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
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
        console.error('Error fetching sheet names:', err)
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
        setError(err instanceof Error ? err.message : 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedSheet, onPlayerCountChange])
  
  const filteredData = data
    .filter(player => player.displayname.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.originalRank - b.originalRank)
  
  return (
    <section className="w-full bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Classement <span className="text-purple-400">Marble</span>
          </h2>
          
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
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className={`${filteredData.length > 50 ? 'max-h-screen overflow-y-auto' : ''}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-900 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Rang</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Joueur</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-white">Victoires</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-white">Points</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-white">Courses</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredData.map((player) => {
                        const rank = player.originalRank
                        const isMedal = rank <= 3
                        return (
                          <tr
                            key={player.displayname}
                            className={`hover:bg-gray-750 transition-colors ${
                              isMedal ? 'bg-purple-900/20' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <span
                                className={`font-bold ${
                                  rank === 1
                                    ? 'text-yellow-400 text-xl'
                                    : rank === 2
                                    ? 'text-gray-300 text-lg'
                                    : rank === 3
                                    ? 'text-orange-400 text-lg'
                                    : 'text-gray-400'
                                }`}
                              >
                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white font-medium">{player.displayname}</td>
                            <td className="px-6 py-4 text-center text-purple-300 font-semibold">{player.wins}</td>
                            <td className="px-6 py-4 text-center text-green-400 font-semibold">{player.points}</td>
                            <td className="px-6 py-4 text-center text-gray-300">{player.totalRaces}</td>
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
