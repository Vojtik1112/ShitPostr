<template>
  <div class="page">
    <header class="logo">
      <!-- <img src="/shitpostr-logo.png" alt="Shitpostr logo" /> -->
      <h1>SHITPOSTR</h1>
    </header>

    <main class="container">
      <h2>{{ isLogin ? 'Přihlásit se' : 'Registrovat' }}</h2>

      <p class="switch-mode">
        {{ isLogin ? 'Nemáš účet?' : 'Už máš účet?' }}
        <button @click="toggleMode">
          {{ isLogin ? 'Zaregistruj se' : 'Přihlásit se' }}
        </button>
      </p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label v-if="isLogin" for="username">Uživatelské jméno</label>
          <label v-else for="username">Uživatelské jméno</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            :placeholder="isLogin ? 'Zadej uživatelské jméno' : 'Zadej uživatelské jméno'"
          />
          <p v-if="errors.username" class="error">{{ errors.username }}</p>
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Zadej email"
          />
          <p v-if="errors.email" class="error">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password">Heslo</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Zadej heslo"
          />
          <p v-if="errors.password" class="error">{{ errors.password }}</p>
        </div>

        <div class="checkboxes" v-if="!isLogin">
          <label>
            <input type="checkbox" v-model="form.agreeTos" />
            I have read and agree to Shitpostr.beer Terms of Service and Privacy Policy
          </label>
          <label>
            <input type="checkbox" v-model="form.agreeChaos" />
            Yes, I hereby enthusiastically, irresponsibly, and perhaps against my better judgment agree to receive chaotic notifications from Shitpostr...
          </label>
          <p v-if="errors.agree" class="error">{{ errors.agree }}</p>
        </div>

        <button class="submit" type="submit">
          {{ isLogin ? 'PŘIHLÁSIT' : 'ZAREGISTROVAT' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLogin = ref(false)
const form = reactive({
  username: '',
  email: '',
  password: '',
  agreeTos: false,
  agreeChaos: false,
})

const errors = reactive({})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  Object.keys(form).forEach((key) => (form[key] = ''))
  Object.keys(errors).forEach((key) => (errors[key] = ''))
}

const validate = () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  let valid = true

  if (!form.username) {
    errors.username = 'Uživatelské jméno je povinné.'
    valid = false
  }

  if (!isLogin.value && (!form.email || !/.+@.+\..+/.test(form.email))) {
    errors.email = 'Zadej platný email.'
    valid = false
  }

  if (!form.password || form.password.length < 6) {
    errors.password = 'Heslo musí mít alespoň 6 znaků.'
    valid = false
  }

  if (!isLogin.value && (!form.agreeTos || !form.agreeChaos)) {
    errors.agree = 'Musíš souhlasit s podmínkami.'
    valid = false
  }

  return valid
}

const handleSubmit = () => {
  if (!validate()) return
  if (isLogin.value) {
    // login
    const users = JSON.parse(localStorage.getItem('shitpostr_users_v1') || '[]');
    const found = users.find(u => u.username === form.username && u.password === form.password)
    if (found) {
      localStorage.setItem('shitpostr_current_user', JSON.stringify(found))
      router.push('/main')
    } else {
      errors.username = 'Nesprávné jméno nebo heslo.'
    }
  } else {
    // register
    const users = JSON.parse(localStorage.getItem('shitpostr_users_v1') || '[]');
    if (users.some(u => u.username === form.username)) {
      errors.username = 'Toto jméno už existuje.'
      return
    }
    const newUser = {
      id: Date.now(),
      username: form.username,
      email: form.email,
      password: form.password
    }
    users.push(newUser)
    localStorage.setItem('shitpostr_users_v1', JSON.stringify(users))
    localStorage.setItem('shitpostr_current_user', JSON.stringify(newUser))
    router.push('/main')
  }
}
</script>

<style scoped>
.page {
  background-color: #3a1f0d;
  min-height: 100vh;
  height: 100vh;
  color: #fbeedb;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo img {
  width: 60px;
}

.logo h1 {
  font-size: 2.5rem;
  color: #fbeedb;
  letter-spacing: 2px;
}

.container {
  background: transparent;
  text-align: center;
  margin: 0;
  width: 100%;
  max-width: 400px;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

h2 {
  font-family: 'Brush Script MT', cursive;
  font-size: 2rem;
  color: #000;
  margin-bottom: 0.5rem;
}

.switch-mode {
  color: #000;
  margin-bottom: 1.5rem;
}

.switch-mode button {
  background: none;
  border: none;
  color: #fbeedb;
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 1rem;
}

label {
  font-size: 0.9rem;
  color: #000;
  margin-bottom: 0.25rem;
}

input[type='text'],
input[type='email'],
input[type='password'] {
  padding: 0.75rem;
  border-radius: 20px;
  border: none;
  outline: none;
  background-color: #4a4033;
  color: #fff;
  font-size: 1rem;
}

input::placeholder {
  color: #b8b8b8;
}

.error {
  font-size: 0.8rem;
  color: #ff9b9b;
  margin-top: 0.25rem;
}

.checkboxes {
  text-align: left;
  margin-bottom: 1rem;
}

.checkboxes label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #fbeedb;
  margin-bottom: 0.5rem;
}

.checkboxes input {
  margin-top: 0.2rem;
}

.submit {
  background-color: #5b4b3b;
  color: #fff;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.submit:hover {
  background-color: #7a624a;
}
</style>
