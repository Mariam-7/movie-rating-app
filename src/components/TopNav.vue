<template>
  <nav class="top-nav">
    <button v-if="showSidebarToggle" class="sidebar-toggle" @click="$emit('toggle-sidebar')">
      ☰
    </button>

    <!-- Make "MOVIEMETER" clickable and navigate to home, except on login/signup pages -->
    <RouterLink v-if="!isLoginOrSignup" to="/home" class="app-title"> MOVIEMETER </RouterLink>
    <h1 v-else class="app-title">MOVIEMETER</h1>

    <div class="theme-toggle-container">
      <label class="switch">
        <input type="checkbox" :checked="theme === 'light'" @change="toggleTheme" />
        <span class="slider">
          <span class="icon">{{ theme === 'light' ? '🌞' : '🌙' }}</span>
        </span>
      </label>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const theme = ref(localStorage.getItem('theme') || 'dark')
const showSidebarToggle = ref(true)

// Toggle between dark and light theme
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
})

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})

// Check if the current route is login or signup
const isLoginOrSignup = computed(() => {
  return route.path === '/login' || route.path === '/signup'
})

watch(
  () => route.path,
  (newPath) => {
    showSidebarToggle.value = !(newPath === '/login' || newPath === '/signup')
  },
  { immediate: true },
)
</script>

<style scoped>
.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-shadow: 2px 2px 8px rgba(0, 123, 255, 0.6); /* blue glow effect */
  transition:
    color 0.3s ease,
    transform 0.3s ease;
}

.app-title:hover {
  color: #00aaff; /* lighter blue on hover */
  transform: scale(1.05);
}
</style>
