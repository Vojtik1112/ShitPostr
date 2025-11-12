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
      <div v-if="!messages.length" class="chat-window__empty">
        <h3>Budiž první škrábanec.</h3>
        <p>Seď rovně, seber odvahu a napiš úvodní graffiti.</p>
      </div>
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
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: rgba(27, 13, 6, 0.72);
  border-radius: 2.3rem;
  border: 1px solid rgba(255, 240, 214, 0.12);
  box-shadow: 0 38px 120px -60px rgba(0, 0, 0, 0.65);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.chat-window::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(246, 183, 104, 0.18), transparent 55%),
    radial-gradient(circle at bottom left, rgba(95, 55, 31, 0.25), transparent 50%);
  pointer-events: none;
  opacity: 0.8;
}

.chat-window > * {
  position: relative;
  z-index: 1;
}

.chat-window__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.6rem 2rem;
  border-bottom: 1px solid rgba(255, 240, 214, 0.12);
  background: rgba(255, 245, 221, 0.06);
  min-width: 0;
  gap: 1.25rem;
}

.chat-window__header > div {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.chat-window__header h2 {
  margin: 0;
  color: var(--sand-050);
  letter-spacing: 0.03em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
}

.chat-window__header p {
  margin: 0.45rem 0 0;
  color: rgba(255, 245, 221, 0.72);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.35;
}

.participant-count {
  font-size: 0.78rem;
  color: rgba(255, 245, 221, 0.76);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  flex-shrink: 0;
  white-space: nowrap;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 240, 214, 0.22);
  background: rgba(255, 245, 221, 0.08);
}

.chat-window__messages {
  padding: 2.2rem 2.4rem;
  overflow-y: auto;
  display: grid;
  gap: 1.1rem;
  background: linear-gradient(180deg, rgba(17, 9, 4, 0.3), rgba(30, 15, 7, 0.6));
}

.chat-message {
  max-width: min(72%, 440px);
  background: rgba(255, 245, 221, 0.18);
  border-radius: 1.35rem 1.35rem 1.35rem 0.6rem;
  border: 1px solid rgba(255, 240, 214, 0.1);
  padding: 1rem 1.25rem;
  display: grid;
  gap: 0.45rem;
  color: var(--sand-050);
  box-shadow: 0 18px 60px -48px rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
}

.chat-message.outgoing {
  margin-left: auto;
  border-radius: 1.35rem 1.35rem 0.6rem 1.35rem;
  background: rgba(246, 183, 104, 0.28);
  border-color: rgba(246, 183, 104, 0.36);
  color: #2b1408;
  box-shadow: 0 22px 60px -38px rgba(246, 183, 104, 0.55);
}

.chat-message header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 245, 221, 0.7);
}

.chat-message.outgoing header {
  color: rgba(43, 20, 8, 0.72);
}

.chat-message p {
  margin: 0;
  line-height: 1.55;
  color: inherit;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.chat-window__empty {
  border: 1px dashed rgba(255, 240, 214, 0.2);
  border-radius: 1.5rem;
  padding: 2.25rem 1.5rem;
  display: grid;
  gap: 0.6rem;
  text-align: center;
  background: rgba(255, 245, 221, 0.05);
  color: rgba(255, 245, 221, 0.75);
}

.chat-window__empty h3 {
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.95rem;
  color: var(--sand-050);
}

.chat-window__empty p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 245, 221, 0.7);
}

.chat-window__composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.15rem;
  padding: 1.45rem 2rem;
  border-top: 1px solid rgba(255, 240, 214, 0.12);
  background: rgba(255, 245, 221, 0.06);
  backdrop-filter: blur(14px);
}

textarea {
  resize: none;
  border-radius: 1.2rem;
  border: 1px solid rgba(255, 240, 214, 0.16);
  padding: 1rem 1.4rem;
  font-size: 1rem;
  background: rgba(255, 245, 221, 0.12);
  color: var(--sand-050);
  line-height: 1.55;
  transition: border 0.2s ease, background 0.2s ease;
  min-height: 3.5rem;
}

textarea::placeholder {
  color: rgba(255, 245, 221, 0.6);
}

textarea:focus {
  outline: none;
  border-color: rgba(255, 240, 214, 0.38);
  background: rgba(255, 245, 221, 0.18);
}

button {
  border-radius: 999px;
  border: none;
  padding: 0.9rem 2.1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--sand-050);
  background: linear-gradient(135deg, rgba(151, 143, 136, 0.9), rgba(123, 113, 106, 0.82));
  text-transform: uppercase;
  letter-spacing: 0.14em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 18px 38px -28px rgba(0, 0, 0, 0.65);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

button:hover:enabled {
  transform: translateY(-2px);
  box-shadow: 0 24px 40px -30px rgba(0, 0, 0, 0.65);
}

.chat-window--empty {
  place-items: center;
  text-align: center;
  padding: 6rem 2.4rem;
  color: rgba(255, 245, 221, 0.82);
  border: 1px dashed rgba(255, 240, 214, 0.22);
  background: rgba(27, 13, 6, 0.56);
  border-radius: 2.3rem;
}

.chat-window--empty h2 {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.chat-window--empty p {
  max-width: 42ch;
}

.chat-window__messages::-webkit-scrollbar {
  width: 6px;
}

.chat-window__messages::-webkit-scrollbar-thumb {
  background: rgba(255, 240, 214, 0.24);
  border-radius: 999px;
}

@media (max-width: 1024px) {
  .chat-window__messages {
    padding: 2rem 2rem;
  }
}

@media (max-width: 900px) {
  .chat-window__header {
    padding: 1.4rem 1.6rem;
  }

  .chat-window__composer {
    padding: 1.3rem 1.6rem;
  }
}

@media (max-width: 720px) {
  .chat-window__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .participant-count {
    margin-left: auto;
  }

  .chat-window__composer {
    grid-template-columns: minmax(0, 1fr);
  }

  button {
    width: 100%;
    justify-self: flex-end;
  }
}

@media (max-width: 520px) {
  .chat-window__messages {
    padding: 1.6rem 1.3rem;
  }

  .chat-message {
    max-width: 100%;
  }
}
</style>
