<template>x
  <div class="auth-background">
    <div class="auth-box">
      <h1>Create an Account</h1>
      <form @submit.prevent="handleSignup">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="username" type="username" placeholder="Username" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  createUserWithEmailAndPassword,
  sendEmailVerification 
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

const email = ref('')
const username = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const router = useRouter()

const handleSignup = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    // Input validation for creating acct
    if (!email.value || !password.value || !username.value) {
      throw new Error('Email and password are required')
    }
    if (password.value.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      username.value.trim(),
      password.value.trim()
    )
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email.value.trim(),
      username: username.value.trim(),
      watchlist: [],
      rated_movies: [],
      created_at: new Date()
    })

    await sendEmailVerification(userCredential.user)
    
    success.value = 'Account created! Please verify your email.'
    router.push('/home')

  } catch (err) {
    console.error('Signup error:', err)
    error.value = err.message || 'Signup failed. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('SignUp component mounted')
})
</script>