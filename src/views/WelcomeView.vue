<script setup>
import { RouterLink } from 'vue-router';
import logoSrc from '../assets/Shitpostrlogo.png';
</script>

<template>
  <section class="welcome">
    <div class="welcome__hero">
      <div class="welcome__logo" aria-hidden="false">
        <img :src="logoSrc" alt="ShitPostr" class="auth-brand__logo" />
        <h1>SHITPOSTR</h1>
      </div>

      <p>
        ShitPostr je jednoduchá chatovací platforma pro kamarády.
      </p>

      <div class="welcome__cta">
        <RouterLink class="btn primary" :to="{ name: 'register' }">Vytvořit účet</RouterLink>
        <RouterLink class="btn ghost" :to="{ name: 'login' }">Přihlásit se</RouterLink>
      </div>
    </div>

    <div class="welcome__card-grid">
      <article class="info-card">
        <h3>Chatovací místnosti</h3>
        <p>Udělej si s kámošem společnou místnost, kde můžete dělat bordel společně.</p>
      </article>

      <article class="info-card">
        <h3>Chaos pod kontrolou</h3>
        <p>Zakládáš tématické kabinky a organizuješ srandy bez zbytečného bordelu.</p>
      </article>
    </div>

  </section>
</template>

<style scoped>
.welcome {
  display: grid;
  gap: 4rem;
  padding: 4.75rem 2.75rem 3.5rem;
  max-width: 1060px;
  margin: 0 auto;
}

.welcome__hero {
  display: grid;
  gap: 1.5rem;
  text-align: left;
}

.welcome__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* menší mezera mezi logem a názvem */
}

.logo-mark {
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
}

.welcome__hero h1 {
  font-family: 'Pacifico', cursive;
  font-size: 2rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
  color: var(--sand-050);
  font-weight: 400;
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
  padding: 0.95rem 1.9rem;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn.primary {
  background: linear-gradient(125deg, rgba(151, 143, 136, 0.85), rgba(123, 113, 106, 0.85));
  color: var(--sand-050);
  box-shadow: 0 18px 40px -20px rgba(0, 0, 0, 0.6);
}

.btn.primary:hover {
  transform: translateY(-2px);
}

.btn.ghost {
  border: 1px solid rgba(255, 240, 214, 0.24);
  color: var(--sand-050);
  background: rgba(255, 240, 214, 0.06);
}

.welcome__card-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.info-card {
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: rgba(42, 20, 8, 0.6);
  border: 1px solid rgba(255, 240, 214, 0.12);
  box-shadow: 0 32px 100px -60px rgba(0, 0, 0, 0.6);
}

.info-card h3 {
  margin-bottom: 0.5rem;
  color: var(--sand-050);
}

.info-card p {
  margin: 0;
  color: var(--text-muted);
}

.welcome__preview {
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  align-items: stretch;
}

.preview-card {
  border-radius: 2rem;
  padding: 2rem;
  border: 1px solid rgba(255, 240, 214, 0.14);
  background: rgba(27, 12, 5, 0.65);
  box-shadow: 0 36px 120px -70px rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(18px);
  display: grid;
  gap: 1.25rem;
}

.preview-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 245, 221, 0.7);
}

.preview-card .badge {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 240, 214, 0.3);
  background: rgba(255, 245, 221, 0.12);
  color: var(--sand-050);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}

.preview-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.preview-card li {
  padding: 1.1rem 1.25rem;
  border-radius: 1.4rem;
  background: rgba(255, 245, 221, 0.08);
  border: 1px solid rgba(255, 240, 214, 0.12);
  display: grid;
  gap: 0.35rem;
  position: relative;
}

.preview-card li::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(246, 183, 104, 0.18), transparent 45%);
  opacity: 0.9;
  pointer-events: none;
}

.preview-card .name {
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--sand-050);
}

.preview-card .message {
  color: rgba(255, 245, 221, 0.78);
  line-height: 1.45;
}

.preview-card .timestamp {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: rgba(255, 245, 221, 0.65);
  text-transform: uppercase;
}

.preview-notes {
  border-radius: 2rem;
  padding: 2.2rem 2rem;
  border: 1px solid rgba(255, 240, 214, 0.12);
  background: rgba(42, 20, 8, 0.58);
  box-shadow: 0 32px 100px -70px rgba(0, 0, 0, 0.7);
  display: grid;
  gap: 1.2rem;
}

.preview-notes h3 {
  margin: 0;
  color: var(--sand-050);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 1.15rem;
}

.preview-notes ul {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.preview-notes li::marker {
  color: rgba(246, 183, 104, 0.8);
}

.auth-brand__logo {
  width: clamp(180px, 6.5vw, 80px);
  height: auto;
  display: block;
  object-fit: contain;
}

@media (max-width: 960px) {
  .welcome {
    padding: 4rem 2rem 3rem;
    gap: 3.25rem;
  }

  .welcome__preview {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 680px) {
  .welcome {
    padding: 3.5rem 1.5rem 2.75rem;
  }

  .welcome__hero p {
    font-size: 1rem;
  }
}
</style>
