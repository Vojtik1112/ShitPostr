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
    fieldErrors.email = 'Vyplň přihlašovací údaj.'
  }
  if (!form.password.trim()) {
    fieldErrors.password = 'Heslo musí být vyplněné.'
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
    generalError.value = error.message || 'Přihlášení selhalo. Zkus to prosím znovu.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-screen">
    <RouterLink class="auth-brand" :to="{ name: 'welcome' }">
      <span class="auth-brand__badge">SP</span>
      <span class="auth-brand__text">ShitPostr</span>
    </RouterLink>

    <section class="auth-panel">
      <h1>Přihlásit se</h1>
      <p class="auth-panel__lead">
        Ještě nemáš účet?
        <RouterLink :to="{ name: 'register' }">Zaregistruj se</RouterLink>
      </p>
      <form class="auth-form" @submit.prevent="handleSubmit">
        <label>
          <span>Uživatelské jméno nebo e-mail</span>
          <input
            v-model="form.email"
            type="text"
            autocomplete="username"
            placeholder="tvuj.napad@shitpostr.beer"
          />
          <small v-if="fieldErrors.email">{{ fieldErrors.email }}</small>
        </label>
        <label>
          <span>Heslo</span>
          <input v-model="form.password" type="password" autocomplete="current-password" placeholder="••••••••" />
          <small v-if="fieldErrors.password">{{ fieldErrors.password }}</small>
        </label>
        <p v-if="generalError" class="form-error">{{ generalError }}</p>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Odemýkám kabinku...' : 'Přihlásit se' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.auth-screen {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4.5rem 1.5rem 3rem;
}

.auth-brand {
  position: fixed;
  top: 2.5rem;
  left: 3rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--sand-050);
}

.auth-brand__badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 240, 214, 0.1);
  border: 1px solid rgba(255, 240, 214, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.auth-brand__text {
  font-family: 'Pacifico', cursive;
  font-size: 2rem;
  letter-spacing: 0.04em;
}

.auth-panel {
  width: min(420px, 100%);
  display: grid;
  gap: 1.75rem;
  padding: 3rem 2.75rem 3.25rem;
  border-radius: 2.5rem;
  background: rgba(32, 15, 6, 0.55);
  border: 1px solid rgba(255, 240, 214, 0.1);
  box-shadow: 0 40px 120px -60px rgba(0, 0, 0, 0.65);
}

.auth-panel h1 {
  margin: 0;
  font-size: 2.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-panel__lead {
  margin: 0;
  color: var(--text-muted);
}

.auth-panel__lead a {
  color: var(--sand-050);
  font-weight: 600;
}

.auth-form {
  display: grid;
  gap: 1.4rem;
}

label {
  display: grid;
  gap: 0.5rem;
  color: var(--sand-100);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
}

input {
  border-radius: 999px;
  border: 1px solid rgba(255, 240, 214, 0.16);
  padding: 0.95rem 1.3rem;
  font-size: 1rem;
  background: rgba(132, 118, 109, 0.55);
  color: var(--sand-050);
  transition: border 0.2s ease, background 0.2s ease;
}

input::placeholder {
  color: rgba(249, 228, 193, 0.6);
}

input:focus {
  outline: none;
  border-color: rgba(255, 240, 214, 0.46);
  background: rgba(149, 132, 121, 0.6);
}

small {
  color: var(--danger-primary);
  font-weight: 600;
}

button {
  border-radius: 999px;
  border: none;
  background: linear-gradient(125deg, rgba(151, 143, 136, 0.85), rgba(123, 113, 106, 0.85));
  color: var(--sand-050);
  font-weight: 700;
  padding: 0.95rem 1.6rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover:enabled {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -18px rgba(0, 0, 0, 0.6);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-error {
  color: var(--danger-primary);
  font-weight: 600;
  margin: 0;
}

@media (max-width: 720px) {
  .auth-brand {
    position: static;
    margin-bottom: 3rem;
  }

  .auth-screen {
    flex-direction: column;
    gap: 2rem;
    padding: 3.5rem 1rem 2rem;
  }

  .auth-panel {
    padding: 2.5rem 2rem;
  }
}
</style>
