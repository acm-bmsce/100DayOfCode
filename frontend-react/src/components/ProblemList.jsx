import React, { useState, useEffect } from 'react'
const API_URL = import.meta.env.VITE_API_URL

export default function ProblemList() {
  const [problems, setProblems] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProblems() {
      try {
        setIsLoading(true)
        const res = await fetch(`${API_URL}/api/problems`)
        const data = await res.json()
        // Group problems by day
        const grouped = data.reduce((acc, p) => {
          if (!acc[p.day]) {
            acc[p.day] = []
          }
          acc[p.day].push(p)
          return acc
        }, {})
        setProblems(grouped)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProblems()
  }, [])

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold mb-4">Problem Set</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.keys(problems).sort((a,b) => b-a).map((day) => (
            <div key={day}>
              <h4 className="text-xl font-bold mb-2 text-cyan-400">Day {day}</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Points</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {problems[day].map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">{p.question_name}</td>
                        <td className="px-4 py-3">{p.points}</td>
                        <td className="px-4 py-3">
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline"
                          >
                            Solve
                          </a>
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
  )
}