<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => authStore.currentUser)

const navId = 'app-header-nav'
const isNavOpen = ref(false)

const closeNav = () => {
  isNavOpen.value = false
}

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value
}

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
  closeNav()
  router.push({ name: 'login' })
}

watch(
  () => route.fullPath,
  () => {
    closeNav()
  },
)

watch(
  () => authStore.currentUser,
  () => {
    closeNav()
  },
)
</script>

<template>
  <header class="app-header" :class="{ 'is-open': isNavOpen }">
    <div class="app-header__brand">
      <button
        class="nav-toggle"
        type="button"
        :aria-expanded="isNavOpen ? 'true' : 'false'"
        :aria-controls="navId"
        @click="toggleNav"
      >
        <span class="sr-only">Přepnout navigaci</span>
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
      </button>
    </div>
    <div class="app-header__actions" :data-open="isNavOpen" :id="navId">
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
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 1.5rem;
  margin: 1.5rem auto 0;
  width: min(1120px, calc(100% - 2.5rem));
  background: rgba(42, 20, 8, 0.82);
  border: 1px solid rgba(255, 240, 214, 0.12);
  border-radius: 1.75rem;
  padding: 1rem 1.6rem;
  display: grid;
  gap: 0.75rem;
  z-index: 10;
  box-shadow: 0 28px 90px -50px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(18px);
}

.app-header__brand {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.nav-toggle {
  display: none;
  background: transparent;
  border: none;
  padding: 0.25rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.nav-toggle:focus-visible {
  outline: 2px solid rgba(255, 240, 214, 0.6);
  outline-offset: 3px;
}

.nav-toggle__bar {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--sand-050);
  border-radius: 999px;
}

.nav-toggle__bar + .nav-toggle__bar {
  margin-top: 5px;
}

.app-header__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.75rem;
}

.app-nav {
  display: flex;
  gap: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.app-nav a {
  color: var(--text-subtle);
  font-size: 0.8rem;
  transition: color 0.2s ease;
}

.app-nav a.router-link-active,
.app-nav a:focus-visible,
.app-nav a:hover {
  color: var(--sand-050);
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
  flex: 1 1 auto;
  justify-content: flex-end;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sand-050);
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255, 240, 214, 0.26);
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
  min-width: 0;
  flex: 0 1 220px;
}

.name {
  color: var(--sand-050);
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status {
  color: var(--text-subtle);
  font-size: 0.8rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.2;
}

button.ghost {
  border: 1px solid rgba(255, 240, 214, 0.24);
  background: rgba(255, 240, 214, 0.08);
  color: var(--sand-050);
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
  white-space: nowrap;
}

button.ghost:hover {
  border-color: rgba(255, 240, 214, 0.6);
  background: rgba(255, 240, 214, 0.18);
  color: var(--sand-050);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 1200px) {
  .app-header {
    width: min(1080px, calc(100% - 2rem));
  }
}

@media (max-width: 960px) {
}

@media (max-width: 800px) {
  .app-header__actions {
    gap: 1.25rem;
  }

  .identity {
    flex-basis: 180px;
  }
}

@media (max-width: 720px) {
  .app-header {
    top: 0;
    margin: 0;
    width: 100%;
    border-radius: 0 0 1.5rem 1.5rem;
    padding: 0.85rem 1rem 1rem;
    box-shadow: 0 16px 60px -40px rgba(0, 0, 0, 0.7);
  }

  .nav-toggle {
    display: inline-flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .app-header__actions {
    position: absolute;
    left: 1rem;
    right: 1rem;
    top: 100%;
    display: grid;
    gap: 1.25rem;
    padding: 1.2rem 1.25rem 1.4rem;
    border-radius: 1.5rem;
    background: rgba(27, 12, 5, 0.9);
    border: 1px solid rgba(255, 240, 214, 0.12);
    box-shadow: 0 26px 90px -50px rgba(0, 0, 0, 0.65);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-0.4rem);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .app-header__actions::before {
    content: '';
    position: absolute;
    top: -10px;
    right: 28px;
    width: 18px;
    height: 18px;
    transform: rotate(45deg);
    background: rgba(27, 12, 5, 0.9);
    border-left: 1px solid rgba(255, 240, 214, 0.12);
    border-top: 1px solid rgba(255, 240, 214, 0.12);
  }

  .app-header__actions[data-open='true'] {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0.4rem);
  }

  .app-nav {
    flex-direction: column;
    gap: 1rem;
  }

  .user-panel {
    justify-content: flex-start;
    border-top: 1px solid rgba(255, 240, 214, 0.12);
    padding-top: 1rem;
  }

  .identity {
    flex-basis: auto;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0.8rem 0.85rem 0.95rem;
  }

  .app-header__actions {
    left: 0.85rem;
    right: 0.85rem;
  }

  button.ghost {
    width: 100%;
    text-align: center;
  }
}
</style>
