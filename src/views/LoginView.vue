<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const fieldErrors = reactive({
  email: '',
  password: '',
})

const submitting = ref(false)
const generalError = ref('')

const validate = () => {
  fieldErrors.email = ''
  fieldErrors.password = ''
  generalError.value = ''

  if (!form.email.trim()) {
    fieldErrors.email = 'Email is required.'
  }
  if (!form.password.trim()) {
    fieldErrors.password = 'Password is required.'
  }

  return !fieldErrors.email && !fieldErrors.password
}

const handleSubmit = async () => {
  if (!validate()) {
    return
  }

  submitting.value = true
  try {
    await authStore.login({ email: form.email, password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
    router.push(redirect || { name: 'chat' })
  } catch (error) {
    generalError.value = error.message || 'Login failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-layout">
    <section class="auth-card">
      <header>
        <h1>Welcome back to the stall</h1>
        <p>The crew kept the seat warm. Slide in and keep the pipeline flowing.</p>
      </header>
      <form class="auth-form" @submit.prevent="handleSubmit">
        <label>
          <span>Email</span>
          <input v-model="form.email" type="email" autocomplete="email" placeholder="you@example.com" />
          <small v-if="fieldErrors.email">{{ fieldErrors.email }}</small>
        </label>
        <label>
          <span>Password</span>
          <input v-model="form.password" type="password" autocomplete="current-password" placeholder="••••••••" />
          <small v-if="fieldErrors.password">{{ fieldErrors.password }}</small>
        </label>
        <p v-if="generalError" class="form-error">{{ generalError }}</p>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Unlocking stall...' : 'Enter bathroom' }}
        </button>
      </form>
      <footer>
        <p>
          No account yet?
          <RouterLink :to="{ name: 'register' }">Grab a key</RouterLink>
        </p>
      </footer>
    </section>
    <aside class="auth-aside">
      <h2>Keep the latrine lively</h2>
      <ul>
        <li>Thread replies keep gossip contained to the right stall.</li>
        <li>Janitor bot swings by with fresh air and friendly roasts.</li>
        <li>Your mess lives in the browser tank—no cloud plumbers involved.</li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: calc(100vh - 5rem);
  display: grid;
  grid-template-columns: minmax(0, 480px) minmax(0, 1fr);
  gap: 3rem;
  align-items: stretch;
  padding: 4rem 2rem;
}

.auth-card {
  background: linear-gradient(180deg, rgba(206, 150, 87, 0.18), transparent), var(--surface-panel);
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  padding: 2.5rem;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 1.75rem;
}

.auth-card header h1 {
  margin: 0;
  font-size: 2.25rem;
  letter-spacing: -0.04em;
  color: var(--text-strong);
}

.auth-card header p {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
}

.auth-form {
  display: grid;
  gap: 1.25rem;
}

label {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
  color: var(--text-strong);
}

input {
  border-radius: 0.85rem;
  border: 1px solid var(--border-subtle);
  padding: 0.85rem 1rem;
  font-size: 1rem;
  background: var(--surface-primary);
  color: var(--text-strong);
}

input:focus {
  outline: 3px solid rgba(196, 115, 47, 0.25);
  border-color: var(--accent-primary);
}

small {
  color: var(--danger-primary);
  font-weight: 500;
}

button {
  border-radius: 0.85rem;
  border: none;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: #fffbe3;
  font-weight: 600;
  padding: 0.9rem 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

button:hover:enabled {
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-error {
  color: var(--danger-primary);
  font-weight: 600;
  margin: 0;
}

.auth-card footer {
  color: var(--text-muted);
}

.auth-card footer a {
  color: var(--accent-primary);
}

.auth-aside {
  align-self: center;
  padding-right: 3rem;
  display: grid;
  gap: 1.5rem;
}

.auth-aside h2 {
  margin: 0;
  font-size: 2rem;
  letter-spacing: -0.03em;
  color: var(--text-strong);
}

.auth-aside ul {
  margin: 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .auth-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .auth-aside {
    order: -1;
    padding-right: 0;
  }
}
</style>
