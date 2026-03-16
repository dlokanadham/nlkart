import { createContext, useState, useEffect, useCallback } from 'react'
import apiClient from '../api/apiClient'
import { logInfo } from '../utils/logger'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      apiClient.get('/auth/me')
        .then((res) => {
          const userData = res.data
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        })
        .catch(() => {
          logout()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (username, password) => {
    const res = await apiClient.post('/auth/login', { username, password })
    const { token: newToken, user: userData } = res.data
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }

  const register = async (data) => {
    const res = await apiClient.post('/auth/register', data)
    return res.data
  }

  const logout = useCallback(() => {
    logInfo('auth', 'logout')
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const hasRole = useCallback((role) => {
    if (!user) return false
    const userRole = user.roleName || user.role
    if (Array.isArray(role)) {
      return role.includes(userRole)
    }
    return userRole === role
  }, [user])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
