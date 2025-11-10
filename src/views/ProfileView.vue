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
    errorMessage.value = 'Even a stall goblin needs a name tag.'
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
    feedback.value = 'Stall decal refreshed successfully.'
  } catch (error) {
    errorMessage.value = error.message || 'The janitor slipped. Try saving again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="profile">
    <header>
      <h1>Your stall persona</h1>
      <p>Polish the nameplate, tweak your scent description, and let the bathroom know who reigns supreme.</p>
    </header>
    <form @submit.prevent="handleSubmit">
      <label>
        <span>Display name</span>
        <input v-model="form.displayName" type="text" autocomplete="nickname" />
      </label>
      <label>
        <span>Status message</span>
        <textarea v-model="form.statusMessage" rows="3" placeholder="Leaving a steamy note" />
      </label>
      <div class="feedback">
        <p v-if="feedback" class="success">{{ feedback }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
      <button type="submit" :disabled="saving">{{ saving ? 'Stamping...' : 'Save stall details' }}</button>
    </form>
  </section>
</template>

<style scoped>
.profile {
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  gap: 2rem;
}

header h1 {
  margin: 0;
  letter-spacing: -0.03em;
  color: var(--text-strong);
  font-size: 2.25rem;
}

header p {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
}

form {
  display: grid;
  gap: 1.5rem;
  background: linear-gradient(180deg, rgba(220, 168, 101, 0.18), transparent), var(--surface-panel);
  border-radius: 1.25rem;
  padding: 2rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-soft);
}

label {
  display: grid;
  gap: 0.4rem;
  color: var(--text-strong);
  font-weight: 600;
}

input,
textarea {
  border-radius: 0.9rem;
  border: 1px solid var(--border-subtle);
  padding: 0.85rem 1rem;
  font-size: 1rem;
  background: var(--surface-primary);
  color: var(--text-strong);
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: 3px solid rgba(196, 115, 47, 0.25);
  border-color: var(--accent-primary);
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
  padding: 0.85rem 1.8rem;
  border-radius: 999px;
  border: none;
  color: #fffbe3;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  cursor: pointer;
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
