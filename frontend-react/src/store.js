import { create } from 'zustand'

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL

// This store will manage the user's login state
export const useAuthStore = create((set) => ({
  username: null,
  name: null,
  isAdmin: false,
  isLoading: true,
  error: null,

  // Check if we are already logged in from a previous session
  checkAuth: () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      if (auth && auth.username) {
        set({ username: auth.username, name: auth.name, isAdmin: auth.isAdmin, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (e) {
      set({ isLoading: false })
    }
  },

  // Login as a user
  loginUser: async (username) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_URL}/api/login/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (!res.ok) throw new Error('User not found')
      const data = await res.json()
      const auth = { username: data.username, name: data.name, isAdmin: false }
      localStorage.setItem('auth', JSON.stringify(auth))
      set({ ...auth, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err.message })
    }
  },

  // Login as an admin
  loginAdmin: async (password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_URL}/api/login/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error('Invalid password')
      const auth = { username: 'Admin', name: 'Admin', isAdmin: true }
      localStorage.setItem('auth', JSON.stringify(auth))
      set({ ...auth, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err.message })
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth')
    set({ username: null, name: null, isAdmin: false, error: null })
  },
}))