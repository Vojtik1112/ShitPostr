<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import logo from '../assets/Shitpostrlogo.png'

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
      <img :src="logo" alt="ShitPostr" class="brand__logo" />
      <span class="brand__copy">
        <span class="brand__title">ShitPostr</span>
      </span>
    </router-link>
    <nav class="app-nav">
      <router-link :to="{ name: 'chat' }">Místnosti</router-link>
      <router-link :to="{ name: 'profile' }">Profil</router-link>
    </nav>
    <div class="user-panel" v-if="user">
      <div class="avatar" :style="{ backgroundColor: user.avatarColor }">
        <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="Profilovka" />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="identity">
        <span class="name">{{ user.displayName }}</span>
        <span class="status">{{ user.statusMessage || 'Na trůně' }}</span>
      </div>
      <button class="ghost" type="button" @click="handleLogout">Odhlásit se</button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 2.25rem;
  border-bottom: 1px solid rgba(255, 240, 214, 0.08);
  background: linear-gradient(180deg, rgba(75, 38, 20, 0.88), rgba(43, 20, 8, 0.92));
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  text-decoration: none;
}

.brand__logo {
  width: 128px;
  height: 128px;
  object-fit: contain;
  display: block;
}

.brand__copy {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.brand__title {
  font-family: 'Pacifico', cursive;
  font-size: 1.75rem;
  letter-spacing: 0.04em;
}

.brand__tagline {
  font-size: 0.85rem;
  color: var(--text-subtle);
}

.app-nav {
  display: flex;
  gap: 1.5rem;
  font-weight: 600;
}

.app-nav a {
  color: var(--text-subtle);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
}

.app-nav a.router-link-active {
  color: var(--sand-050);
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
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255, 240, 214, 0.24);
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.identity {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.name {
  color: var(--sand-050);
  font-size: 0.95rem;
}

.status {
  color: var(--text-subtle);
  font-size: 0.8rem;
}

button.ghost {
  border: 1px solid rgba(255, 240, 214, 0.24);
  background: rgba(255, 240, 214, 0.06);
  color: var(--text-primary);
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
}
button.ghost:hover {
  border-color: rgba(255, 240, 214, 0.6);
  background: rgba(255, 240, 214, 0.18);
  color: var(--sand-050);
}
</style>
