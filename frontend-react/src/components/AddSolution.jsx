import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store'; // <-- 1. Import store
const API_URL = import.meta.env.VITE_API_URL;

export default function AddSolution() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [solutionLink, setSolutionLink] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 2. Get password from store
  const adminPassword = useAuthStore((state) => state.adminPassword);

  // Fetch all problems to populate the dropdown
  useEffect(() => {
    async function fetchAllProblems() {
      try {
        // 3. Add auth header to fetch (for GET request)
        const res = await fetch(`${API_URL}/api/admin/all-problems`, {
          headers: {
            'Authorization': `Bearer ${adminPassword}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch problems');
        const data = await res.json();
        setProblems(data);
      } catch (err) {
        console.error(err.message);
      }
    }
    
    if (adminPassword) {
      fetchAllProblems();
    }
  }, [adminPassword]); // <-- 4. Add dependency

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProblem) {
      setMessage({ type: 'error', text: 'You must select a problem.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);

    try {
      // 3. Add auth header to fetch (for POST request)
      const res = await fetch(`${API_URL}/api/admin/add-solution`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({
          problem_id: parseInt(selectedProblem, 10),
          solution_link: solutionLink,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add solution');
      
      setMessage({ type: 'success', text: data.message });
      setSelectedProblem('');
      setSolutionLink('');

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "shadow-sm appearance-none border border-slate-300 rounded-md w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const buttonClass = "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-slate-800">Add/Update Solution Link</h3>
      
      <div>
        <label htmlFor="problem-select" className="block text-slate-700 text-sm font-semibold mb-2">Select Problem:</label>
        <select 
          id="problem-select"
          value={selectedProblem}
          onChange={(e) => setSelectedProblem(e.target.value)}
          className={inputClass}
          required
        >
          <option value="" disabled>-- Choose a problem --</option>
          {problems.map(p => (
            <option key={p.id} value={p.id} className="text-slate-800">
              Day {p.day}: {p.question_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sol-link" className="block text-slate-700 text-sm font-semibold mb-2">Solution Link:</label>
        <input 
          id="sol-link" 
          type="url" 
          value={solutionLink} 
          onChange={(e) => setSolutionLink(e.target.value)} 
          className={inputClass} 
          placeholder="https://your-solution-link.com/..."
          required 
        />
      </div>

      <button type="submit" disabled={isLoading} className={buttonClass}>
        {isLoading ? 'SAVING...' : 'Save Solution'}
      </button>

      {message && (
        <p className={`mt-2 text-center text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}