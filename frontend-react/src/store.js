import { create } from 'zustand'

const API_URL = import.meta.env.VITE_API_URL

export const useAuthStore = create((set) => ({
  username: null,
  name: null,
  isAdmin: false,
  adminPassword: null, // Stores the password in state for admin API calls
  isLoading: true,
  error: null,

  checkAuth: () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      if (auth && auth.username) {
        set({
          username: auth.username,
          name: auth.name,
          isAdmin: auth.isAdmin,
          adminPassword: auth.adminPassword || null, // Load password from localStorage
          isLoading: false
        })
      } else {
        set({ isLoading: false })
      }
    } catch (e) {
      set({ isLoading: false })
    }
  },

  // Login functions now return true/false for success
  loginUser: async (username) => {
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
      return true // Return true on success
    } catch (err) {
      set({ isLoading: false, error: err.message })
      return false // Return false on failure
    }
  },

  loginAdmin: async (password) => {
    try {
      const res = await fetch(`${API_URL}/api/login/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error('Invalid password')
      
      // Store the password in state and localStorage
      const auth = {
        username: 'Admin',
        name: 'Admin',
        isAdmin: true,
        adminPassword: password // Save the password
      }
      localStorage.setItem('auth', JSON.stringify(auth))
      set({ ...auth, isLoading: false })
      return true // Return true on success
    } catch (err) {
      set({ isLoading: false, error: err.message })
      return false // Return false on failure
    }
  },

  logout: () => {
    localStorage.removeItem('auth')
    set({
      username: null,
      name: null,
      isAdmin: false,
      adminPassword: null // Clear the password on logout
    })
  },
}))