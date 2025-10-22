import React, { useState } from 'react'
import { useAuthStore } from '../store'
import { useNavigate } from 'react-router-dom'

// The blinking cursor component
const Cursor = () => <span className="animate-blink">_</span>

export default function UserLoginPage() {
  const { loginUser } = useAuthStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const success = await loginUser(username)
    if (success) {
      navigate('/dashboard') // Redirect to user dashboard
    } else {
      setError('USER_NOT_FOUND. CHECK_ID_AND_RETRY.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-20 p-4">
      <h2 className="text-2xl font-bold mb-4">SYSTEM_LOGIN</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="block mb-1">
            &gt; USERNAME:
          </label>
          <div className="flex">
            <input
              id="username"
              type="text"
              placeholder=""
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-hacker flex-1"
              autoFocus
            />
            <Cursor />
          </div>
        </div>
        <button type="submit" className="btn-hacker">
          INITIATE_CONNECTION
        </button>
      </form>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  )
}