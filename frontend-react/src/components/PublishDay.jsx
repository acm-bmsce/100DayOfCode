import React, { useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL

export default function PublishDay() {
  const [day, setDay] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${API_URL}/api/admin/publish-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: parseInt(day) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to publish')
      setMessage(data.message)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-orange-400">Publish Problems</h3>
      <input
        type="number"
        placeholder="Enter day number (e.g., 1)"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className="p-3 bg-gray-700 rounded-lg text-white"
      />
      <button type="submit" disabled={isLoading} className="p-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition disabled:bg-gray-500">
        {isLoading ? 'Publishing...' : 'Publish Day'}
      </button>
      {message && <p className="mt-2 text-center">{message}</p>}
    </form>
  )
}