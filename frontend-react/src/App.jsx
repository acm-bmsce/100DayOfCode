import React, { useEffect } from 'react'
import { useAuthStore } from './store'
import LoginPage from './pages/LoginPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const { username, isAdmin, isLoading, checkAuth, logout } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">100 Days of Code</h1>
        {username && (
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout ({username})
          </button>
        )}
      </header>
      
      <main className="max-w-5xl mx-auto">
        {!username && <LoginPage />}
        {username && !isAdmin && <UserDashboard />}
        {username && isAdmin && <AdminDashboard />}
      </main>
    </div>
  )
}

export default App