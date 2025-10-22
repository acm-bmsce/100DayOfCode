import React from 'react'
import { useAuthStore } from '../store'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedUserRoute() {
  const { username, isAdmin } = useAuthStore()
  
  if (!username) {
    return <Navigate to="/" replace />
  }
  
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet /> // Renders the child route (UserDashboard)
}
