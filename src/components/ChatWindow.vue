<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  conversation: {
    type: Object,
    default: null,
  },
  currentUser: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['send'])

const draft = ref('')
const messageListRef = ref(null)

const messages = computed(() => props.conversation?.messages ?? [])

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  },
)

const authorIsCurrentUser = (message) => message.authorId === props.currentUser?.id

const sendDraft = () => {
  if (!draft.value.trim()) {
    return
  }
  emit('send', draft.value)
  draft.value = ''
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendDraft()
  }
}
</script>

<template>
  <section class="chat-window" v-if="conversation">
    <header class="chat-window__header">
      <div>
        <h2>{{ conversation.title }}</h2>
        <p>{{ conversation.description }}</p>
      </div>
      <span class="participant-count">{{ conversation.participants.length }} stallmates</span>
    </header>
    <div ref="messageListRef" class="chat-window__messages">
      <article
        v-for="message in messages"
        :key="message.id"
        class="chat-message"
        :class="{ outgoing: authorIsCurrentUser(message) }"
      >
        <header>
          <span class="author">{{ message.authorName }}</span>
          <time>{{ new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</time>
        </header>
        <p>{{ message.body }}</p>
      </article>
    </div>
    <form class="chat-window__composer" @submit.prevent="sendDraft">
      <textarea
        v-model="draft"
        rows="2"
        placeholder="Drop a porcelain proclamation"
        @keydown="handleKeydown"
      ></textarea>
      <button type="submit" :disabled="!draft.trim()">Flush</button>
    </form>
  </section>
  <section v-else class="chat-window chat-window--empty">
    <h2>Select a stall to get started</h2>
    <p>Crack open a new porcelain palace or slide into an existing gossip loop.</p>
  </section>
</template>

<style scoped>
.chat-window {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--surface-primary);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.chat-window__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-panel);
}

.chat-window__header h2 {
  margin: 0;
  color: var(--text-strong);
  letter-spacing: -0.02em;
}

.chat-window__header p {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
}

.participant-count {
  font-size: 0.85rem;
  color: var(--text-subtle);
}

.chat-window__messages {
  padding: 1.5rem;
  overflow-y: auto;
  display: grid;
  gap: 1rem;
  background: linear-gradient(180deg, rgba(205, 140, 67, 0.12), transparent 120%);
}

.chat-message {
  max-width: 70%;
  background: var(--surface-panel);
  border-radius: 1rem;
  border: 1px solid var(--border-subtle);
  padding: 0.85rem 1rem;
  display: grid;
  gap: 0.35rem;
  color: var(--text-strong);
}

.chat-message.outgoing {
  margin-left: auto;
  background: linear-gradient(135deg, rgba(196, 115, 47, 0.35), rgba(139, 79, 31, 0.3));
  border-color: transparent;
}

.chat-message header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
}

.chat-message p {
  margin: 0;
  line-height: 1.5;
  color: inherit;
}

.chat-window__composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-panel);
}

textarea {
  resize: none;
  border-radius: 1rem;
  border: 1px solid var(--border-subtle);
  padding: 0.9rem 1rem;
  font-size: 1rem;
  background: var(--surface-primary);
  color: var(--text-strong);
  line-height: 1.5;
}

textarea:focus {
  outline: 3px solid rgba(196, 115, 47, 0.25);
  border-color: var(--accent-primary);
}

button {
  border-radius: 999px;
  border: none;
  padding: 0.75rem 1.75rem;
  font-weight: 600;
  cursor: pointer;
  color: #fffbe3;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  transition: transform 0.2s ease;
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

button:hover:enabled {
  transform: translateY(-2px);
}

.chat-window--empty {
  place-items: center;
  text-align: center;
  padding: 6rem 2rem;
  color: var(--text-muted);
  border: 2px dashed var(--border-subtle);
}
</style>
