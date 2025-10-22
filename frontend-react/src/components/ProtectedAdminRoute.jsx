import React from 'react'
import { useAuthStore } from '../store'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedAdminRoute() {
  const { username, isAdmin } = useAuthStore()
  
  if (!username || !isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet /> // Renders the child route (AdminDashboard)
}
