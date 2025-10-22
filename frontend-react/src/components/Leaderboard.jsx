import React, { useState, useEffect } from 'react'
const API_URL = import.meta.env.VITE_API_URL

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_URL}/api/leaderboard`)
      const data = await res.json()
      setLeaderboard(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    // Refresh leaderboard every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-cyan-400">Leaderboard</h3>
        <button onClick={fetchLeaderboard} disabled={isLoading} className="text-sm text-cyan-400 hover:text-cyan-200 disabled:opacity-50">
          Refresh
        </button>
      </div>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {leaderboard.map((user, index) => (
            <div key={user.username} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              <span className="font-bold text-lg">
                {index + 1}. {user.username}
              </span>
              <div className="text-right">
                <span className="block text-cyan-300">{user.points} pts</span>
                <span className="block text-orange-300 text-sm">{user.streak} day streak</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}