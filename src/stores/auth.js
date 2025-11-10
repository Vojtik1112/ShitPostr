import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const USERS_KEY = 'shitpostr-users'
const SESSION_KEY = 'shitpostr-session'

const randomColorFromString = (value) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 65% 55%)`
}

const sanitizeUser = (user) => {
  if (!user) {
    return null
  }

  const { password, ...rest } = user
  return rest
}

export const useAuthStore = defineStore('auth', () => {
  const users = ref([])
  const currentUser = ref(null)
  const isInitialized = ref(false)

  const persistUsers = () => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users.value))
  }

  const persistSession = () => {
    if (typeof window === 'undefined') {
      return
    }
    if (currentUser.value) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser.value))
    } else {
      window.localStorage.removeItem(SESSION_KEY)
    }
  }

  const initializeFromStorage = () => {
    if (isInitialized.value || typeof window === 'undefined') {
      isInitialized.value = true
      return
    }

    const storedUsers = window.localStorage.getItem(USERS_KEY)
    const storedSession = window.localStorage.getItem(SESSION_KEY)

    if (storedUsers) {
      try {
        users.value = JSON.parse(storedUsers)
      } catch (error) {
        console.error('Failed to parse users from storage', error)
        users.value = []
      }
    }

    if (storedSession) {
      try {
        currentUser.value = sanitizeUser(JSON.parse(storedSession))
      } catch (error) {
        console.error('Failed to parse session from storage', error)
        currentUser.value = null
      }
    }

    isInitialized.value = true
  }

  const isAuthenticated = computed(() => !!currentUser.value)

  const register = async ({ displayName, email, password }) => {
    initializeFromStorage()

    const normalisedEmail = email.trim().toLowerCase()
    const display = displayName.trim()

    if (!display) {
      throw new Error('Display name is required.')
    }
    if (!normalisedEmail) {
      throw new Error('Email is required.')
    }
    if (password.length < 8) {
      throw new Error('Password must have at least 8 characters.')
    }

    const existing = users.value.find((user) => user.email === normalisedEmail)
    if (existing) {
      throw new Error('An account with this email already exists.')
    }

    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `user-${Date.now()}`

    const newUser = {
      id,
      displayName: display,
      email: normalisedEmail,
      password,
      avatarColor: randomColorFromString(display),
      statusMessage: 'Ready to flush.',
    }

    users.value = [...users.value, newUser]
    currentUser.value = sanitizeUser(newUser)
    persistUsers()
    persistSession()

    return currentUser.value
  }

  const login = async ({ email, password }) => {
    initializeFromStorage()
    const normalisedEmail = email.trim().toLowerCase()

    const match = users.value.find((user) => user.email === normalisedEmail)
    if (!match || match.password !== password) {
      throw new Error('Invalid email or password.')
    }

    currentUser.value = sanitizeUser(match)
    persistSession()
    return currentUser.value
  }

  const logout = () => {
    currentUser.value = null
    persistSession()
  }

  const updateProfile = (payload) => {
    if (!currentUser.value) {
      throw new Error('No active user session.')
    }

    const index = users.value.findIndex((user) => user.id === currentUser.value.id)
    if (index === -1) {
      throw new Error('Unable to locate the profile.')
    }

    const updated = {
      ...users.value[index],
      displayName: payload.displayName?.trim() || users.value[index].displayName,
      statusMessage: payload.statusMessage?.trim() ?? users.value[index].statusMessage,
    }

    users.value.splice(index, 1, updated)
    currentUser.value = sanitizeUser(updated)
    persistUsers()
    persistSession()
    return currentUser.value
  }

  watch(users, persistUsers, { deep: true })
  watch(currentUser, persistSession, { deep: true })

  return {
    currentUser,
    isAuthenticated,
    isInitialized,
    initializeFromStorage,
    login,
    logout,
    register,
    updateProfile,
  }
})
