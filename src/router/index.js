import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import HomeView from '../views/HomeView.vue'
import WatchlistView from '../views/WatchlistView.vue'
import WatchedView from '../views/WatchedView.vue'
import AboutView from '../views/AboutView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/signup', name: 'signup', component: SignUpView },
  { path: '/home', name: 'home', component: HomeView },
  { path: '/watchlist', name: 'watchlist', component: WatchlistView },
  { path: '/watched', name: 'watched', component: WatchedView },
  { path: '/about', name: 'about', component: AboutView }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
