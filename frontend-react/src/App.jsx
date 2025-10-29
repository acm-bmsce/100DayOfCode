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
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100"> {/* Light background */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10"> {/* White header with shadow */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {/* Green accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 relative pt-1"> {/* Adjusted text style */}
            &gt; 100_DAYS_OF_CODE
          </h1>
          {username && (
            <div className="flex items-center space-x-4 relative pt-1">
               <span className="text-gray-600 hidden sm:inline">Welcome, {username}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-150 text-sm" /* Adjusted button style */
              >
                LOGOUT
                <span className="hidden sm:inline"> ({username})</span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full"> {/* Centered content */}
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