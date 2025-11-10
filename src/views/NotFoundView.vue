<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="not-found">
    <h1>404</h1>
    <p>You reached the end of the feed. Nothing but tumbleweed here.</p>
    <RouterLink class="btn" :to="{ name: 'chat' }">Back to chat</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  min-height: calc(100vh - 6rem);
  display: grid;
  place-items: center;
  text-align: center;
  gap: 1.5rem;
}

h1 {
  font-size: clamp(4rem, 20vw, 9rem);
  margin: 0;
  color: var(--accent-primary);
  letter-spacing: -0.05em;
}

p {
  margin: 0;
  max-width: 42ch;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #8a63ff, #ff619d);
  color: #fff;
  font-weight: 600;
}
</style>
