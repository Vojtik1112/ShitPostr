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
    createError.value = error.message || 'Místnost se nepodařilo založit.'
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
          <h2>Nová místnost</h2>
          <p>Pojmenuj čerstvě vyleštěnou kabinku a pozvi posádku ke sdílení.</p>
        </header>
        <form @submit.prevent="handleCreateConversation">
          <label>
            <span>Název místnosti</span>
            <input v-model="createForm.title" type="text" placeholder="Noční splachovací kruh" maxlength="30" />
            <small v-if="createForm.title.length > 0" class="char-count">{{ createForm.title.length }}/30</small>
          </label>
          <label>
            <span>Popis</span>
            <textarea v-model="createForm.description" rows="3" placeholder="Plánujeme velkou splachovací loupež" maxlength="200"></textarea>
            <small v-if="createForm.description.length > 0" class="char-count">{{ createForm.description.length }}/200</small>
          </label>
          <p v-if="createError" class="error">{{ createError }}</p>
          <footer>
            <button type="button" class="ghost" @click="closeCreateModal">Možná později</button>
            <button type="submit">Založit místnost</button>
          </footer>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.chat-layout {
  position: relative;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
  gap: 2rem;
  padding: 3.5rem 1.75rem 3.5rem;
  width: min(1120px, calc(100% - 2.5rem));
  margin: 0 auto;
  align-items: stretch;
  min-height: calc(100vh - 6rem);
  animation: chat-layout-in 0.45s ease both;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(22, 11, 6, 0.72);
  display: grid;
  place-items: center;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.modal {
  width: min(480px, 100%);
  background: rgba(42, 20, 8, 0.92);
  border-radius: 1.75rem;
  border: 1px solid rgba(255, 240, 214, 0.18);
  box-shadow: 0 38px 120px -50px rgba(0, 0, 0, 0.65);
  padding: 2.25rem;
  display: grid;
  gap: 1.5rem;
}

.modal header h2 {
  margin: 0;
  color: var(--sand-050);
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
  color: var(--sand-100);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
}

input,
textarea {
  border-radius: 1rem;
  border: 1px solid rgba(255, 240, 214, 0.16);
  padding: 0.9rem 1.1rem;
  font-size: 1rem;
  background: rgba(132, 118, 109, 0.5);
  color: var(--sand-050);
  transition: border 0.2s ease, background 0.2s ease;
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: rgba(255, 240, 214, 0.42);
  background: rgba(149, 132, 121, 0.6);
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
  border-radius: 999px;
  padding: 0.8rem 1.8rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  color: var(--sand-050);
  background: linear-gradient(125deg, rgba(151, 143, 136, 0.85), rgba(123, 113, 106, 0.85));
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

button.ghost {
  background: transparent;
  border: 1px solid rgba(255, 240, 214, 0.24);
  color: var(--sand-100);
}

.error {
  color: var(--danger-primary);
  font-weight: 600;
  margin: 0;
}

.char-count {
  color: var(--text-subtle);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  margin-top: 0.25rem;
}

@media (max-width: 1080px) {
  .chat-layout {
    width: min(1020px, calc(100% - 2rem));
    grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
  }
}

@media (max-width: 960px) {
  .chat-layout {
    padding: 3rem 1.5rem 3.25rem;
    gap: 1.5rem;
  }
}

@media (max-width: 860px) {
  .chat-layout {
    grid-template-columns: minmax(0, 1fr);
    padding: 2.5rem 1.1rem 3rem;
    width: calc(100% - 1.5rem);
  }

  .chat-layout :deep(.sidebar) {
    position: sticky;
    top: 4.5rem;
    z-index: 5;
  }
}

@media (max-width: 640px) {
  .chat-layout {
    padding-top: 2rem;
  }
}

@keyframes chat-layout-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
