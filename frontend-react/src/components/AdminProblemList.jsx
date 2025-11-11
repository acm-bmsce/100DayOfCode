import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

export default function AdminProblemList() {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllProblems() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/admin/all-problems`);
        if (!res.ok) throw new Error('Failed to fetch problems');
        const data = await res.json();
        
        // --- FIX APPLIED: Group by Day and sort the problems array within the grouping ---
        
        // 1. Group the problems by day
        const grouped = data.reduce((acc, p) => {
          const day = p.day;
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(p);
          return acc;
        }, {});

        // 2. Sort the keys (day numbers) in descending order (highest day first)
        const sortedDays = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));

        // 3. Create a final flat, sorted array based on the descending day order
        const finalSortedProblems = sortedDays.flatMap(day => grouped[day]);
        
        setProblems(finalSortedProblems);
        
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllProblems();
  }, []);

  return (
    <div className="border border-red-700 p-6">
      <h3 className="text-xl font-semibold text-red-500 mb-4">MASTER PROBLEM LIST</h3>
      {isLoading && <p>Loading problems...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!isLoading && !error && (
        <div className="max-h-96 overflow-y-auto pr-2">
          <table className="min-w-full text-sm">
            <thead className="border-b border-red-700">
              <tr>
                <th className="px-2 py-2 text-left">Day</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2 text-left">Problem Status</th>
                <th className="px-2 py-2 text-left">Solution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/50">
              {/* This array is now already sorted in reverse day order */}
              {problems.map((p) => (
                <tr key={p.id}>
                  <td className="px-2 py-2">{p.day}</td>
                  <td className="px-2 py-2">{p.question_name}</td>
                  <td className={`px-2 py-2 ${p.isPublic ? 'text-green-400' : 'text-gray-500'}`}>
                    {p.isPublic ? 'Published' : 'Hidden'}
                  </td>
                  <td className={`px-2 py-2 ${p.solution_link ? (p.isSolutionPublic ? 'text-green-400' : 'text-orange-400') : 'text-gray-500'}`}>
                    {p.solution_link ? (p.isSolutionPublic ? 'Published' : 'Hidden') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}