import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const USERS_KEY = 'shitpostr-users'
const SESSION_KEY = 'shitpostr-session'

const DEFAULT_STATUS = 'Připraven/a spláchnout.'
const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g
const INLINE_WHITESPACE_REGEX = /[\s\u00A0]+/g
const PASSWORD_MAX_LENGTH = 128
let encoderInstance = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

const getEncoder = () => {
  if (encoderInstance) {
    return encoderInstance
  }
  if (typeof TextEncoder === 'undefined') {
    throw new Error('TextEncoder is not supported in this environment.')
  }
  encoderInstance = new TextEncoder()
  return encoderInstance
}

const randomColorFromString = (value) => {
  const safeValue = value || ''
  let hash = 0
  for (let i = 0; i < safeValue.length; i += 1) {
    hash = safeValue.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 65% 55%)`
}

const toUint8Array = (base64Value) => {
  if (!base64Value) {
    return new Uint8Array(0)
  }
  if (typeof atob === 'function') {
    const binary = atob(base64Value)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(base64Value, 'base64'))
  }
  throw new Error('Base64 decoding is not supported in this environment.')
}

const toBase64 = (bytes) => {
  if (!bytes || bytes.length === 0) {
    return ''
  }
  if (typeof btoa === 'function') {
    let binary = ''
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  throw new Error('Base64 encoding is not supported in this environment.')
}

const getRandomBytes = (size = 16) => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(size))
  }
  const bytes = new Uint8Array(size)
  for (let i = 0; i < size; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  return bytes
}

const fallbackHash = (saltBytes, passwordBytes) => {
  const combined = new Uint8Array(saltBytes.length + passwordBytes.length)
  combined.set(saltBytes)
  combined.set(passwordBytes, saltBytes.length)
  let hash = 2166136261
  for (let i = 0; i < combined.length; i += 1) {
    hash ^= combined[i]
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  const buffer = new ArrayBuffer(4)
  new DataView(buffer).setUint32(0, hash >>> 0)
  return new Uint8Array(buffer)
}

const derivePasswordHash = async (password, saltBase64) => {
  const safePassword = typeof password.normalize === 'function' ? password.normalize('NFKC') : password
  const saltBytes = saltBase64 ? toUint8Array(saltBase64) : getRandomBytes(24)
  const passwordBytes = getEncoder().encode(safePassword)

  let hashBytes
  const hasSubtle = typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function'
  if (hasSubtle) {
    const combined = new Uint8Array(saltBytes.length + passwordBytes.length)
    combined.set(saltBytes)
    combined.set(passwordBytes, saltBytes.length)
    const digest = await crypto.subtle.digest('SHA-256', combined.buffer)
    hashBytes = new Uint8Array(digest)
  } else {
    hashBytes = fallbackHash(saltBytes, passwordBytes)
  }

  return {
    salt: toBase64(saltBytes),
    hash: toBase64(hashBytes),
  }
}

const timingSafeEqual = (expected, actual) => {
  if (!expected || !actual) {
    return false
  }
  const expectedBytes = toUint8Array(expected)
  const actualBytes = toUint8Array(actual)
  if (expectedBytes.length !== actualBytes.length) {
    return false
  }
  let diff = 0
  for (let i = 0; i < expectedBytes.length; i += 1) {
    diff |= expectedBytes[i] ^ actualBytes[i]
  }
  return diff === 0
}

const sanitizeBaselineText = (value, maxLength) => {
  if (typeof value !== 'string') {
    return ''
  }
  const stripped = value.replace(CONTROL_CHARS_REGEX, ' ').replace(INLINE_WHITESPACE_REGEX, ' ').trim()
  if (typeof maxLength === 'number' && maxLength > 0) {
    return stripped.slice(0, maxLength)
  }
  return stripped
}

const sanitizeStatus = (value) => {
  if (typeof value !== 'string') {
    return ''
  }
  return value.replace(CONTROL_CHARS_REGEX, '').trim().slice(0, 200)
}

const sanitizeAvatarUrl = (value) => {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  if (/^data:image\//i.test(trimmed)) {
    return trimmed
  }
  try {
    const resolved = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (resolved.protocol === 'https:' || resolved.protocol === 'http:') {
      return resolved.href
    }
  } catch (error) {
    return null
  }
  return null
}

const hardenUserRecord = (record) => {
  if (!record || typeof record !== 'object') {
    return null
  }
  const cleaned = { ...record }
  cleaned.displayName = sanitizeBaselineText(cleaned.displayName ?? '', 30) || 'Kabinkový host'
  cleaned.email = typeof cleaned.email === 'string' ? cleaned.email.trim().toLowerCase() : ''
  cleaned.statusMessage = sanitizeStatus(cleaned.statusMessage || DEFAULT_STATUS) || DEFAULT_STATUS
  cleaned.avatarUrl = sanitizeAvatarUrl(cleaned.avatarUrl)
  cleaned.avatarColor = cleaned.avatarColor || randomColorFromString(cleaned.displayName)
  return cleaned
}

const sanitizeUser = (user) => {
  const hardened = hardenUserRecord(user)
  if (!hardened) {
    return null
  }

  const { password, passwordHash, passwordSalt, ...rest } = hardened
  return rest
}

const ensurePasswordRecord = async (user, candidatePassword) => {
  if (!user || typeof candidatePassword !== 'string') {
    return user
  }
  if (user.passwordHash && user.passwordSalt) {
    return user
  }
  if (typeof user.password === 'string') {
    const record = await derivePasswordHash(candidatePassword)
    user.passwordHash = record.hash
    user.passwordSalt = record.salt
    delete user.password
  }
  return user
}

const verifyPassword = async (user, candidatePassword) => {
  if (!user || typeof candidatePassword !== 'string') {
    return false
  }

  if (user.passwordHash && user.passwordSalt) {
    const record = await derivePasswordHash(candidatePassword, user.passwordSalt)
    return timingSafeEqual(user.passwordHash, record.hash)
  }

  if (typeof user.password === 'string') {
    return user.password === candidatePassword
  }

  return false
}

export const useAuthStore = defineStore('auth', () => {
  const users = ref([])
  const currentUser = ref(null)
  const isInitialized = ref(false)

  const persistUsers = () => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(users.value))
    } catch (error) {
      console.warn('Failed to persist users to localStorage', error)
      // Silently fail - data will be lost on refresh but app continues to work
    }
  }

  const persistSession = () => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      if (currentUser.value) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser.value))
      } else {
        window.localStorage.removeItem(SESSION_KEY)
      }
    } catch (error) {
      console.warn('Failed to persist session to localStorage', error)
      // Silently fail - session will be lost on refresh but app continues to work
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
        const parsed = JSON.parse(storedUsers)
        if (Array.isArray(parsed)) {
          users.value = parsed
            .map((entry) => hardenUserRecord(entry))
            .filter((entry) => entry && entry.id && entry.email)
        } else {
          users.value = []
        }
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

    const safeDisplay = sanitizeBaselineText(displayName ?? '', 30)
    const normalisedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const rawPassword = typeof password === 'string' ? password : ''

    if (!safeDisplay) {
      throw new Error('Přezdívka je povinná.')
    }
    if (!normalisedEmail) {
      throw new Error('E-mail je povinný.')
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalisedEmail)) {
      throw new Error('E-mail nemá správný formát.')
    }
    if (rawPassword.length < 8) {
      throw new Error('Heslo musí mít alespoň 8 znaků.')
    }
    if (rawPassword.length > PASSWORD_MAX_LENGTH) {
      throw new Error('Heslo je příliš dlouhé.')
    }

    const existing = users.value.find((user) => user.email === normalisedEmail)
    if (existing) {
      throw new Error('Účet s tímto e-mailem už existuje.')
    }

    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`
    const passwordRecord = await derivePasswordHash(rawPassword)

    const newUser = hardenUserRecord({
      id,
      displayName: safeDisplay,
      email: normalisedEmail,
      passwordHash: passwordRecord.hash,
      passwordSalt: passwordRecord.salt,
      avatarColor: randomColorFromString(safeDisplay),
      statusMessage: DEFAULT_STATUS,
    })

    users.value = [...users.value, newUser]
    currentUser.value = sanitizeUser(newUser)
    persistUsers()
    persistSession()

    return currentUser.value
  }

  const login = async ({ email, password }) => {
    initializeFromStorage()
    const identifier = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const candidatePassword = typeof password === 'string' ? password : ''

    if (!identifier || !candidatePassword) {
      throw new Error('Nesedí přihlašovací údaje.')
    }

    const match = users.value.find((user) => {
      if (user.email === identifier) {
        return true
      }
      return (user.displayName || '').toLowerCase() === identifier
    })

    if (!match) {
      throw new Error('Nesedí přihlašovací údaje.')
    }

    const valid = await verifyPassword(match, candidatePassword)
    if (!valid) {
      throw new Error('Nesedí přihlašovací údaje.')
    }

    await ensurePasswordRecord(match, candidatePassword)

    const index = users.value.findIndex((user) => user.id === match.id)
    let persistedMatch = match
    if (index !== -1) {
      persistedMatch = hardenUserRecord(match)
      users.value.splice(index, 1, persistedMatch)
    }

    currentUser.value = sanitizeUser(persistedMatch)
    persistUsers()
    persistSession()
    return currentUser.value
  }

  const logout = () => {
    currentUser.value = null
    persistSession()
  }

  const updateProfile = (payload) => {
    if (!currentUser.value) {
      throw new Error('Nemáme aktivního uživatele.')
    }

    const index = users.value.findIndex((user) => user.id === currentUser.value.id)
    if (index === -1) {
      throw new Error('Profil jsme nenašli.')
    }

    const requestedDisplayName = payload.displayName !== undefined ? sanitizeBaselineText(payload.displayName, 30) : null
    if (
      payload.displayName !== undefined &&
      !requestedDisplayName &&
      typeof payload.displayName === 'string' &&
      payload.displayName.trim().length > 0
    ) {
      throw new Error('Přezdívka musí obsahovat alespoň jeden čitelný znak.')
    }

    const requestedStatus = payload.statusMessage !== undefined ? sanitizeStatus(payload.statusMessage) : null

    // Handle avatarUrl - allow null to remove avatar, or validate if provided
    let avatarCandidate = undefined
    if (payload.avatarUrl !== undefined) {
      if (payload.avatarUrl === null) {
        // Explicitly setting to null to remove avatar
        avatarCandidate = null
      } else {
        // Validate the avatar URL
        avatarCandidate = sanitizeAvatarUrl(payload.avatarUrl)
        if (payload.avatarUrl && !avatarCandidate) {
          throw new Error('Nepodařilo se ověřit vybraný obrázek.')
        }
      }
    }

    const existingUser = users.value[index]
    const updated = hardenUserRecord({
      ...existingUser,
      displayName: requestedDisplayName || existingUser.displayName,
      statusMessage: requestedStatus || existingUser.statusMessage || DEFAULT_STATUS,
      avatarUrl: avatarCandidate === undefined ? existingUser.avatarUrl : avatarCandidate,
    })

    users.value.splice(index, 1, updated)
    currentUser.value = sanitizeUser(updated)
    
    // Try to persist, but don't fail if it doesn't work
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
