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
      <h2>Rooms</h2>
      <button type="button" class="pill" @click="handleCreate">+ New room</button>
    </div>
    <div class="sidebar__search">
      <input v-model="query" type="search" placeholder="Search rooms" />
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
        <div class="conversation__title">{{ conversation.title }}</div>
        <p class="conversation__meta">{{ conversation.description }}</p>
        <p
          v-if="conversation.messages && conversation.messages.length"
          class="conversation__preview"
        >
          {{ conversation.messages[conversation.messages.length - 1].authorName }}:
          <span>{{ conversation.messages[conversation.messages.length - 1].body }}</span>
        </p>
      </button>
    </div>
    <div class="sidebar__empty" v-else>
      <p>No rooms matched. Create a fresh one!</p>
      <button type="button" class="pill" @click="handleCreate">Start a room</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 1rem;
  background: var(--surface-panel);
  border-right: 1px solid var(--border-subtle);
  padding: 1.5rem 1.25rem;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar__header h2 {
  margin: 0;
  font-size: 1.1rem;
  letter-spacing: -0.01em;
  color: var(--text-strong);
}

.pill {
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-strong);
  font-weight: 600;
  cursor: pointer;
}

.sidebar__search input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-subtle);
  background: var(--surface-primary);
  color: var(--text-strong);
}

.sidebar__list {
  overflow-y: auto;
  display: grid;
  gap: 0.75rem;
}

.conversation {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem 0.75rem;
  text-align: left;
  border-radius: 1rem;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  transition: border 0.2s ease, background 0.2s ease;
  cursor: pointer;
}

.conversation:hover {
  border-color: var(--border-subtle);
  background: rgba(138, 99, 255, 0.06);
}

.conversation.active {
  border-color: var(--accent-primary);
  background: rgba(138, 99, 255, 0.12);
}

.conversation__title {
  font-weight: 600;
  color: var(--text-strong);
}

.conversation__meta {
  color: var(--text-subtle);
  font-size: 0.85rem;
  margin: 0;
}

.conversation__preview {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}

.conversation__preview span {
  color: var(--text-subtle);
}

.sidebar__empty {
  align-self: center;
  text-align: center;
  display: grid;
  gap: 0.75rem;
  color: var(--text-muted);
}
</style>
