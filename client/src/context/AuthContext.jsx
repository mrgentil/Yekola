import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token and get user data
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const response = await axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
          if (response.data.success) {
            setUser(response.data.user)
            setToken(storedToken)
          } else {
            localStorage.removeItem('token')
            setToken(null)
          }
        } catch (error) {
          console.error('Error fetching user:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const signUp = async (email, password, userData = {}) => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, {
        email,
        password,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        role: userData.role || 'student',
        phone: userData.phone || ''
      })

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(newUser)
        return { data: { user: newUser }, error: null }
      } else {
        return { data: null, error: { message: response.data.error } }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error: { message: error.response?.data?.error || 'Registration failed' } }
    }
  }

  const signIn = async (email, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/login`, {
        email,
        password
      })

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(newUser)
        return { data: { user: newUser }, error: null }
      } else {
        return { data: null, error: { message: response.data.error } }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error: { message: error.response?.data?.error || 'Login failed' } }
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  const getAccessToken = () => {
    return token
  }

  const value = {
    user,
    token,
    loading,
    signUp,
    signIn,
    signOut,
    getAccessToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}