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
}

const createMessage = ({ authorId, authorName, body }) => ({
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
      conversations.value = []
      activeConversationId.value = null
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
      throw new Error('Chybí přihlášený uživatel.')
    }
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      throw new Error('Název místnosti je povinný.')
    }
    if (trimmedTitle.length > 30) {
      throw new Error('Název místnosti může mít maximálně 30 znaků.')
    }
    
    const trimmedDescription = description?.trim() || ''
    if (trimmedDescription.length > 200) {
      throw new Error('Popis může mít maximálně 200 znaků.')
    }

    const conversation = {
      id: `${ownerId.value}-${Date.now()}`,
      title: trimmedTitle,
      description: trimmedDescription || 'Zbrusu nová tajná kabinka',
      participants: [ownerId.value, 'helper-bot'],
      messages: [
        createMessage({
          authorId: 'helper-bot',
          authorName: 'Bot Uklízeč',
          body: `Čerstvě naleštěný porcelán hlásí: ${trimmedTitle} je otevřená všem přiznáním.`,
        }),
      ],
    }

    conversations.value = [conversation, ...conversations.value]
    activeConversationId.value = conversation.id
    return conversation
  }

  const sendMessage = (body, author) => {
    if (!activeConversation.value) {
      throw new Error('Vyber nejdřív místnost, než něco pošleš.')
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
        authorName: 'Bot Uklízeč',
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
