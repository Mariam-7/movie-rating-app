<template>
  <div class="auth-background">
    <div class="auth-box">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p class="error" v-if="error">{{ error }}</p>
        <p v-if="showReset" @click="handleReset" class="reset-link">
          Forgot password?
        </p>
        <p class="footer-text">
        Don't have an account?
        <router-link to="/signup" class="link-accent">Sign up</router-link>
      </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '@/firebase'

// Reactive variables
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('') // Added missing success ref
const loading = ref(false)
const showReset = ref(false)
const router = useRouter()

// Methods

const handleLogin = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value.trim()
    )
    
    if (!userCredential.user.emailVerified) {
      error.value = 'Please verify your email first'
      return
    }
    
    success.value = `Welcome back, ${userCredential.user.email}!`
    password.value = '' // Clear password after successful login
    
    // Small delay to show success message
    router.push('/home')
  } catch (err) {
    handleLoginError(err)
  } finally {
    loading.value = false
  }
}

// 3. Password reset handler
const handleReset = async () => {
  if (!email.value) {
    error.value = 'Please enter your email first'
    return
  }
  
  try {
    await sendPasswordResetEmail(auth, email.value.trim())
    error.value = 'Password reset email sent. Check your inbox.'
    showReset.value = false
  } catch (err) {
    error.value = getLoginError(err.code)
  }
}

// 4. Error handling helper
const handleLoginError = (err) => {
  console.error('Login error:', err.code)
  
  switch (err.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      error.value = 'Invalid email or password'
      showReset.value = true
      break
    default:
      error.value = getLoginError(err.code)
  }
}

// 5. Error message mapper
const getLoginError = (code) => {
  const errors = {
    'auth/invalid-email': 'Invalid email format',
    'auth/user-disabled': 'Account disabled',
    'auth/too-many-requests': 'Too many attempts. Try again later',
    default: 'Login failed. Please try again'
  }
  return errors[code] || errors.default
}
</script>

<style scoped>
.reset-link {
  color: #4285f4;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 1rem;
}
</style>