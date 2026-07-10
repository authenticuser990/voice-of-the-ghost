import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Apply saved theme on app load
    const savedTheme = localStorage.getItem('votg_theme')
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    const token = localStorage.getItem('votg_token')
    const savedUser = localStorage.getItem('votg_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const data = await auth.login(credentials)
    localStorage.setItem('votg_token', data.token)
    localStorage.setItem('votg_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (credentials) => {
    const data = await auth.register(credentials)
    localStorage.setItem('votg_token', data.token)
    localStorage.setItem('votg_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem('votg_user', JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    localStorage.removeItem('votg_token')
    localStorage.removeItem('votg_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}