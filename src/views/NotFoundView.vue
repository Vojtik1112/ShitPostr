<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="not-found">
    <h1>404</h1>
    <p>Zatáhl/a jsi za špatnou páku. Tahle kabinka ústí přímo do prázdna.</p>
    <RouterLink class="btn" :to="{ name: 'chat' }">Zpět k místnostem</RouterLink>
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
  color: var(--sand-050);
  letter-spacing: 0.12em;
  text-transform: uppercase;
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
  padding: 0.95rem 2rem;
  border-radius: 999px;
  background: linear-gradient(125deg, rgba(151, 143, 136, 0.85), rgba(123, 113, 106, 0.85));
  color: var(--sand-050);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}
</style>
