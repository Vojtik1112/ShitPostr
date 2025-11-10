<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useAuthStore } from './stores/auth'
import { useChatStore } from './stores/chat'

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
    <AppHeader v-if="showHeader" />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
