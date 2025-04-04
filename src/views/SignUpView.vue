<template>
  <div class="auth-background">
    <div class="auth-box">
      <h1>Create an Account</h1>
      <form @submit.prevent="handleSignup">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
        <p class="error" v-if="error">{{ error }}</p>
        <p class="success" v-if="success">{{ success }}</p>
      </form>
      <p class="footer-text">
        Already have an account?
        <router-link to="/login" class="link-accent">Log in</router-link>
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
const success = ref('')
const router = useRouter()

const handleSignup = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const exists = users.find(u => u.email === email.value)

  if (exists) {
    error.value = 'Email is already registered.'
    success.value = ''
  } else {
    users.push({ email: email.value, password: password.value })
    localStorage.setItem('users', JSON.stringify(users))
    success.value = 'Account created! Redirecting to login...'
    error.value = ''
    setTimeout(() => router.push('/login'), 2000)
  }
}
</script>
