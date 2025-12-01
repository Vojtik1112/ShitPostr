<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useAuthStore } from './stores/auth'
import { useChatStore } from './stores/chat'
import logo from './assets/Shitpostrlogo.png'

const authStore = useAuthStore()
const chatStore = useChatStore()

const ensureStoresAreReady = () => {
  authStore.initializeFromStorage()
  if (authStore.currentUser) {
    chatStore.bootstrap(authStore.currentUser)
  } else {
    chatStore.reset()
  }
}

onMounted(() => {
  ensureStoresAreReady()
})

watch(
  () => authStore.currentUser,
  (user) => {
    if (user) {
      chatStore.bootstrap(user)
    } else {
      chatStore.reset()
    }
  },
  { immediate: true },
)

const showHeader = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__background" aria-hidden="true">
      <span class="app-shell__glow app-shell__glow--one"></span>
      <span class="app-shell__glow app-shell__glow--two"></span>
      <span class="app-shell__glow app-shell__glow--three"></span>
      <span class="app-shell__texture"></span>
    </div>
    <div class="app-shell__content">
      <RouterLink v-if="showHeader" class="brand-corner" :to="{ name: 'chat' }">
        <img :src="logo" alt="ShitPostr" class="brand-corner__logo" />
        <span class="brand-corner__title">ShitPostr</span>
      </RouterLink>
      <AppHeader v-if="showHeader" />
      <main class="app-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-shell__background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.app-shell__glow {
  position: absolute;
  border-radius: 50%;
  opacity: 0.75;
  transform: translate3d(0, 0, 0);
}

.app-shell__glow--one {
  width: 42vw;
  height: 42vw;
  top: -18vw;
  left: -12vw;
  background: radial-gradient(circle, rgba(246, 183, 104, 0.4) 0%, rgba(246, 183, 104, 0) 70%);
}

.app-shell__glow--two {
  width: 48vw;
  height: 48vw;
  bottom: -22vw;
  right: -16vw;
  background: radial-gradient(circle, rgba(92, 56, 34, 0.45) 0%, rgba(92, 56, 34, 0) 70%);
}

.app-shell__glow--three {
  width: 32vw;
  height: 32vw;
  top: 35vh;
  right: 10vw;
  background: radial-gradient(circle, rgba(255, 245, 221, 0.22) 0%, rgba(255, 245, 221, 0) 70%);
}

.app-shell__texture {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 245, 221, 0.12) 1px, transparent 0);
  background-size: 70px 70px;
  opacity: 0.15;
  mix-blend-mode: screen;
}

.app-shell__content {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.brand-corner {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--sand-050);
  text-decoration: none;
  z-index: 100;
  transition: transform 0.2s ease, opacity 0.2s ease;
  pointer-events: auto;
}

.brand-corner:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.brand-corner__logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  display: block;
}

.brand-corner__title {
  font-family: 'Pacifico', cursive;
  font-size: 1.4rem;
  letter-spacing: 0.05em;
}

.app-main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 960px) {
  .app-shell__glow--three {
    right: 4vw;
    width: 40vw;
    height: 40vw;
  }

  .brand-corner__logo {
    width: 48px;
    height: 48px;
  }

  .brand-corner__title {
    font-size: 1.25rem;
  }
}

@media (max-width: 720px) {
  .app-shell__glow--one,
  .app-shell__glow--two,
  .app-shell__glow--three {
    display: none;
  }

  .app-shell__texture {
    opacity: 0.08;
  }

  .brand-corner {
    top: 1rem;
    left: 1rem;
  }

  .brand-corner__logo {
    width: 44px;
    height: 44px;
  }

  .brand-corner__title {
    font-size: 1.15rem;
  }
}

@media (max-width: 480px) {
  .brand-corner {
    top: 0.75rem;
    left: 0.75rem;
    gap: 0.5rem;
  }

  .brand-corner__logo {
    width: 40px;
    height: 40px;
  }

  .brand-corner__title {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-shell__glow {
    transition: none;
    animation: none;
  }
}
</style>
