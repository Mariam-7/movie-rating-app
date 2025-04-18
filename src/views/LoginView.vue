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
        <p class="reset-link" @click="handleReset">
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

const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const resetTime = ref(null) 
const router = useRouter()

const RESET_TIMEOUT = 10000; //can't send back to back

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
    password.value = '' 
    router.push('/home')
  } catch (err) {
    handleLoginError(err)
  } finally {
    loading.value = false
  }
}

// Password reset 
const handleReset = async () => {
  const currentTime = new Date().getTime();
  
  if (resetTime.value && currentTime - resetTime.value < RESET_TIMEOUT) {
    const timeLeft = (RESET_TIMEOUT - (currentTime - resetTime.value)) / 1000;
    error.value = `You can request another link in ${Math.ceil(timeLeft)} seconds.`;
    return;
  }
  
  if (!email.value) {
    error.value = 'Please enter your email first';
    return;
  }
  
  try {
    await sendPasswordResetEmail(auth, email.value.trim())
    error.value = 'Password reset email sent. Check your inbox.'
    resetTime.value = currentTime;
  } catch (err) {
    error.value = getLoginError(err.code)
  }
}
// check for error type
const handleLoginError = (err) => {
  console.error('Login error:', err.code)
  
  switch (err.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      error.value = 'Invalid email or password'
      break
    default:
      error.value = getLoginError(err.code)
  }
}
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
