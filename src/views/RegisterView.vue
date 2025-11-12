<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import logo from '../assets/Shitpostrlogo.png'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  termsAccepted: false,
  chaosAccepted: false,
})

const fieldErrors = reactive({
  displayName: '',
  email: '',
  password: '',
  termsAccepted: '',
  chaosAccepted: '',
})

const submitting = ref(false)
const generalError = ref('')

const validate = () => {
  fieldErrors.displayName = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
  fieldErrors.termsAccepted = ''
  fieldErrors.chaosAccepted = ''
  generalError.value = ''

  if (!form.displayName.trim()) {
    fieldErrors.displayName = 'Vyber si přezdívku, ať tě ostatní poznají.'
  }
  if (!form.email.trim()) {
    fieldErrors.email = 'E-mail je povinný.'
  }
  if (form.password.length < 8) {
    fieldErrors.password = 'Heslo musí mít alespoň 8 znaků.'
  }
  if (form.password.length > 128) {
    fieldErrors.password = 'Heslo může mít maximálně 128 znaků.'
  }
  if (!form.termsAccepted) {
    fieldErrors.termsAccepted = 'Bez souhlasu s podmínkami kabinku neodemkneme.'
  }
  if (!form.chaosAccepted) {
    fieldErrors.chaosAccepted = 'Potvrď, že zvládneš naše notifikace bez fyzické újmy.'
  }

  return (
    !fieldErrors.displayName &&
    !fieldErrors.email &&
    !fieldErrors.password &&
    !fieldErrors.termsAccepted &&
    !fieldErrors.chaosAccepted
  )
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
    generalError.value = error.message || 'Registrace selhala. Zkus to prosím znovu.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-screen">
    <RouterLink class="auth-brand" :to="{ name: 'welcome' }">
      <img :src="logo" alt="ShitPostr" class="auth-brand__logo" />
      <span class="auth-brand__text">ShitPostr</span>
    </RouterLink>

    <section class="auth-panel">
      <h1>Registrovat</h1>
      <p class="auth-panel__lead">
        Už máš účet?
        <RouterLink :to="{ name: 'login' }">Přihlásit se</RouterLink>
      </p>
      <form class="auth-form" @submit.prevent="handleSubmit">
        <label>
          <span>Uživatelské jméno</span>
          <input v-model="form.displayName" type="text" autocomplete="nickname" placeholder="Král Kohoutku" maxlength="30" />
          <small v-if="form.displayName.length > 0" class="char-count">{{ form.displayName.length }}/30</small>
          <small v-if="fieldErrors.displayName">{{ fieldErrors.displayName }}</small>
        </label>
        <label>
          <span>E-mail</span>
          <input v-model="form.email" type="email" autocomplete="email" placeholder="tvuj.napad@shitpostr.beer" />
          <small v-if="fieldErrors.email">{{ fieldErrors.email }}</small>
        </label>
        <label>
          <span>Heslo</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            placeholder="minimálně 8 znaků"
          />
          <small v-if="fieldErrors.password">{{ fieldErrors.password }}</small>
        </label>

        <div class="auth-consent">
          <label class="checkbox">
            <input v-model="form.termsAccepted" type="checkbox" />
            <span class="checkbox__fake"></span>
            <span class="checkbox__label">
              Souhlasím s&nbsp;podmínkami a&nbsp;zásadami soukromí ShitPostr.beer a potvrzuji, že chápu, do čeho jdu.
            </span>
          </label>
          <label class="checkbox">
            <input v-model="form.chaosAccepted" type="checkbox" />
            <span class="checkbox__fake"></span>
            <span class="checkbox__label">
              Ano, chci na vlastní nebezpečí memy, nabídky, pochybné push notifikace a občasné připomenutí, ať jdu ven.
            </span>
          </label>
          <small v-if="fieldErrors.termsAccepted">{{ fieldErrors.termsAccepted }}</small>
          <small v-if="fieldErrors.chaosAccepted">{{ fieldErrors.chaosAccepted }}</small>
        </div>

        <p v-if="generalError" class="form-error">{{ generalError }}</p>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Skladuji toaleťák...' : 'Zaregistrovat' }}
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
  gap: 0.5rem;
  color: var(--sand-050);
}

.auth-brand__logo {
  width: 128px;
  height: 128px;
  object-fit: contain;
  display: block;
}

.auth-brand__text {
  font-family: 'Pacifico', cursive;
  font-size: 2rem;
  letter-spacing: 0.04em;
}

.auth-panel {
  width: min(460px, 100%);
  display: grid;
  gap: 1.75rem;
  padding: 3.25rem 3rem 3.5rem;
  border-radius: 2.75rem;
  background: rgba(32, 15, 6, 0.55);
  border: 1px solid rgba(255, 240, 214, 0.1);
  box-shadow: 0 40px 120px -60px rgba(0, 0, 0, 0.65);
}

.auth-panel h1 {
  margin: 0;
  font-size: 2.9rem;
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
  gap: 1.45rem;
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

input[type='text'],
input[type='email'],
input[type='password'] {
  border-radius: 999px;
  border: 1px solid rgba(255, 240, 214, 0.16);
  padding: 0.95rem 1.3rem;
  font-size: 1rem;
  background: rgba(132, 118, 109, 0.55);
  color: var(--sand-050);
  transition: border 0.2s ease, background 0.2s ease;
}

input[type='text']::placeholder,
input[type='email']::placeholder,
input[type='password']::placeholder {
  color: rgba(249, 228, 193, 0.6);
}

input[type='text']:focus,
input[type='email']:focus,
input[type='password']:focus {
  outline: none;
  border-color: rgba(255, 240, 214, 0.46);
  background: rgba(149, 132, 121, 0.6);
}

.auth-consent {
  display: grid;
  gap: 1rem;
  margin-top: 0.5rem;
}

.checkbox {
  position: relative;
  padding-left: 2.2rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.45;
  cursor: pointer;
}

.checkbox input {
  position: absolute;
  opacity: 0;
  left: 0;
  top: 0.25rem;
  width: 1.4rem;
  height: 1.4rem;
  margin: 0;
}

.checkbox__fake {
  position: absolute;
  left: 0;
  top: 0.25rem;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 240, 214, 0.3);
  background: rgba(45, 22, 11, 0.3);
  transition: border 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  pointer-events: none;
}

.checkbox input:checked + .checkbox__fake {
  border-color: var(--sand-050);
  background: var(--sand-050);
}

.checkbox input:checked + .checkbox__fake::after {
  content: '';
  position: absolute;
  inset: 0.28rem;
  background: linear-gradient(140deg, #3b1c0d, #5b3018);
  clip-path: polygon(14% 52%, 0 66%, 43% 100%, 100% 16%, 86% 0, 40% 66%);
}

.checkbox input:focus-visible + .checkbox__fake {
  box-shadow: 0 0 0 3px rgba(255, 240, 214, 0.3);
}

.checkbox__label {
  display: block;
}

.auth-consent small {
  color: var(--danger-primary);
  font-weight: 600;
}

small {
  color: var(--danger-primary);
  font-weight: 600;
}

.char-count {
  color: var(--text-subtle);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  margin-top: 0.25rem;
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

  .checkbox__label {
    margin-left: 1.5rem;
  }
}
</style>
