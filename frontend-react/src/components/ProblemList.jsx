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

  const sortedDays = Object.keys(problems).sort((a,b) => b-a);

  return (
    // Dark card styling from screenshot
    <div className="bg-slate-800 text-slate-100 p-6 rounded-lg shadow-lg max-h-[calc(100vh-15rem)] overflow-y-auto"> 
      <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 text-slate-100">Problem Set</h3>
      {isLoading ? (
        <p className="text-slate-400">Loading problems...</p>
      ) : (
        <div className="overflow-x-auto">
          {/* FIX 1: Use ONE table for the entire list and enforce fixed widths */}
          <table className="min-w-full text-sm **table-fixed**">
            
            {/* Table Header: Apply percentage widths here. Total width should sum to 100%. */}
            <thead className="bg-slate-700 text-slate-300 sticky top-0 z-5">
              <tr>
                {/* Name Column: 60% */}
                <th className="px-4 py-2 text-left font-medium **w-[60%]**">Name</th>
                {/* Points Column: 10% */}
                <th className="px-4 py-2 text-left font-medium **w-[10%]**">Points</th>
                {/* Problem Column: 10% */}
                <th className="px-4 py-2 text-left font-medium **w-[10%]**">Problem</th>
                {/* Solution Column: 10% */}
                <th className="px-4 py-2 text-left font-medium **w-[10%]**">Solution</th>
                {/* Placeholder Column: 10% (for scrollbar/padding alignment) */}
                <th className="px-4 py-2 text-left font-medium **w-[10%]**"></th> 
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-700">
              {sortedDays.map((day) => (
                <React.Fragment key={day}>
                  {/* FIX 2: Day Header Row - Use a visually distinct row within the single table */}
                  <tr className="**bg-slate-600/90**">
                    {/* Use colSpan="5" to span all header columns */}
                    <td colSpan="5" className="px-4 py-3 text-xl font-semibold text-cyan-200 sticky top-[38px] z-5 **border-t border-b border-slate-500**">
                      Day {day}
                    </td>
                  </tr>
                  
                  {/* Problem Rows for the current day */}
                  {problems[day].map((p) => (
                    <tr key={p.id} className="bg-slate-800 hover:bg-slate-700 transition-colors">
                      {/* FIX 3: Remove all explicit width classes from <td> cells. table-fixed forces them to inherit from the <th>. */}
                      <td className="px-4 py-3 truncate">{p.question_name}</td>
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
                          {/* Using the corrected display logic */}
                          {p.solution_link && p.isSolutionPublic ? ( 
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
                      {/* Empty cell to complete the column structure */}
                      <td className="w-[10%]"></td> 
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}