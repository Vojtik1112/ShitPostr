<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  conversations: {
    type: Array,
    default: () => [],
  },
  activeId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select', 'create'])

const query = ref('')

const filteredConversations = computed(() => {
  if (!query.value.trim()) {
    return props.conversations
  }
  const q = query.value.trim().toLowerCase()
  return props.conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(q) || conversation.description.toLowerCase().includes(q),
  )
})

const handleSelect = (conversationId) => {
  emit('select', conversationId)
}

const handleCreate = () => {
  emit('create')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__header">
      <h2>Místnosti</h2>
      <button type="button" class="pill" @click="handleCreate">+ Nová místnost</button>
    </div>
    <div class="sidebar__search">
      <input v-model="query" type="search" placeholder="Hledat místnost" />
    </div>
    <div class="sidebar__list" v-if="filteredConversations.length">
      <button
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        type="button"
        class="conversation"
        :class="{ active: conversation.id === activeId }"
        @click="handleSelect(conversation.id)"
      >
        <span class="conversation__avatar">{{ conversation.title ? conversation.title.charAt(0).toUpperCase() : '?' }}</span>
        <span class="conversation__content">
          <span class="conversation__title">{{ conversation.title }}</span>
          <p class="conversation__meta">{{ conversation.description }}</p>
          <p
            v-if="conversation.messages && conversation.messages.length"
            class="conversation__preview"
          >
            {{ conversation.messages[conversation.messages.length - 1].authorName }}:
            <span>{{ conversation.messages[conversation.messages.length - 1].body }}</span>
          </p>
        </span>
      </button>
    </div>
    <div class="sidebar__empty" v-else>
      <p>Nenašli jsme žádnou místnost. Založ novou kabinku!</p>
      <button type="button" class="pill" @click="handleCreate">Založit místnost</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  height: 100%;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 1.25rem;
  background: rgba(250, 220, 165, 0.82);
  border-radius: 2rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid rgba(43, 20, 8, 0.12);
  box-shadow: 0 32px 90px -60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  min-width: 0;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar__header h2 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #3b1c0d;
}

.pill {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(58, 36, 20, 0.2);
  background: rgba(255, 255, 255, 0.45);
  color: #3b1c0d;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.sidebar__search input {
  width: 100%;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(58, 36, 20, 0.18);
  background: rgba(255, 255, 255, 0.55);
  color: #3b1c0d;
  font-weight: 500;
}

.sidebar__list {
  overflow-y: auto;
  display: grid;
  gap: 0.9rem;
}

.conversation {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  padding: 0.85rem 0.9rem;
  text-align: left;
  border-radius: 1.4rem;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.45);
  color: #3b1c0d;
  transition: transform 0.2s ease, border 0.2s ease, background 0.2s ease;
  cursor: pointer;
  min-width: 0;
  overflow: hidden;
}

.conversation:hover {
  transform: translateY(-2px);
  border-color: rgba(58, 36, 20, 0.26);
  background: rgba(255, 255, 255, 0.7);
}

.conversation.active {
  border-color: rgba(58, 36, 20, 0.65);
  background: rgba(255, 255, 255, 0.85);
}

.conversation__avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(58, 36, 20, 0.85);
  color: var(--sand-050);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.conversation__content {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
  overflow: hidden;
}

.conversation__title {
  font-weight: 700;
  letter-spacing: 0.02em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
}

.conversation__meta {
  color: rgba(58, 36, 20, 0.7);
  font-size: 0.85rem;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
}

.conversation__preview {
  color: rgba(58, 36, 20, 0.72);
  font-size: 0.85rem;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
}

.conversation__preview span {
  color: rgba(58, 36, 20, 0.72);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.sidebar__empty {
  align-self: center;
  text-align: center;
  display: grid;
  gap: 0.75rem;
  color: rgba(58, 36, 20, 0.7);
}
</style>
