<script setup>
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const form = reactive({
  displayName: authStore.currentUser?.displayName ?? '',
  statusMessage: authStore.currentUser?.statusMessage ?? '',
  avatarUrl: authStore.currentUser?.avatarUrl ?? null,
})

const saving = ref(false)
const feedback = ref('')
const errorMessage = ref('')
const avatarPreview = ref(authStore.currentUser?.avatarUrl ?? null)
const fileInput = ref(null)

watch(
  () => authStore.currentUser,
  (user) => {
    form.displayName = user?.displayName ?? ''
    form.statusMessage = user?.statusMessage ?? ''
    form.avatarUrl = user?.avatarUrl ?? null
    avatarPreview.value = user?.avatarUrl ?? null
  },
  { immediate: true },
)

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Vyber prosím obrázek.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Obrázek je příliš velký. Maximálně 5MB.'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
    form.avatarUrl = e.target.result
    errorMessage.value = ''
  }
  reader.onerror = () => {
    errorMessage.value = 'Nepodařilo se načíst obrázek.'
  }
  reader.readAsDataURL(file)
}

const removeAvatar = () => {
  form.avatarUrl = null
  avatarPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

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
      avatarUrl: form.avatarUrl,
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
      <div class="form-field">
        <span class="field-label">Profilovka</span>
        <div class="avatar-upload">
          <div class="avatar-preview">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Profilovka" />
            <div v-else class="avatar-placeholder">Žádná profilovka</div>
          </div>
          <div class="avatar-controls">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              style="display: none"
              id="avatar-input"
            />
            <label for="avatar-input" class="btn-upload">Vybrat obrázek</label>
            <button v-if="avatarPreview" type="button" class="btn-remove" @click="removeAvatar">
              Odstranit
            </button>
          </div>
        </div>
      </div>
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

label,
.form-field {
  display: grid;
  gap: 0.5rem;
  color: var(--sand-100);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.field-label {
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

.avatar-upload {
  display: grid;
  gap: 1rem;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 240, 214, 0.24);
  background: rgba(132, 118, 109, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: var(--text-subtle);
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
}

.avatar-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-upload,
.btn-remove {
  padding: 0.65rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 240, 214, 0.24);
  background: rgba(255, 240, 214, 0.08);
  color: var(--sand-050);
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn-upload:hover {
  background: rgba(255, 240, 214, 0.18);
  border-color: rgba(255, 240, 214, 0.4);
}

.btn-remove {
  background: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.4);
  color: #ff6b7a;
}

.btn-remove:hover {
  background: rgba(220, 53, 69, 0.3);
  border-color: rgba(220, 53, 69, 0.6);
}
</style>
