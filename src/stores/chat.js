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
      title: 'General',
      description: 'Team-wide chat for quick updates and casual banter.',
      participants: [user.id, 'helper-bot'],
      messages: [
        {
          id: `${user.id}-general-msg-1`,
          authorId: 'helper-bot',
          authorName: 'Helper Bot',
          body: `Welcome ${friendlyName}! Let everyone know you joined.`,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      id: `${user.id}-ideas`,
      title: 'Ideas',
      description: 'Drop product ideas, memes, and bold experiments.',
      participants: [user.id, 'helper-bot'],
      messages: [
        {
          id: `${user.id}-ideas-msg-1`,
          authorId: 'helper-bot',
          authorName: 'Helper Bot',
          body: 'Share your wildest feature ideas. There are no bad takes here.',
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
  'Got it! I am taking note of that.',
  'Nice one. Want me to tag the team?',
  'Bold idea! What makes you think this will shine?',
  'Haha, that belongs in #memes. Love it.',
  'Need a quick summary? I can draft one.',
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
      description: description?.trim() || 'New private chat',
      participants: [ownerId.value, 'helper-bot'],
      messages: [
        createMessage({
          authorId: 'helper-bot',
          authorName: 'Helper Bot',
          body: `Thanks for starting ${trimmedTitle}. Say hi!`,
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
