import { ReactNode, createContext, useContext } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Auth Provider - manages authentication state
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  const isAuthenticated = () => {
    const token = getToken()
    if (!token?.trim()) return false

    try {
      const payload = token.split('.')[1]
      if (!payload) return false
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
      const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
      const decoded = JSON.parse(json) as { exp?: number }
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem('auth_token')
        return false
      }
    } catch {
      localStorage.removeItem('auth_token')
      return false
    }

    return true
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }

  const value: AuthContextType = {
    isAuthenticated: isAuthenticated(),
    token: getToken(),
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
