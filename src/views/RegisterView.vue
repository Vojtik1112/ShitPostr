<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const fieldErrors = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const submitting = ref(false)
const generalError = ref('')

const validate = () => {
  fieldErrors.displayName = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
  fieldErrors.confirmPassword = ''
  generalError.value = ''

  if (!form.displayName.trim()) {
    fieldErrors.displayName = 'Pick a display name so friends recognise you.'
  }
  if (!form.email.trim()) {
    fieldErrors.email = 'Email is required.'
  }
  if (form.password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.'
  }
  if (form.password !== form.confirmPassword) {
    fieldErrors.confirmPassword = 'Passwords do not match.'
  }

  return !fieldErrors.displayName && !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword
}

const handleSubmit = async () => {
  if (!validate()) {
    return
  }

  submitting.value = true
  try {
    await authStore.register({
      displayName: form.displayName,
      email: form.email,
      password: form.password,
    })
    router.push({ name: 'chat' })
  } catch (error) {
    generalError.value = error.message || 'Registration failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-layout">
    <section class="auth-card">
      <header>
        <h1>Create your space</h1>
        <p>Claim your handle and start a room for spicy takes.</p>
      </header>
      <form class="auth-form" @submit.prevent="handleSubmit">
        <label>
          <span>Display name</span>
          <input v-model="form.displayName" type="text" autocomplete="nickname" placeholder="Kara from Product" />
          <small v-if="fieldErrors.displayName">{{ fieldErrors.displayName }}</small>
        </label>
        <label>
          <span>Email</span>
          <input v-model="form.email" type="email" autocomplete="email" placeholder="you@example.com" />
          <small v-if="fieldErrors.email">{{ fieldErrors.email }}</small>
        </label>
        <label>
          <span>Password</span>
          <input v-model="form.password" type="password" autocomplete="new-password" placeholder="At least 8 characters" />
          <small v-if="fieldErrors.password">{{ fieldErrors.password }}</small>
        </label>
        <label>
          <span>Confirm password</span>
          <input v-model="form.confirmPassword" type="password" autocomplete="new-password" placeholder="Repeat your password" />
          <small v-if="fieldErrors.confirmPassword">{{ fieldErrors.confirmPassword }}</small>
        </label>
        <p v-if="generalError" class="form-error">{{ generalError }}</p>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Creating account...' : 'Create account' }}
        </button>
      </form>
      <footer>
        <p>
          Already in the crew?
          <RouterLink :to="{ name: 'login' }">Sign in</RouterLink>
        </p>
      </footer>
    </section>
    <aside class="auth-aside">
      <h2>Set the tone</h2>
      <ul>
        <li>Pick an avatar colour automatically tuned to your name.</li>
        <li>Rooms persist locally so you can experiment without risk.</li>
        <li>Helper bot breaks the ice while you draft the perfect post.</li>
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
  background: var(--surface-panel);
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  padding: 2.5rem;
  box-shadow: 0 28px 70px -40px rgba(16, 11, 27, 0.55);
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
  outline: 3px solid rgba(138, 99, 255, 0.2);
  border-color: var(--accent-primary);
}

small {
  color: var(--danger-primary);
  font-weight: 500;
}

button {
  border-radius: 0.85rem;
  border: none;
  background: linear-gradient(135deg, #8a63ff, #ff619d);
  color: white;
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
