import React, { useState, useRef } from 'react'
const API_URL = import.meta.env.VITE_API_URL

// Helper function to sleep (to avoid rate-limiting)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function ManualTrigger() {
  const [day, setDay] = useState('')
  const [logs, setLogs] = useState([])
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  // Use a ref to check if the user clicked "stop"
  const isRunning = useRef(false);

  const startUpdate = async () => {
    setIsLoading(true)
    isRunning.current = true;
    setLogs([`Starting update for day ${day}...`])
    setProgress(0)
    
    try {
      // 1. Get all users
      setLogs(l => [...l, 'Fetching user list...'])
      const userRes = await fetch(`${API_URL}/api/admin/users`)
      const users = await userRes.json()
      if (!users || users.length === 0) throw new Error("No users found.");
      setLogs(l => [...l, `Found ${users.length} users.`])

      // 2. Loop through each user and call the update endpoint
      let processedCount = 0
      for (const user of users) {
        // Check if user clicked stop
        if (!isRunning.current) {
          setLogs(l => [...l, 'Update stopped by user.']);
          break;
        }

        try {
          const res = await fetch(`${API_URL}/api/admin/update-user-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, day: parseInt(day) }),
          })
          const data = await res.json()
          
          if (!res.ok) {
            setLogs(l => [...l, `[FAIL] ${user.username}: ${data.error || 'Unknown error'}`])
          } else {
            setLogs(l => [...l, `[SUCCESS] ${user.username}: +${data.points_added} pts, streak: ${data.new_streak}`])
          }
        } catch (err) {
          setLogs(l => [...l, `[ERROR] ${user.username}: ${err.message}`])
        }
        
        processedCount++
        setProgress((processedCount / users.length) * 100)
        
        // Add a small delay to avoid rate-limiting the LeetCode API
        await sleep(2400); // 50ms delay between users
      }
      if (isRunning.current) {
        setLogs(l => [...l, 'Update complete!']);
      }
    } catch (err) {
      setLogs(l => [...l, `[FATAL ERROR] ${err.message}`])
    } finally {
      setIsLoading(false)
      isRunning.current = false;
    }
  }
  
  const stopUpdate = () => {
    isRunning.current = false;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-orange-400">Manual Leaderboard Update</h3>
      <input
        type="number"
        placeholder="Enter day to process (e.g., 1)"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className="p-3 bg-gray-700 rounded-lg text-white"
        disabled={isLoading}
      />
      
      {!isLoading && (
        <button onClick={startUpdate} disabled={!day} className="p-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition disabled:bg-gray-500">
          Start Daily Update
        </button>
      )}
      
      {isLoading && (
         <button onClick={stopUpdate} className="p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
          Stop Update
        </button>
      )}

      {/* Progress Bar */}
      {isLoading && (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-cyan-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg max-h-60 overflow-y-auto text-sm font-mono">
          {logs.map((log, index) => (
            <p key={index} className={log.startsWith('[FAIL]') || log.startsWith('[ERROR]') ? 'text-red-400' : 'text-gray-300'}>
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}