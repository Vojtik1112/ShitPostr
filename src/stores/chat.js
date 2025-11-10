import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'shitpostr-conversations'

const loadStorageMap = () => {
  if (typeof window === 'undefined') {
    return {}
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return {}
  }
  try {
    return JSON.parse(raw)
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
  return [
    {
      id: `${user.id}-general`,
      title: 'Stall Gossip',
      description: 'Mainline feed for emergency TP calls and questionable rumors.',
      participants: [user.id, 'helper-bot'],
      messages: [
        {
          id: `${user.id}-general-msg-1`,
          authorId: 'helper-bot',
          authorName: 'Helper Bot',
          body: `Welcome ${friendlyName}! Mind the puddles and announce your arrival.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      id: `${user.id}-ideas`,
      title: 'Tank Think Tank',
      description: 'Swap renovation ideas, prank blueprints, and signature scents.',
      participants: [user.id, 'helper-bot'],
      messages: [
        {
          id: `${user.id}-ideas-msg-1`,
          authorId: 'helper-bot',
          authorName: 'Helper Bot',
          body: 'Pitch your boldest stall upgrades. Heated seats? Disco flush? Say less.',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ]
}

const createMessage = ({ authorId, authorName, body }) => ({
  id: `${authorId}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  authorId,
  authorName,
  body,
  timestamp: new Date().toISOString(),
})

const helperBotResponses = [
  'Copy that. Spraying some air freshener on this take.',
  'Legendary. Should I etch that on the bathroom wall for you?',
  'Bold move. Want me to page the janitor squad?',
  'That stinks in the best way possible. 10/10 would flush again.',
  'Need cover? I can blame the smell on the upstairs pipes.',
]

export const useChatStore = defineStore('chat', () => {
  const ownerId = ref(null)
  const conversations = ref([])
  const activeConversationId = ref(null)
  const isBootstrapped = ref(false)

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
      conversations.value = stored.conversations
      activeConversationId.value = stored.activeConversationId || stored.conversations[0]?.id || null
    } else {
      const fallback = defaultConversations(user)
      conversations.value = fallback
      activeConversationId.value = fallback[0]?.id || null
      persist()
    }

    isBootstrapped.value = true
  }

  const reset = () => {
    ownerId.value = null
    conversations.value = []
    activeConversationId.value = null
    isBootstrapped.value = false
  }

  const persist = () => {
    if (!ownerId.value) {
      return
    }
    const storageMap = loadStorageMap()
    storageMap[ownerId.value] = {
      conversations: conversations.value,
      activeConversationId: activeConversationId.value,
    }
    persistStorageMap(storageMap)
  }

  const setActiveConversation = (conversationId) => {
    if (conversationId === activeConversationId.value) {
      return
    }
    const exists = conversations.value.find((conversation) => conversation.id === conversationId)
    if (!exists) {
      return
    }
    activeConversationId.value = conversationId
  }

  const createConversation = ({ title, description }) => {
    if (!ownerId.value) {
      throw new Error('No active user context for creating a conversation.')
    }
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      throw new Error('Conversation title is required.')
    }

    const conversation = {
      id: `${ownerId.value}-${Date.now()}`,
      title: trimmedTitle,
      description: description?.trim() || 'Freshly scrubbed secret stall',
      participants: [ownerId.value, 'helper-bot'],
      messages: [
        createMessage({
          authorId: 'helper-bot',
          authorName: 'Helper Bot',
          body: `Fresh porcelain who dis? ${trimmedTitle} is open for confessions.`,
        }),
      ],
    }

    conversations.value = [conversation, ...conversations.value]
    activeConversationId.value = conversation.id
    return conversation
  }

  const sendMessage = (body, author) => {
    if (!activeConversation.value) {
      throw new Error('Pick a conversation before sending messages.')
    }
    if (!body.trim()) {
      return null
    }

    const outgoing = createMessage({
      authorId: author.id,
      authorName: author.displayName,
      body: body.trim(),
    })

    activeConversation.value.messages.push(outgoing)

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
        authorName: 'Helper Bot',
        body: helperBotResponses[Math.floor(Math.random() * helperBotResponses.length)],
      })
      conversation.messages.push(reply)
    }, 1000 + Math.floor(Math.random() * 2000))
  }

  watch([conversations, activeConversationId], persist, { deep: true })

  return {
    activeConversation,
    activeConversationId,
    bootstrap,
    conversations,
    createConversation,
    isBootstrapped,
    reset,
    sendMessage,
    setActiveConversation,
  }
})
