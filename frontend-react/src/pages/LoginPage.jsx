import React, { useState } from 'react'
import { useAuthStore } from '../store'

export default function LoginPage() {
  const { loginUser, loginAdmin, error } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleUserLogin = (e) => {
    e.preventDefault()
    loginUser(username)
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    loginAdmin(password)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      {/* User Login */}
      <form onSubmit={handleUserLogin}>
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">User Login</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 bg-gray-700 rounded-lg text-white"
          />
          <button type="submit" className="p-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition">
            Login
          </button>
        </div>
      </form>

      {/* Admin Login */}
      <form onSubmit={handleAdminLogin}>
        <h2 className="text-2xl font-semibold mb-4 text-orange-400">Admin Login</h2>
        <div className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter admin password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 bg-gray-700 rounded-lg text-white"
          />
          <button type="submit" className="p-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition">
            Admin Login
          </button>
        </div>
      </form>

      {error && <p className="text-red-400 text-center md:col-span-2 mt-4">{error}</p>}
    </div>
  )
}