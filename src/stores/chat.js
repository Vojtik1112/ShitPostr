import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'shitpostr-conversations'
const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g
const INLINE_WHITESPACE_REGEX = /[\s\u00A0]+/g
const MAX_TITLE_LENGTH = 30
const MAX_DESCRIPTION_LENGTH = 200
const MAX_MESSAGE_LENGTH = 500

const sanitizeInlineText = (value, maxLength) => {
  if (typeof value !== 'string') {
    return ''
  }
  const stripped = value.replace(CONTROL_CHARS_REGEX, ' ').replace(INLINE_WHITESPACE_REGEX, ' ').trim()
  if (typeof maxLength === 'number' && maxLength > 0) {
    return stripped.slice(0, maxLength)
  }
  return stripped
}

const sanitizeMultilineText = (value, maxLength) => {
  if (typeof value !== 'string') {
    return ''
  }
  const normalised = value.replace(CONTROL_CHARS_REGEX, '').replace(/\r\n?/g, '\n')
  const trimmed = normalised.trim()
  if (typeof maxLength === 'number' && maxLength > 0) {
    return trimmed.slice(0, maxLength)
  }
  return trimmed
}

const sanitizeMessageBody = (value) => sanitizeMultilineText(value, MAX_MESSAGE_LENGTH)

const hardenMessageRecord = (record) => {
  if (!record || typeof record !== 'object') {
    return null
  }
  const cleaned = { ...record }
  cleaned.authorName = sanitizeInlineText(cleaned.authorName ?? 'Anonym', 80) || 'Anonym'
  cleaned.body = sanitizeMessageBody(cleaned.body)
  cleaned.timestamp = typeof cleaned.timestamp === 'string' ? cleaned.timestamp : new Date().toISOString()
  cleaned.authorId = sanitizeInlineText(String(cleaned.authorId ?? ''), 80) || 'unknown-author'
  cleaned.id = sanitizeInlineText(String(cleaned.id ?? ''), 120) || `${cleaned.authorId}-${Date.now()}`
  if (!cleaned.body) {
    cleaned.body = '[prázdná zpráva]'
  }
  return cleaned
}

const hardenConversationRecord = (conversation) => {
  if (!conversation || typeof conversation !== 'object') {
    return null
  }
  const cleaned = { ...conversation }
  cleaned.id = sanitizeInlineText(String(cleaned.id ?? ''), 120) || `room-${Date.now()}`
  cleaned.title = sanitizeInlineText(cleaned.title ?? '', MAX_TITLE_LENGTH) || 'Kabinka'
  cleaned.description = sanitizeMultilineText(cleaned.description ?? '', MAX_DESCRIPTION_LENGTH)
  cleaned.participants = Array.isArray(cleaned.participants)
    ? cleaned.participants.map((participant) => sanitizeInlineText(String(participant ?? ''), 120)).filter(Boolean)
    : []
  cleaned.messages = Array.isArray(cleaned.messages)
    ? cleaned.messages.map((message) => hardenMessageRecord(message)).filter(Boolean)
    : []
  return cleaned
}

const cleanConversationList = (list) => {
  if (!Array.isArray(list)) {
    return []
  }
  return list.map((conversation) => hardenConversationRecord(conversation)).filter(Boolean)
}

const sanitizeLastReadMap = (rawMap) => {
  if (!rawMap || typeof rawMap !== 'object') {
    return {}
  }
  const cleaned = {}
  for (const [key, value] of Object.entries(rawMap)) {
    const conversationId = sanitizeInlineText(String(key ?? ''), 120)
    if (!conversationId) {
      continue
    }
    let timestamp = null
    if (typeof value === 'number' && Number.isFinite(value)) {
      timestamp = value
    } else if (typeof value === 'string') {
      const parsed = Date.parse(value)
      if (!Number.isNaN(parsed)) {
        timestamp = parsed
      }
    }
    if (timestamp !== null) {
      cleaned[conversationId] = timestamp
    }
  }
  return cleaned
}

const loadStorageMap = () => {
  if (typeof window === 'undefined') {
    return {}
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return {}
  }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }
    const result = {}
    for (const [ownerId, payload] of Object.entries(parsed)) {
      if (!payload || typeof payload !== 'object') {
        continue
      }
      result[ownerId] = {
        conversations: cleanConversationList(payload.conversations),
        activeConversationId:
          typeof payload.activeConversationId === 'string'
            ? sanitizeInlineText(payload.activeConversationId, 120)
            : null,
        lastReadMap: sanitizeLastReadMap(payload.lastReadMap),
      }
    }
    return result
  } catch (error) {
    console.error('Failed to parse chat storage', error)
    return {}
  }
}

const persistStorageMap = (map) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

const defaultConversations = (user) => {
  const friendlyName = user.displayName.split(' ')[0] || user.displayName
  const raw = [
    {
      id: `${user.id}-general`,
      title: 'Toaletní drby',
      description: 'Hlavní kanál pro SOS volání po papíru a všechny podezřelé zvěsti.',
      participants: [user.id, 'helper-bot'],
      messages: [
        {
          id: `${user.id}-general-msg-1`,
          authorId: 'helper-bot',
          authorName: 'Bot Uklízeč',
          body: `Vítej ${friendlyName}! Dávej bacha na mokré fleky a ozvi se, až usedneš.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      id: `${user.id}-ideas`,
      title: 'Porcelánová laboratoř',
      description: 'Sdílej nápady na vylepšení, prank plány i vlastní vůně svěžesti.',
      participants: [user.id, 'helper-bot'],
      messages: [
        {
          id: `${user.id}-ideas-msg-1`,
          authorId: 'helper-bot',
          authorName: 'Bot Uklízeč',
          body: 'Pochlub se nejodvážnějšími úpravami kabinky. Vyhřívané prkýnko? Disco splachování? Sem s tím!',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ]
  return cleanConversationList(raw)
}

const createMessage = ({ authorId, authorName, body }) =>
  hardenMessageRecord({
    id: `${authorId}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    authorId,
    authorName,
    body,
    timestamp: new Date().toISOString(),
  })

const helperBotResponses = [
  'Rozumím. Přidávám k tomu šplích osvěžovače.',
  'Legendární. Mám ti to vyrýt na dveře kabinky?',
  'Odvážné. Mám zalarmovat úklidovou jednotku?',
  'Voní to přesně tak, jak má. 10/10, opakoval bych.',
  'Potřebuješ alibi? Klidně to hodím na stupačky z patra.',
]

export const useChatStore = defineStore('chat', () => {
  const ownerId = ref(null)
  const conversations = ref([])
  const activeConversationId = ref(null)
  const isBootstrapped = ref(false)
  const lastReadMap = ref({})

  const findConversation = (conversationId) =>
    conversations.value.find((conversation) => conversation.id === conversationId) || null

  const activeConversation = computed(() =>
    conversations.value.find((conversation) => conversation.id === activeConversationId.value) || null,
  )

  const bootstrap = (user) => {
    if (!user) {
      reset()
      return
    }

    if (isBootstrapped.value && ownerId.value === user.id) {
      return
    }

    ownerId.value = user.id
    const storageMap = loadStorageMap()
    const stored = storageMap[user.id]

    if (stored && Array.isArray(stored.conversations)) {
      conversations.value = cleanConversationList(stored.conversations)
      activeConversationId.value = stored.activeConversationId || stored.conversations[0]?.id || null
      lastReadMap.value = { ...stored.lastReadMap }
    } else {
      conversations.value = cleanConversationList(defaultConversations(user))
      activeConversationId.value = null
      const seededMap = {}
      const now = Date.now()
      conversations.value.forEach((conversation) => {
        const lastMessage = conversation.messages?.[conversation.messages.length - 1]
        const timestamp = lastMessage ? Date.parse(lastMessage.timestamp) : now
        seededMap[conversation.id] = Number.isNaN(timestamp) ? now : timestamp
      })
      lastReadMap.value = seededMap
      persist()
    }

    isBootstrapped.value = true
  }

  const reset = () => {
    ownerId.value = null
    conversations.value = []
    activeConversationId.value = null
    isBootstrapped.value = false
    lastReadMap.value = {}
  }

  const persist = () => {
    if (!ownerId.value) {
      return
    }
    const storageMap = loadStorageMap()
    storageMap[ownerId.value] = {
      conversations: cleanConversationList(conversations.value),
      activeConversationId:
        typeof activeConversationId.value === 'string'
          ? sanitizeInlineText(activeConversationId.value, 120)
          : null,
      lastReadMap: { ...lastReadMap.value },
    }
    persistStorageMap(storageMap)
  }

  const setActiveConversation = (conversationId) => {
    const exists = findConversation(conversationId)
    if (!exists) {
      return
    }
    if (conversationId !== activeConversationId.value) {
      activeConversationId.value = conversationId
    }
    markConversationRead(conversationId)
  }

  const createConversation = ({ title, description }) => {
    if (!ownerId.value) {
      throw new Error('Chybí přihlášený uživatel.')
    }
    const rawTitle = typeof title === 'string' ? title.trim() : ''
    if (!rawTitle) {
      throw new Error('Název místnosti je povinný.')
    }
    if (rawTitle.length > MAX_TITLE_LENGTH) {
      throw new Error('Název místnosti může mít maximálně 30 znaků.')
    }
    const trimmedTitle = sanitizeInlineText(rawTitle, MAX_TITLE_LENGTH)
    if (!trimmedTitle) {
      throw new Error('Název místnosti je povinný.')
    }
    const rawDescription = typeof description === 'string' ? description : ''
    const sanitizedDescription = sanitizeMultilineText(rawDescription, MAX_DESCRIPTION_LENGTH)
    const normalisedDescriptionLength = sanitizeMultilineText(rawDescription, Number.MAX_SAFE_INTEGER).length
    if (normalisedDescriptionLength > MAX_DESCRIPTION_LENGTH) {
      throw new Error('Popis může mít maximálně 200 znaků.')
    }

    const conversation = hardenConversationRecord({
      id: `${ownerId.value}-${Date.now()}`,
      title: trimmedTitle,
      description: sanitizedDescription || 'Zbrusu nová tajná kabinka',
      participants: [ownerId.value, 'helper-bot'],
      messages: [
        createMessage({
          authorId: 'helper-bot',
          authorName: 'Bot Uklízeč',
          body: `Čerstvě naleštěný porcelán hlásí: ${trimmedTitle} je otevřená všem přiznáním.`,
        }),
      ],
    })

    conversations.value = [conversation, ...conversations.value]
    activeConversationId.value = conversation.id
    markConversationRead(conversation.id)
    return conversation
  }

  const sendMessage = (body, author) => {
    if (!activeConversation.value) {
      throw new Error('Vyber nejdřív místnost, než něco pošleš.')
    }
    const sanitizedBody = sanitizeMessageBody(body)
    if (!sanitizedBody) {
      return null
    }

    const outgoing = createMessage({
      authorId: author.id,
      authorName: author.displayName,
      body: sanitizedBody,
    })

    activeConversation.value.messages.push(outgoing)
    markConversationRead(activeConversation.value.id, Date.parse(outgoing.timestamp))

    scheduleHelperBotReply(activeConversation.value)
    return outgoing
  }

  const scheduleHelperBotReply = (conversation) => {
    if (typeof window === 'undefined') {
      return
    }
    window.setTimeout(() => {
      const reply = createMessage({
        authorId: 'helper-bot',
        authorName: 'Bot Uklízeč',
        body: helperBotResponses[Math.floor(Math.random() * helperBotResponses.length)],
      })
      conversation.messages.push(reply)
      if (conversation.id === activeConversationId.value) {
        markConversationRead(conversation.id, Date.parse(reply.timestamp))
      }
    }, 1000 + Math.floor(Math.random() * 2000))
  }

  function markConversationRead(conversationId, timestampOverride) {
    if (!conversationId) {
      return
    }
    const conversation = findConversation(conversationId)
    if (!conversation) {
      return
    }
    let resolvedTimestamp = null
    if (typeof timestampOverride === 'number' && Number.isFinite(timestampOverride)) {
      resolvedTimestamp = timestampOverride
    }
    if (resolvedTimestamp === null) {
      const lastMessage = conversation.messages?.[conversation.messages.length - 1] || null
      const parsed = lastMessage ? Date.parse(lastMessage.timestamp) : Date.now()
      resolvedTimestamp = Number.isNaN(parsed) ? Date.now() : parsed
    }
    lastReadMap.value = {
      ...lastReadMap.value,
      [conversationId]: resolvedTimestamp,
    }
  }

  const getUnreadCount = (conversationId) => {
    const conversation = findConversation(conversationId)
    if (!conversation || !Array.isArray(conversation.messages) || conversation.messages.length === 0) {
      return 0
    }
    const checkpoint = lastReadMap.value[conversationId]
    if (typeof checkpoint !== 'number') {
      return conversation.messages.length
    }
    return conversation.messages.reduce((count, message) => {
      const parsed = Date.parse(message.timestamp)
      if (Number.isNaN(parsed)) {
        return count + 1
      }
      return parsed > checkpoint ? count + 1 : count
    }, 0)
  }

  watch([conversations, activeConversationId, lastReadMap], persist, { deep: true })

  return {
    activeConversation,
    activeConversationId,
    bootstrap,
    conversations,
    createConversation,
    getUnreadCount,
    isBootstrapped,
    markConversationRead,
    reset,
    sendMessage,
    setActiveConversation,
  }
})
