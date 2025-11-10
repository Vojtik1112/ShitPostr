<script setup>
import { computed, reactive, ref } from 'vue'
import ChatSidebar from '../components/ChatSidebar.vue'
import ChatWindow from '../components/ChatWindow.vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

const authStore = useAuthStore()
const chatStore = useChatStore()

const conversations = computed(() => chatStore.conversations)
const activeConversation = computed(() => chatStore.activeConversation)

const showCreateModal = ref(false)
const createForm = reactive({
  title: '',
  description: '',
})
const createError = ref('')

const openCreateModal = () => {
  createForm.title = ''
  createForm.description = ''
  createError.value = ''
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleCreateConversation = () => {
  createError.value = ''
  try {
    const conversation = chatStore.createConversation({
      title: createForm.title,
      description: createForm.description,
    })
    if (conversation) {
      closeCreateModal()
    }
  } catch (error) {
    createError.value = error.message || 'Unable to prep that stall.'
  }
}

const handleSelectConversation = (conversationId) => {
  chatStore.setActiveConversation(conversationId)
}

const handleSendMessage = (body) => {
  if (!authStore.currentUser) {
    return
  }
  chatStore.sendMessage(body, authStore.currentUser)
}
</script>

<template>
  <div class="chat-layout">
    <ChatSidebar
      :conversations="conversations"
      :active-id="chatStore.activeConversationId"
      @select="handleSelectConversation"
      @create="openCreateModal"
    />
    <ChatWindow :conversation="activeConversation" :current-user="authStore.currentUser" @send="handleSendMessage" />

    <div v-if="showCreateModal" class="modal-backdrop" @click.self="closeCreateModal">
      <section class="modal">
        <header>
          <h2>New stall</h2>
          <p>Name your next porcelain hangout and invite the crew to overshare.</p>
        </header>
        <form @submit.prevent="handleCreateConversation">
          <label>
            <span>Stall name</span>
            <input v-model="createForm.title" type="text" placeholder="Midnight flush circle" />
          </label>
          <label>
            <span>Description</span>
            <textarea v-model="createForm.description" rows="3" placeholder="Plotting the great flush heist"></textarea>
          </label>
          <p v-if="createError" class="error">{{ createError }}</p>
          <footer>
            <button type="button" class="ghost" @click="closeCreateModal">Maybe later</button>
            <button type="submit">Install stall</button>
          </footer>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.chat-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: calc(100vh - 5rem);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(58, 36, 20, 0.6);
  display: grid;
  place-items: center;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.modal {
  width: min(480px, 100%);
  background: linear-gradient(180deg, rgba(220, 168, 101, 0.18), transparent), var(--surface-primary);
  border-radius: 1.25rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-soft);
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
}

.modal header h2 {
  margin: 0;
  color: var(--text-strong);
}

.modal header p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
}

form {
  display: grid;
  gap: 1.25rem;
}

label {
  display: grid;
  gap: 0.4rem;
  color: var(--text-strong);
  font-weight: 600;
}

input,
textarea {
  border-radius: 0.9rem;
  border: 1px solid var(--border-subtle);
  padding: 0.85rem 1rem;
  font-size: 1rem;
  background: var(--surface-panel);
  color: var(--text-strong);
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: 3px solid rgba(196, 115, 47, 0.25);
  border-color: var(--accent-primary);
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
  border-radius: 999px;
  padding: 0.75rem 1.6rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  color: #fffbe3;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

button.ghost {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-strong);
}

.error {
  color: var(--danger-primary);
  font-weight: 600;
  margin: 0;
}

@media (max-width: 1024px) {
  .chat-layout {
    grid-template-columns: 280px minmax(0, 1fr);
  }
}

@media (max-width: 860px) {
  .chat-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .chat-layout :deep(.sidebar) {
    position: sticky;
    top: 4.5rem;
    z-index: 5;
  }
}
</style>
