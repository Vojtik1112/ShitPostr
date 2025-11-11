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
      <span class="participant-count">{{ conversation.participants.length }} členů kabinky</span>
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
        placeholder="Napiš, co se právě děje"
        @keydown="handleKeydown"
      ></textarea>
      <button type="submit" :disabled="!draft.trim()">Odeslat</button>
    </form>
  </section>
  <section v-else class="chat-window chat-window--empty">
    <h2>Vyber místnost</h2>
    <p>Vytvoř novou kabinku nebo se připoj k té, kde to právě bublá.</p>
  </section>
</template>

<style scoped>
.chat-window {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: linear-gradient(180deg, rgba(250, 220, 165, 0.94), rgba(249, 228, 193, 0.92));
  border-radius: 2.25rem;
  box-shadow: 0 38px 120px -60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.chat-window__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(58, 36, 20, 0.08);
  background: rgba(255, 255, 255, 0.45);
  min-width: 0;
  gap: 1rem;
}

.chat-window__header > div {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.chat-window__header h2 {
  margin: 0;
  color: #3b1c0d;
  letter-spacing: 0.02em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
}

.chat-window__header p {
  margin: 0.35rem 0 0;
  color: rgba(58, 36, 20, 0.7);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
}

.participant-count {
  font-size: 0.85rem;
  color: rgba(58, 36, 20, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  flex-shrink: 0;
  white-space: nowrap;
}

.chat-window__messages {
  padding: 2rem;
  overflow-y: auto;
  display: grid;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.2);
}

.chat-message {
  max-width: 70%;
  background: rgba(186, 180, 172, 0.85);
  border-radius: 1.4rem;
  border: 1px solid transparent;
  padding: 1rem 1.2rem;
  display: grid;
  gap: 0.35rem;
  color: #312115;
}

.chat-message.outgoing {
  margin-left: auto;
  background: rgba(246, 183, 104, 0.92);
  color: #2f1608;
  border-color: rgba(58, 36, 20, 0.08);
  box-shadow: 0 12px 28px -20px rgba(58, 36, 20, 0.6);
}

.chat-message header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(58, 36, 20, 0.7);
}

.chat-message p {
  margin: 0;
  line-height: 1.5;
  color: inherit;
}

.chat-window__composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(58, 36, 20, 0.08);
  background: rgba(255, 255, 255, 0.45);
}

textarea {
  resize: none;
  border-radius: 999px;
  border: 1px solid rgba(58, 36, 20, 0.16);
  padding: 1rem 1.4rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  color: #3b1c0d;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: rgba(58, 36, 20, 0.38);
}

button {
  border-radius: 999px;
  border: none;
  padding: 0.85rem 2.1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--sand-050);
  background: linear-gradient(125deg, rgba(151, 143, 136, 0.85), rgba(123, 113, 106, 0.85));
  text-transform: uppercase;
  letter-spacing: 0.14em;
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
  color: rgba(255, 255, 255, 0.75);
  border: 2px dashed rgba(255, 255, 255, 0.25);
  background: rgba(42, 20, 8, 0.4);
}
</style>
