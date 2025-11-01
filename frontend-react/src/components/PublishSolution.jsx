import React, { useState } from 'react';
import { useAuthStore } from '../store'; // <-- 1. Import store
const API_URL = import.meta.env.VITE_API_URL;

export default function PublishSolution() {
  const [day, setDay] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Get password from store
  const adminPassword = useAuthStore((state) => state.adminPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      // 3. Add auth header to fetch
      const res = await fetch(`${API_URL}/api/admin/publish-solution`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({ day: parseInt(day) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      setMessage({ type: 'success', text: data.message });
      setDay(''); // Clear input on success
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-red-500">PUBLISH SOLUTIONS</h3>
      <label htmlFor="publish-sol-day" className="block text-red-400">
        &gt; DAY NUMBER:
      </label>
      <input
        id="publish-sol-day"
        type="number"
        placeholder="e.g., 1"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className="input-hacker border-red-700! !focus:ring-red-500"
      />
      <button type="submit" disabled={isLoading} className="btn-hacker-admin bg-orange-500! border-orange-500! disabled:opacity-50">
        {isLoading ? 'PUBLISHING...' : 'PUBLISH_SOLUTIONS'}
      </button>
      {message && (
        <p className={`mt-2 text-center ${message.type === 'error' ? 'text-red-500' : 'text-green-400'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}