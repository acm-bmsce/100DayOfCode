import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... (fetchLeaderboard logic remains the same) ...
  const fetchLeaderboard = async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      if (!res.ok) { throw new Error('Failed to fetch leaderboard'); }
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) { setError(err.message); console.error('Error fetching leaderboard:', err); } 
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetchLeaderboard(); }, []);


  return (
    // Dark card styling from screenshot
    <div className="bg-slate-800 text-slate-100 p-6 rounded-lg shadow-lg flex flex-col"> 
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <h3 className="text-xl font-bold text-slate-100">Leaderboard</h3>
        <button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="text-cyan-400 hover:text-cyan-300 font-medium px-3 py-1 rounded-md transition-colors duration-200 text-sm" // Adjusted refresh button
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isLoading && <p className="text-slate-400">Loading leaderboard...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <p className="text-slate-400">No participants yet.</p>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.username}
                className="flex items-center justify-between p-3 bg-slate-700 rounded-md shadow-sm border border-slate-600" // Slightly lighter row background
              >
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-lg text-slate-300">{index + 1}.</span>
                  <span className="text-slate-100">{entry.username}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cyan-400 block">{entry.points} pts</span> {/* Accent color for points */}
                  <span className="text-sm text-slate-400">{entry.streak} day streak</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}