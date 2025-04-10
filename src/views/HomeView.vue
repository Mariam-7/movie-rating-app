<template>
  <div class="home">
    <div class="page-content">
      <div class="search-bar">
        <h1>Welcome back, {{ userEmail }}!</h1>
        <button @click="handleLogout" class="logout-btn">Logout</button>
        <input v-model="query" @input="searchMovies" placeholder="Search for movies..." />
      </div>
      <div class="dashboard">
        <div v-if="movies.length" class="movie-carousel">
          <div v-for="movie in movies" :key="movie.id" class="movie-card">
            <router-link :to="`/movie/${movie.id}`">
              <img :src="getImageUrl(movie.poster_path)" alt="Movie" width="150" />
              <h3>{{ movie.title }}</h3>
            </router-link>
          </div>
        </div>
        <p v-else>Start by searching for movies!</p>
      </div>
    </div>
  </div>
</template>

<script>
import { searchMovies, getImageUrl, getPopularMovies } from '../MovieService'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'

export default {
  data() {
    return {
      query: '',
      movies: [],
      userEmail: 'Guest', // Default value
    }
  },

  async mounted() {
    const user = auth.currentUser

    if (user && user.email) {
      this.userEmail = user.email
    } else {
      this.userEmail = 'Guest'
    }

    // Load popular movies using MovieService
    this.movies = await getPopularMovies()
  },

  methods: {
    async searchMovies() {
      if (this.query.length > 2) {
        this.movies = await searchMovies(this.query)
      } else if (this.query.length === 0) {
        this.movies = await getPopularMovies()
      }
    },

    async handleLogout() {
      try {
        await signOut(auth)
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    },

    getImageUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/100x150'
    }
  }
}
</script>

<style scoped>
.movie-carousel {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.movie-card {
  width: 150px;
  text-align: center;
}

.movie-card a {
  text-decoration: none;
  color: inherit;
}

.movie-card h3 {
  margin-top: 10px;
  font-size: 16px;
}

img {
  width: 100%;
  height: auto;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logout-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #0056b3;
}
</style>
