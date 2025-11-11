<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="welcome">
    <div class="welcome__hero">
      <h1>Spláchni horká moudra s partou.</h1>
      <p>
        ShitPostr je společná nástěnka na dveřích kabinky. Zaber si místo, zanech vzkaz a sleduj reakce v reálném
        čase bez filtru algoritmů.
      </p>
      <div class="welcome__cta">
        <RouterLink class="btn primary" :to="{ name: 'register' }">Získat kabinku</RouterLink>
        <RouterLink class="btn ghost" :to="{ name: 'login' }">Už mám papír</RouterLink>
      </div>
    </div>
    <div class="welcome__card-grid">
      <article class="info-card">
        <h3>Kabinka vedle kabinky</h3>
        <p>Myšlenku pošleš rychleji než spláchneš. Všichni ji slyší, nikdo ji neodscrolluje.</p>
      </article>
      <article class="info-card">
        <h3>Chaos pod kontrolou</h3>
        <p>Zakládáš tématické kabinky, připínáš elitní graffiti a účtenky schováváš do voňavých košů.</p>
      </article>
      <article class="info-card">
        <h3>Oslav bordel</h3>
        <p>Vlastní avatary, statusy a ochotný uklízeč bot, který ti poblahopřeje ke každému riskantnímu rozhodnutí.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.welcome {
  display: grid;
  gap: 4rem;
  padding: 4.5rem 2.5rem 3rem;
  max-width: 960px;
  margin: 0 auto;
}

.welcome__hero {
  display: grid;
  gap: 1.5rem;
  text-align: left;
}

.welcome__hero h1 {
  font-size: clamp(2.5rem, 5vw, 3.75rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0;
  color: var(--sand-050);
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
</style>
