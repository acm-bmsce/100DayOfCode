import React, { useState, useRef } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function ManualTrigger() {
  const [day, setDay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const isRunning = useRef(false);

  // --- NEW --- Get users remaining to be processed
  const getUsersToProcess = async (dayToProcess) => {
    setLogs(l => [...l, 'Fetching user list...']);
    const res = await fetch(`${API_URL}/api/admin/users-to-process/${dayToProcess}`);
    if (!res.ok) {
      throw new Error('Failed to fetch user list.');
    }
    const users = await res.json();
    return users;
  }

  const startUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    isRunning.current = true;
    setLogs([`--- Starting update for day ${day} ---`]);
    setProgress(0);

    try {
      const usersToProcess = await getUsersToProcess(day);
      if (!usersToProcess || usersToProcess.length === 0) {
        setLogs(l => [...l, 'All users are already updated for this day!']);
        setIsLoading(false);
        return;
      }
      setLogs(l => [...l, `Found ${usersToProcess.length} users to process.`]);

      // 2. Loop through each user IN CHUNKS
      let processedCount = 0;
      const totalUsersToProcess = usersToProcess.length;
      
      const CHUNK_SIZE = 40; // Process 40 users
      const CHUNK_DELAY = 60000; // Wait 1 minute (60,000ms)
      const USER_DELAY = 2000; // 100ms between users

      for (let i = 0; i < usersToProcess.length; i += CHUNK_SIZE) {
        const chunk = usersToProcess.slice(i, i + CHUNK_SIZE);
        setLogs(l => [...l, `--- Processing chunk ${Math.floor(i / CHUNK_SIZE) + 1} / ${Math.ceil(totalUsersToProcess / CHUNK_SIZE)} ---`]);

        for (const user of chunk) {
          if (!isRunning.current) {
            setLogs(l => [...l, '--- Update stopped by user. ---']);
            break;
          }

          try {
            const res = await fetch(`${API_URL}/api/admin/update-user-score`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: user.username, day: parseInt(day) }),
            });
            const data = await res.json();
            
            if (!res.ok) {
              setLogs(l => [...l, `[FAIL] ${user.username}: ${data.error || 'Rate limit? Skipping.'}`]);
            } else {
              setLogs(l => [...l, `[SUCCESS] ${user.username}: +${data.points_added} pts, streak: ${data.new_streak}`]);
            }
          } catch (err) {
            setLogs(l => [...l, `[ERROR] ${user.username}: ${err.message}`]);
          }
          
          processedCount++;
          setProgress((processedCount / totalUsersToProcess) * 100);
          await sleep(USER_DELAY); 
        }

        if (!isRunning.current) break;

        if (i + CHUNK_SIZE < usersToProcess.length) {
          setLogs(l => [...l, `--- Chunk complete. Waiting 1 minute... ---`]);
          await sleep(CHUNK_DELAY);
        }
      }
      
      if (isRunning.current) {
        setLogs(l => [...l, '--- Update complete! ---']);
      }
    } catch (err) {
      setLogs(l => [...l, `[FATAL ERROR] ${err.message}`]);
    } finally {
      setIsLoading(false);
      isRunning.current = false;
    }
  }
  
  const stopUpdate = () => {
    isRunning.current = false;
  }

  // --- STYLING ---
  const inputClass = "shadow-sm appearance-none border border-slate-300 rounded-md w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const buttonClass = "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50";
  const stopButtonClass = "w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200";

  return (
    <form onSubmit={startUpdate} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-slate-800">Manually Update Scores</h3>
      
      <div>
        <label htmlFor="trigger-day" className="block text-slate-700 text-sm font-semibold mb-2">
          Day to Process:
        </label>
        <input
          id="trigger-day"
          type="number"
          placeholder="e.g., 1"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className={inputClass}
          required
          disabled={isLoading}
        />
      </div>
      
      {!isLoading && (
        <button type="submit" disabled={!day} className={buttonClass}>
          Start Daily Update
        </button>
      )}
      
      {isLoading && (
         <button type="button" onClick={stopUpdate} className={stopButtonClass}>
          Stop Update
        </button>
      )}

      {/* Progress Bar */}
      {isLoading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm max-h-40 overflow-y-auto">
          {logs.map((log, index) => (
            <p key={index} className={log.startsWith('[FAIL]') || log.startsWith('[ERROR]') || log.startsWith('[FATAL') ? 'text-red-500' : (log.startsWith('---') ? 'text-indigo-600 font-medium' : 'text-slate-700')}>
              {log}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}