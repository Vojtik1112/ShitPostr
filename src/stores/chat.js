import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth'

const API_URL = '/api/chat'
const SOCKET_URL = '/'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const conversations = ref([])
  const activeConversationId = ref(null)
  const isBootstrapped = ref(false)
  const socket = ref(null)

  const activeConversation = computed(() =>
    conversations.value.find((conversation) => conversation.id === activeConversationId.value) || null,
  )

  const connectSocket = () => {
    if (socket.value) return

    socket.value = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.value.on('connect', () => {
      console.log('Connected to socket server')
      // Re-join rooms if needed
      conversations.value.forEach(conv => {
        socket.value.emit('join_room', conv.id)
      })
    })

    socket.value.on('new_message', (message) => {
      const conversation = conversations.value.find(c => c.id === message.conversationId)
      if (conversation) {
        // Check if message already exists (optimistic update or duplicate)
        const exists = conversation.messages.some(m => m.id === message.id)
        if (!exists) {
          conversation.messages.push(message)
        }
      }
    })
  }

  const fetchConversations = async () => {
    if (!authStore.token) return

    try {
      const response = await fetch(`${API_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        conversations.value = data

        // Join all rooms
        if (socket.value) {
          data.forEach(conv => {
            socket.value.emit('join_room', conv.id)
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations', error)
    }
  }

  const bootstrap = async (user) => {
    if (!user) {
      reset()
      return
    }

    if (isBootstrapped.value) return

    connectSocket()
    await fetchConversations()

    if (conversations.value.length > 0 && !activeConversationId.value) {
      activeConversationId.value = conversations.value[0].id
    }

    isBootstrapped.value = true
  }

  const reset = () => {
    conversations.value = []
    activeConversationId.value = null
    isBootstrapped.value = false
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  const setActiveConversation = (conversationId) => {
    activeConversationId.value = conversationId
  }

  const createConversation = async ({ title, description }) => {
    if (!authStore.token) throw new Error('Not authenticated')

    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const newConversation = await response.json()
      conversations.value.unshift(newConversation)
      activeConversationId.value = newConversation.id

      if (socket.value) {
        socket.value.emit('join_room', newConversation.id)
      }

      return newConversation
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const sendMessage = (body, author) => {
    if (!activeConversation.value || !socket.value) {
      throw new Error('Cannot send message')
    }

    const message = {
      conversationId: activeConversation.value.id,
      authorId: author.id,
      authorName: author.displayName,
      body,
    }

    socket.value.emit('send_message', message)

    // Optimistic update? Maybe not needed if socket is fast enough, but good for UX.
    // Let's rely on socket event for now to ensure consistency.
  }

  const getUnreadCount = (conversationId) => {
    // TODO: Implement unread count logic with server support or local tracking
    return 0
  }

  return {
    activeConversation,
    activeConversationId,
    bootstrap,
    conversations,
    createConversation,
    getUnreadCount,
    isBootstrapped,
    reset,
    sendMessage,
    setActiveConversation,
  }
})
