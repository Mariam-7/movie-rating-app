import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initAuth } from './firebase';

// Initialize auth listener
const unsubscribe = initAuth((user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

// Later, to unsubscribe:
// unsubscribe();
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
