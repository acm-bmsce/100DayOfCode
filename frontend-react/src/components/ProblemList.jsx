import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

export default function ProblemList() {
  const [problems, setProblems] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // ... (useEffect fetch logic remains the same) ...
  useEffect(() => {
    async function fetchProblems() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/api/problems`);
        const data = await res.json();
        const grouped = data.reduce((acc, p) => {
          if (!acc[p.day]) { acc[p.day] = []; }
          acc[p.day].push(p);
          return acc;
        }, {});
        setProblems(grouped);
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    }
    fetchProblems();
  }, []);

  return (
    // Dark card styling from screenshot
    <div className="bg-slate-800 text-slate-100 p-6 rounded-lg shadow-lg max-h-[calc(100vh-15rem)] overflow-y-auto"> 
      <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 text-slate-100">Problem Set</h3>
      {isLoading ? (
        <p className="text-slate-400">Loading problems...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.keys(problems).sort((a,b) => b-a).map((day) => (
            <div key={day}>
              <h4 className="text-lg font-semibold mb-2 text-cyan-400">Day {day}</h4> {/* Accent color for day */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-700 text-slate-300"> {/* Header row style */}
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Name</th>
                      <th className="px-4 py-2 text-left font-medium">Points</th>
                      <th className="px-4 py-2 text-left font-medium">Problem</th>
                      <th className="px-4 py-2 text-left font-medium">Solution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700"> {/* Dark dividers */}
                    {problems[day].map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">{p.question_name}</td>
                        <td className="px-4 py-3 text-slate-400">{p.points}</td>
                        <td className="px-4 py-3">
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium" 
                          >
                            Solve
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          {p.solution_link ? (
                            <a
                              href={p.solution_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}