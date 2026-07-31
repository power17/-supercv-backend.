import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { AuthToken } from '../types'

type AuthContextValue = {
  auth: AuthToken | null
  login: (token: AuthToken) => void
  loginDemo: () => void
  logout: () => void
}

const storageKey = 'supercv_auth'
const AuthContext = createContext<AuthContextValue | null>(null)

function readAuth(): AuthToken | null {
  const value = localStorage.getItem(storageKey)
  if (!value) return null
  try {
    return JSON.parse(value) as AuthToken
  } catch {
    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthToken | null>(readAuth)

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      login(token) {
        localStorage.setItem(storageKey, JSON.stringify(token))
        setAuth(token)
      },
      loginDemo() {
        const token: AuthToken = { uid: 10001, token: 'demo-token', demo: true }
        localStorage.setItem(storageKey, JSON.stringify(token))
        setAuth(token)
      },
      logout() {
        localStorage.removeItem(storageKey)
        setAuth(null)
      },
    }),
    [auth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

