<template>
  <div class="app-wrapper">
    <TopNav @toggle-sidebar="toggleSidebar" />

    <!-- Sidebar only on specific pages -->
    <aside v-if="showSidebar" :class="['sidebar', { open: sidebarOpen }]">
      <ul>
        <li><RouterLink to="/watched">Watched</RouterLink></li>
        <li><RouterLink to="/watchlist">Watchlist</RouterLink></li>
        <li><RouterLink to="/about">About Us</RouterLink></li>
      </ul>
    </aside>

    <!-- Main content that shifts when the sidebar is open -->
    <main :class="['main-content', { shifted: sidebarOpen && showSidebar }]">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import TopNav from './components/TopNav.vue'
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const route = useRoute()

const showSidebar = computed(() =>
  ['/home', '/watched', '/watchlist', '/about'].includes(route.path)
)
</script>
