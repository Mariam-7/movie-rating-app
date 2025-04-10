<template>
  <section class="section home">
    <div class="container">
      <div class="box">
        <div class="level">
          <div class="level-left">
            <h1 class="title">Welcome back, {{ username }}!</h1>
          </div>
          <div class="level-right">
            <button @click="handleLogout" class="button is-danger">Logout</button>
          </div>
        </div>

        <div class="field">
          <div class="control">
            <input
              class="input"
              v-model="query"
              @input="searchMovies"
              placeholder="Search for movies..."
            />
          </div>
        </div>
      </div>

      <div class="columns is-multiline is-mobile">
        <div
          v-for="movie in movies"
          :key="movie.id"
          class="column is-one-fifth"
        >
          <div class="card">
            <router-link :to="`/movie/${movie.id}`">
              <div class="card-image">
                <figure class="image is-3by4">
                  <img :src="getImageUrl(movie.poster_path)" alt="Movie" />
                </figure>
              </div>
              <div class="card-content">
                <p class="title is-6">{{ movie.title }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <p v-if="!movies.length" class="has-text-centered mt-6">
        Start by searching for movies!
      </p>
    </div>
  </section>
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
      username: 'Guest', // Default value
    }
  },

  async mounted() {
    const user = auth.currentUser

    if (user) {
      // Fetch username / guest if no name/email
      this.username = user.displayName || user.email || 'Guest' 
    } else {
      this.username = 'Guest'
    }
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
</style>
