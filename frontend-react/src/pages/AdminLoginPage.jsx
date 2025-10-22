import React, { useState } from 'react'
import { useAuthStore } from '../store'
import { useNavigate } from 'react-router-dom'

// The blinking cursor component
const Cursor = () => <span className="text-red-500 animate-blink">_</span>

export default function AdminLoginPage() {
  const { loginAdmin } = useAuthStore()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const success = await loginAdmin(password)
    if (success) {
      navigate('/admin/dashboard') // Redirect to admin dashboard
    } else {
      setError('ACCESS DENIED.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-20 p-4 border border-red-700">
      <h2 className="text-2xl font-bold text-red-500 mb-4">SECURE ADMIN LOGIN</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="password" className="block mb-1 text-red-400">
            &gt; ENTER_PASSWORD:
          </label>
          <div className="flex">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-hacker flex-1 border-red-700! !focus:ring-red-500"
              autoFocus
            />
            <Cursor />
          </div>
        </div>
        <button type="submit" className="btn-hacker-admin">
          AUTHENTICATE
        </button>
      </form>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  )
}