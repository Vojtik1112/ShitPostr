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
const filterMode = ref('all')

const totalUnread = computed(() => {
  return props.conversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0)
})

const filteredByQuery = computed(() => {
  if (!query.value.trim()) {
    return props.conversations
  }
  const q = query.value.trim().toLowerCase()
  return props.conversations.filter((conversation) => {
    const title = (conversation.title || '').toLowerCase()
    const description = (conversation.description || '').toLowerCase()
    return title.includes(q) || description.includes(q)
  })
})

const filteredConversations = computed(() => {
  if (filterMode.value === 'unread') {
    return filteredByQuery.value.filter((conversation) => (conversation.unreadCount || 0) > 0)
  }
  return filteredByQuery.value
})

const handleSelect = (conversationId) => {
  emit('select', conversationId)
}

const handleCreate = () => {
  emit('create')
}

const setFilterMode = (mode) => {
  filterMode.value = mode
}

const lastMessageOf = (conversation) => {
  if (conversation.lastMessage) {
    return conversation.lastMessage
  }
  if (Array.isArray(conversation.messages) && conversation.messages.length > 0) {
    return conversation.messages[conversation.messages.length - 1]
  }
  return null
}

const timeFormatter = typeof Intl !== 'undefined' ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }) : null
const dayFormatter = typeof Intl !== 'undefined' ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }) : null

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return ''
  }
  const parsed = Date.parse(timestamp)
  if (Number.isNaN(parsed)) {
    return ''
  }
  if (!timeFormatter || !dayFormatter) {
    return new Date(parsed).toLocaleTimeString()
  }
  const date = new Date(parsed)
  const now = new Date()
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return timeFormatter.format(date)
  }
  return dayFormatter.format(date)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__header">
      <h2>Místnosti</h2>
      <button type="button" class="pill" @click="handleCreate">+ Nová místnost</button>
    </div>
    <div class="sidebar__filters" role="radiogroup" aria-label="Filtr místností">
      <button
        type="button"
        class="filter-pill"
        :class="{ active: filterMode === 'all' }"
        :aria-pressed="filterMode === 'all'
          ? 'true'
          : 'false'"
        @click="setFilterMode('all')"
      >
        <span>Vše</span>
      </button>
      <button
        type="button"
        class="filter-pill"
        :class="{ active: filterMode === 'unread', muted: !totalUnread }"
        :aria-pressed="filterMode === 'unread'
          ? 'true'
          : 'false'"
        @click="setFilterMode('unread')"
      >
        <span>Nepřečtené</span>
        <span v-if="totalUnread" class="filter-pill__badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
      </button>
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
          <p v-if="conversation.description" class="conversation__meta">{{ conversation.description }}</p>
          <div class="conversation__footer">
            <p v-if="lastMessageOf(conversation)" class="conversation__preview">
              {{ lastMessageOf(conversation).authorName }}:
              <span>{{ lastMessageOf(conversation).body }}</span>
            </p>
            <span v-else class="conversation__empty">Zatím prázdná kabinka</span>
            <div class="conversation__status">
              <span v-if="lastMessageOf(conversation)" class="conversation__time">
                {{ formatTimestamp(lastMessageOf(conversation).timestamp) }}
              </span>
              <span
                v-if="conversation.unreadCount"
                class="conversation__badge"
                :aria-label="`Nepřečtených zpráv: ${conversation.unreadCount}`"
              >
                {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
              </span>
            </div>
          </div>
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
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 1.35rem;
  background: rgba(27, 12, 6, 0.75);
  border-radius: 2rem;
  padding: 1.65rem 1.45rem;
  border: 1px solid rgba(255, 240, 214, 0.12);
  box-shadow: 0 32px 110px -60px rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(18px);
  overflow: hidden;
  min-width: 0;
  color: var(--sand-050);
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.sidebar__header h2 {
  margin: 0;
  font-size: 1.05rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sand-050);
}

.pill {
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 240, 214, 0.24);
  background: rgba(255, 240, 214, 0.08);
  color: var(--sand-050);
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.pill:hover {
  border-color: rgba(255, 240, 214, 0.45);
  background: rgba(255, 240, 214, 0.16);
}

.sidebar__search input {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 240, 214, 0.18);
  background: rgba(255, 240, 214, 0.08);
  color: var(--sand-050);
  font-weight: 500;
  transition: border 0.2s ease, background 0.2s ease;
}

.sidebar__search input::placeholder {
  color: rgba(255, 245, 221, 0.6);
}

.sidebar__search input:focus {
  outline: none;
  border-color: rgba(255, 240, 214, 0.45);
  background: rgba(255, 240, 214, 0.14);
}

.sidebar__filters {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-pill {
  border-radius: 999px;
  border: 1px solid rgba(255, 240, 214, 0.14);
  background: rgba(255, 245, 221, 0.05);
  padding: 0.35rem 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255, 245, 221, 0.75);
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: border 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.filter-pill.active {
  border-color: rgba(255, 240, 214, 0.45);
  background: rgba(255, 245, 221, 0.18);
  color: var(--sand-050);
}

.filter-pill.muted {
  opacity: 0.7;
}

.filter-pill__badge {
  border-radius: 999px;
  padding: 0.05rem 0.55rem;
  background: rgba(255, 245, 221, 0.22);
  color: var(--brown-900);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
}

.sidebar__list {
  overflow-y: auto;
  display: grid;
  gap: 0.95rem;
  padding-right: 0.35rem;
}

.conversation {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  text-align: left;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 240, 214, 0.08);
  background: rgba(255, 245, 221, 0.08);
  color: var(--sand-050);
  transition: transform 0.2s ease, border 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  min-width: 0;
  overflow: hidden;
}

.conversation:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 240, 214, 0.45);
  background: rgba(255, 245, 221, 0.18);
  box-shadow: 0 18px 50px -40px rgba(0, 0, 0, 0.7);
}

.conversation.active {
  border-color: rgba(255, 240, 214, 0.65);
  background: rgba(255, 245, 221, 0.22);
  box-shadow: 0 26px 60px -42px rgba(0, 0, 0, 0.75);
}

.conversation__avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 245, 221, 0.22);
  border: 1px solid rgba(255, 240, 214, 0.18);
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
  gap: 0.35rem;
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
  color: rgba(255, 245, 221, 0.7);
  font-size: 0.85rem;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
}

.conversation__footer {
  margin-top: 0.4rem;
  display: grid;
  gap: 0.4rem;
}

.conversation__preview {
  color: rgba(255, 245, 221, 0.72);
  font-size: 0.82rem;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.3;
  flex: 1 1 auto;
}

.conversation__preview span {
  color: inherit;
}

.conversation__empty {
  color: rgba(255, 245, 221, 0.55);
  font-size: 0.8rem;
  flex: 1 1 auto;
}

.conversation__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 245, 221, 0.24);
  color: var(--brown-900);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.conversation__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.conversation__time {
  font-size: 0.75rem;
  color: rgba(255, 245, 221, 0.7);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar__empty {
  align-self: center;
  text-align: center;
  display: grid;
  gap: 0.85rem;
  color: rgba(255, 245, 221, 0.7);
}

.sidebar__empty .pill {
  justify-self: center;
}

.sidebar__list::-webkit-scrollbar {
  width: 6px;
}

.sidebar__list::-webkit-scrollbar-thumb {
  background: rgba(255, 245, 221, 0.24);
  border-radius: 999px;
}

@media (max-width: 960px) {
  .sidebar {
    padding: 1.5rem 1.25rem;
  }

  .conversation {
    padding: 0.9rem;
  }
}

@media (max-width: 860px) {
  .sidebar {
    grid-template-rows: auto auto auto minmax(0, 1fr);
    height: auto;
    min-height: 0;
  }
}

@media (max-width: 600px) {
  .sidebar {
    padding: 1.4rem 1.05rem;
  }

  .conversation__avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
