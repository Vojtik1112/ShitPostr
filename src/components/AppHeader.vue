<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.currentUser)

const initials = computed(() => {
  if (!user.value?.displayName) {
    return ''
  }
  const parts = user.value.displayName.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="app-header">
    <router-link class="brand" :to="{ name: 'chat' }">
      <span class="brand__title">ShitPostr</span>
      <span class="brand__tagline">Live from the porcelain pipeline</span>
    </router-link>
    <nav class="app-nav">
      <router-link :to="{ name: 'chat' }">Toilet Talk</router-link>
      <router-link :to="{ name: 'profile' }">Stall Settings</router-link>
    </nav>
    <div class="user-panel" v-if="user">
      <div class="avatar" :style="{ backgroundColor: user.avatarColor }">{{ initials }}</div>
      <div class="identity">
        <span class="name">{{ user.displayName }}</span>
        <span class="status">{{ user.statusMessage || 'On the throne' }}</span>
      </div>
      <button class="ghost" type="button" @click="handleLogout">Log out</button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  display: flex;
  flex-direction: column;
  color: var(--text-strong);
  text-decoration: none;
}

.brand__title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.brand__tagline {
  font-size: 0.85rem;
  color: var(--text-subtle);
}

.app-nav {
  display: flex;
  gap: 1.25rem;
  font-weight: 500;
}

.app-nav a {
  color: var(--text-muted);
}

.app-nav a.router-link-active {
  color: var(--accent-primary);
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.identity {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.name {
  color: var(--text-strong);
  font-size: 0.95rem;
}

.status {
  color: var(--text-subtle);
  font-size: 0.8rem;
}

button.ghost {
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-strong);
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}
button.ghost:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}
</style>
