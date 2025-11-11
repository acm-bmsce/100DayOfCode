import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store'; // Import useAuthStore to get the current user
const API_URL = import.meta.env.VITE_API_URL;

export default function Leaderboard() {
  const { username: currentUsername } = useAuthStore(); // Get the logged-in username
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the logged-in user's specific rank data
  const [userRankData, setUserRankData] = useState(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      if (!res.ok) { throw new Error('Failed to fetch leaderboard'); }
      const data = await res.json();
      
      setLeaderboard(data);
      
      // Find the logged-in user's rank and data
      const userIndex = data.findIndex(entry => entry.username === currentUsername);
      if (userIndex !== -1) {
        setUserRankData({
          rank: userIndex + 1,
          ...data[userIndex]
        });
      }

    } catch (err) { 
      setError(err.message); 
      console.error('Error fetching leaderboard:', err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchLeaderboard(); }, [currentUsername]); // Re-fetch if the user changes


  return (
    // Dark card styling from screenshot
    <div className="bg-slate-800 text-slate-100 p-6 rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-15rem)] overflow-y-auto"> 
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
        <div className="space-y-4">
          
          {/* ------------------------------------- */}
          {/* NEW SECTION: LOGGED-IN USER RANK CARD */}
          {/* ------------------------------------- */}
          {userRankData && (
            <div className="bg-green-700/80 p-4 rounded-lg shadow-xl border-2 border-green-400 transform transition-all hover:scale-[1.02] duration-300">
              <h4 className="text-sm font-semibold text-green-200 mb-1">YOUR RANK</h4>
              <div className="flex items-center justify-between">
                
                {/* Rank and Username */}
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-extrabold text-white">{userRankData.rank}.</span>
                  <span className="text-xl font-bold text-white">{userRankData.username} (You)</span>
                </div>
                
                {/* Points and Streak */}
                <div className="text-right">
                  <span className="font-bold text-yellow-300 block text-lg">{userRankData.points} pts</span>
                  <span className="text-sm text-green-200">{userRankData.streak} day streak</span>
                </div>
              </div>
            </div>
          )}
          
          {/* ------------------------------------- */}
          {/* EXISTING SECTION: FULL LEADERBOARD LIST */}
          {/* ------------------------------------- */}
          {leaderboard.length === 0 ? (
            <p className="text-slate-400">No participants yet.</p>
          ) : (
            <div className="space-y-2">
              <h4 className="text-base font-semibold text-slate-400 pt-2 border-t border-slate-700">All Participants</h4>
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.username === currentUsername;
                
                return (
                  <div
                    key={entry.username}
                    className={`flex items-center justify-between p-3 rounded-md shadow-sm border ${
                      isCurrentUser 
                        ? 'bg-cyan-700/50 border-cyan-500' // Highlight for the user in the main list
                        : 'bg-slate-700 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg text-slate-300">{index + 1}.</span>
                      <span className="text-slate-100">{entry.username} {isCurrentUser && <span className="text-cyan-400 text-xs">(You)</span>}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-cyan-400 block">{entry.points} pts</span> {/* Accent color for points */}
                      <span className="text-sm text-slate-400">{entry.streak} day streak</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}