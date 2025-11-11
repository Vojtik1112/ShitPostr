<script setup>
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const form = reactive({
  displayName: authStore.currentUser?.displayName ?? '',
  statusMessage: authStore.currentUser?.statusMessage ?? '',
})

const saving = ref(false)
const feedback = ref('')
const errorMessage = ref('')

watch(
  () => authStore.currentUser,
  (user) => {
    form.displayName = user?.displayName ?? ''
    form.statusMessage = user?.statusMessage ?? ''
  },
  { immediate: true },
)

const handleSubmit = async () => {
  if (!form.displayName.trim()) {
    errorMessage.value = 'Bez přezdívky tě na chodbě prostě nepoznáme.'
    return
  }
  saving.value = true
  feedback.value = ''
  errorMessage.value = ''
  try {
    await authStore.updateProfile({
      displayName: form.displayName,
      statusMessage: form.statusMessage,
    })
    feedback.value = 'Profil se povedlo uložit.'
  } catch (error) {
    errorMessage.value = error.message || 'Něco uklouzlo. Zkus to prosím znovu.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="profile">
    <header>
      <h1>Tvůj porcelánový profil</h1>
      <p>Pojmenuj trůn, dolad status a dej kabince vědět, kdo tady vládne.</p>
    </header>
    <form @submit.prevent="handleSubmit">
      <label>
        <span>Přezdívka</span>
        <input v-model="form.displayName" type="text" autocomplete="nickname" />
      </label>
      <label>
        <span>Status</span>
        <textarea v-model="form.statusMessage" rows="3" placeholder="Zanech zprávu u zrcadla" />
      </label>
      <div class="feedback">
        <p v-if="feedback" class="success">{{ feedback }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
      <button type="submit" :disabled="saving">{{ saving ? 'Razím těsnění...' : 'Uložit profil' }}</button>
    </form>
  </section>
</template>

<style scoped>
.profile {
  max-width: 720px;
  margin: 0 auto;
  padding: 3.5rem 2rem;
  display: grid;
  gap: 2rem;
}

header h1 {
  margin: 0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--sand-050);
  font-size: 2.4rem;
}

header p {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
}

form {
  display: grid;
  gap: 1.5rem;
  background: rgba(42, 20, 8, 0.6);
  border-radius: 2rem;
  padding: 2.5rem;
  border: 1px solid rgba(255, 240, 214, 0.12);
  box-shadow: 0 34px 120px -60px rgba(0, 0, 0, 0.6);
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

input,
textarea {
  border-radius: 1rem;
  border: 1px solid rgba(255, 240, 214, 0.16);
  padding: 0.95rem 1.2rem;
  font-size: 1rem;
  background: rgba(132, 118, 109, 0.5);
  color: var(--sand-050);
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: rgba(255, 240, 214, 0.42);
  background: rgba(149, 132, 121, 0.6);
}

.feedback {
  min-height: 1.5rem;
}

.success {
  margin: 0;
  color: var(--success-primary);
  font-weight: 600;
}

.error {
  margin: 0;
  color: var(--danger-primary);
  font-weight: 600;
}

button {
  justify-self: flex-start;
  padding: 0.95rem 1.9rem;
  border-radius: 999px;
  border: none;
  color: var(--sand-050);
  font-weight: 700;
  background: linear-gradient(125deg, rgba(151, 143, 136, 0.85), rgba(123, 113, 106, 0.85));
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  transition: transform 0.2s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:hover:enabled {
  transform: translateY(-2px);
}
</style>
