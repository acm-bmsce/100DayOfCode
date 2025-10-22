import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store'
import UserLoginPage from './pages/UserLoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedUserRoute from './components/ProtectedUserRoute'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

function App() {
  const { username, isAdmin, checkAuth, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLogout = () => {
    logout()
    navigate('/') // Go to user login page on logout
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8 border-b border-green-700 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400">
          &gt; 100_DAYS_OF_CODE
        </h1>
        {username && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-700 text-white font-bold uppercase tracking-widest border border-red-700 hover:bg-red-600"
          >
            LOGOUT_({username})
          </button>
        )}
      </header>
      
      <main className="max-w-5xl mx-auto">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserLoginPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />

          {/* Protected User Route */}
          <Route element={<ProtectedUserRoute />}>
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* Protected Admin Route */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App