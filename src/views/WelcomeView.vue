<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="welcome">
    <div class="welcome__hero">
      <h1>Flush hot takes with the homies.</h1>
      <p>
        ShitPostr is the communal bathroom wall of the internet. Claim a stall, scribble a take, and let the
        squad react in real time without the algorithmic air freshener.
      </p>
      <div class="welcome__cta">
        <RouterLink class="btn primary" :to="{ name: 'register' }">Claim a stall</RouterLink>
        <RouterLink class="btn ghost" :to="{ name: 'login' }">I already have TP</RouterLink>
      </div>
    </div>
    <div class="welcome__card-grid">
      <article class="info-card">
        <h3>Stall-to-stall banter</h3>
        <p>Drop a thought and it lands faster than the flush. Everybody hears it, nobody scrolls past.</p>
      </article>
      <article class="info-card">
        <h3>Contain the chaos</h3>
        <p>Spin up themed stalls, pin the premium bathroom graffiti, and keep receipts in scented bins.</p>
      </article>
      <article class="info-card">
        <h3>Celebrate the mess</h3>
        <p>Custom avatars, status blurbs, and a helpful janitor bot cheering on your questionable life choices.</p>
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
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: #fffbe3;
  box-shadow: 0 12px 30px -14px rgba(123, 69, 26, 0.6);
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
  background: linear-gradient(180deg, rgba(243, 201, 143, 0.35), transparent), var(--surface-panel);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-soft);
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
