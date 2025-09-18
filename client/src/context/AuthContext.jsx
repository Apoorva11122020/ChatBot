import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is logged in on app start
  useEffect(() => {
    let isMounted = true
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        if (isMounted) dispatch({ type: 'AUTH_FAILURE', payload: null })
        return
      }
      try {
        const response = await authService.getProfile()
        const { user } = response
        if (isMounted) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          })
        }
      } catch (error) {
        localStorage.removeItem('token')
        if (isMounted) {
          dispatch({
            type: 'AUTH_FAILURE',
            payload: error?.response?.data?.message || 'Authentication failed'
          })
        }
      }
    }

    checkAuth()
    return () => { isMounted = false }
  }, [])

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.login(credentials)
      const { token, user } = response
      localStorage.setItem('token', token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          token
        }
      })
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const signup = async (userData) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.signup(userData)
      const { token, user } = response
      localStorage.setItem('token', token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          token
        }
      })
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully!')
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    signup,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
