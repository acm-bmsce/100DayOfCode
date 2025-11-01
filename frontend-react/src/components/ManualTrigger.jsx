// frontend-react/src/components/ManualTrigger.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../store'; // <-- Import store
const API_URL = import.meta.env.VITE_API_URL;

export default function ManualTrigger() {
  const [day, setDay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Get the admin password from the store
  const adminPassword = useAuthStore((state) => state.adminPassword);

  const startUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/trigger-workflow`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}` // <-- Send the auth token
        },
        body: JSON.stringify({ day: parseInt(day) }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger');
      
      setMessage({ type: 'success', text: data.message });
      setDay(''); // Clear on success

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  }

  // --- STYLING (copied from your old file) ---
  const inputClass = "shadow-sm appearance-none border border-slate-300 rounded-md w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-indigo-500 focus:border-transparent";
  const buttonClass = "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50";

  return (
    <form onSubmit={startUpdate} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-slate-800">Trigger Hourly Update</h3>
      
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
      
      <button type="submit" disabled={!day || isLoading} className={buttonClass}>
        {isLoading ? 'Triggering...' : 'Start First Chunk'}
      </button>
      
      {message && (
        <p className={`mt-2 text-center text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message.text}
        </p>
      )}
      <p className="text-xs text-slate-500 mt-2">
        This will immediately start the first batch. The rest will be processed automatically every hour.
      </p>
    </form>
  );
}