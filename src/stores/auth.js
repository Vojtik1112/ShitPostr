import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const SESSION_KEY = 'shitpostr-session'
const TOKEN_KEY = 'shitpostr-token'
const API_URL = 'http://localhost:3000/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const token = ref(null)
  const isInitialized = ref(false)

  const persistSession = () => {
    if (typeof window === 'undefined') return
    if (currentUser.value) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser.value))
    } else {
      window.localStorage.removeItem(SESSION_KEY)
    }
    if (token.value) {
      window.localStorage.setItem(TOKEN_KEY, token.value)
    } else {
      window.localStorage.removeItem(TOKEN_KEY)
    }
  }

  const initializeFromStorage = () => {
    if (isInitialized.value || typeof window === 'undefined') {
      isInitialized.value = true
      return
    }

    const storedSession = window.localStorage.getItem(SESSION_KEY)
    const storedToken = window.localStorage.getItem(TOKEN_KEY)

    if (storedSession && storedToken) {
      try {
        currentUser.value = JSON.parse(storedSession)
        token.value = storedToken
      } catch (error) {
        console.error('Failed to parse session', error)
        currentUser.value = null
        token.value = null
      }
    }

    isInitialized.value = true
  }

  const isAuthenticated = computed(() => !!currentUser.value)

  const register = async ({ displayName, email, password }) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      const data = await response.json()
      currentUser.value = data.user
      token.value = data.token
      persistSession()
      return currentUser.value
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const login = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()
      currentUser.value = data.user
      token.value = data.token
      persistSession()
      return currentUser.value
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const logout = () => {
    currentUser.value = null
    token.value = null
    persistSession()
  }

  const updateProfile = async (payload) => {
    if (!token.value) throw new Error('Not authenticated')

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Update failed')
      }

      const data = await response.json()
      if (data.user) {
        currentUser.value = data.user
        persistSession()
      }
      return currentUser.value
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  watch(currentUser, persistSession, { deep: true })

  return {
    currentUser,
    token,
    isAuthenticated,
    isInitialized,
    initializeFromStorage,
    login,
    logout,
    register,
    updateProfile,
  }
})
