// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'

type AuthState = {
  isLoggedIn: boolean
  user: string | null
  customer: string | null
  loading: boolean
}

export function useAuth(): AuthState & { 
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
} {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    customer: null,
    loading: true
  })

  // Verifica stato auth al mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Controlla prima i cookie lato client
      const userCookie = getCookie('user')
      const customerCookie = getCookie('customer')
      
      if (userCookie) {
        setState({
          isLoggedIn: true,
          user: userCookie,
          customer: customerCookie,
          loading: false
        })
      } else {
        // Fallback: verifica con API
        const res = await fetch('/api/user')
        const data = await res.json()
        
        setState({
          isLoggedIn: Boolean(data.user),
          user: data.user || null,
          customer: data.customer || null,
          loading: false
        })
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setState({
        isLoggedIn: false,
        user: null,
        customer: null,
        loading: false
      })
    }
  }

  const login = async (usr: string, pwd: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usr, pwd })
      })

      if (res.ok) {
        const data = await res.json()
        setState({
          isLoggedIn: true,
          user: data.user,
          customer: data.customer || null,
          loading: false
        })
        
        // Pulisci localStorage obsoleto
        localStorage.removeItem('username')
        
        return true
      } else {
        setState(prev => ({ ...prev, loading: false }))
        return false
      }
    } catch (err) {
      console.error('Login failed:', err)
      setState(prev => ({ ...prev, loading: false }))
      return false
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      await fetch('/api/logout', { 
        method: 'POST', 
        credentials: 'include' 
      })
    } catch (err) {
      console.error('Logout API failed:', err)
    }
    
    // Pulisci stato locale comunque
    setState({
      isLoggedIn: false,
      user: null,
      customer: null,
      loading: false
    })
    
    // Pulisci storage locale
    localStorage.removeItem('username')
    
    // Redirect
    window.location.href = '/'
  }

  return {
    ...state,
    login,
    logout
  }
}

// Helper per leggere cookie lato client
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  
  return null
}
