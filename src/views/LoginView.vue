<template>
  <div class="auth-background">
    <div class="auth-box">
      <h1>MovieMeter</h1>
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Log In</button>
        <p class="error" v-if="error">{{ error }}</p>
      </form>
      <p class="footer-text">
        Don’t have an account yet?
        <router-link to="/signup" class="link-accent">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const validUser = users.find(u => u.email === email.value && u.password === password.value)

  if (validUser) {
    localStorage.setItem('loggedIn', 'true')
    router.push('/home')
  } else {
    error.value = 'Invalid email or password.'
  }
}
</script>
