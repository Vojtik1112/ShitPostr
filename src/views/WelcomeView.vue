<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="welcome">
    <div class="welcome__hero">
      <h1>Group chats without the chaos.</h1>
      <p>
        ShitPostr keeps your crew connected with threads, playful reactions, and helper bots that hype you up.
        Spin up a room, drop your hottest take, and keep the vibe moving.
      </p>
      <div class="welcome__cta">
        <RouterLink class="btn primary" :to="{ name: 'register' }">Create account</RouterLink>
        <RouterLink class="btn ghost" :to="{ name: 'login' }">Log in</RouterLink>
      </div>
    </div>
    <div class="welcome__card-grid">
      <article class="info-card">
        <h3>Drop takes instantly</h3>
        <p>Hit send and the gang sees it right away. No algorithms, no feeds to scroll.</p>
      </article>
      <article class="info-card">
        <h3>Stay organised</h3>
        <p>Spin up topic rooms, keep receipts, and pin the best memes for later.</p>
      </article>
      <article class="info-card">
        <h3>Bring your persona</h3>
        <p>Custom avatars, status blurbs, and helper bots cheering from the sidelines.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.welcome {
  display: grid;
  gap: 4rem;
  padding: 4rem 2rem 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.welcome__hero {
  display: grid;
  gap: 1.5rem;
  text-align: left;
}

.welcome__hero h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  letter-spacing: -0.04em;
  margin: 0;
  color: var(--text-strong);
}

.welcome__hero p {
  max-width: 60ch;
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1.6;
}

.welcome__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #8a63ff, #ff619d);
  color: #fff;
  box-shadow: 0 12px 30px -12px rgba(138, 99, 255, 0.65);
}

.btn.primary:hover {
  transform: translateY(-2px);
}

.btn.ghost {
  border: 1px solid var(--border-strong);
  color: var(--text-strong);
}

.welcome__card-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.info-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--surface-panel);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 10px 30px -22px rgba(20, 13, 32, 0.45);
}

.info-card h3 {
  margin-bottom: 0.5rem;
  color: var(--text-strong);
}

.info-card p {
  margin: 0;
  color: var(--text-subtle);
}
</style>
