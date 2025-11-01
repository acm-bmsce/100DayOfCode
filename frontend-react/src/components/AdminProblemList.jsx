import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store'; // <-- 1. Import the auth store
const API_URL = import.meta.env.VITE_API_URL;

export default function AdminProblemList() {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Get the admin password from the store
  const adminPassword = useAuthStore((state) => state.adminPassword);

  useEffect(() => {
    async function fetchAllProblems() {
      setIsLoading(true);
      setError(null);
      try {
        // 3. Add the password to the headers
        const res = await fetch(`${API_URL}/api/admin/all-problems`, {
          headers: {
            'Authorization': `Bearer ${adminPassword}`
          }
        });
        
        if (!res.ok) {
          // If unauthorized, the server will send a 401
          if (res.status === 401) throw new Error('Unauthorized');
          throw new Error('Failed to fetch problems');
        }
        
        const data = await res.json();
        setProblems(data);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only run if adminPassword is present
    if (adminPassword) {
      fetchAllProblems();
    }
  }, [adminPassword]); // <-- 4. Add adminPassword as a dependency

  return (
    <div className="border border-red-700 p-6">
      <h3 className="text-xl font-semibold text-red-500 mb-4">MASTER PROBLEM LIST</h3>
      {isLoading && <p className="text-gray-400">Loading problems...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!isLoading && !error && (
        <div className="max-h-96 overflow-y-auto pr-2">
          <table className="min-w-full text-sm text-gray-300">
            <thead className="border-b border-red-700 text-red-400">
              <tr>
                <th className="px-2 py-2 text-left">Day</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2 text-left">Problem Status</th>
                <th className="px-2 py-2 text-left">Solution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/50">
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