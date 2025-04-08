<template>
  <div v-if="movie">
    <h1>{{ movie.title }}</h1>
    <img :src="posterUrl" alt="Movie Poster" class="movie-poster" />
    <button @click="showTrailer">Watch Trailer</button>

    <!-- Trailer Video -->
    <div v-if="trailerUrl" class="video-container">
      <iframe
        :src="trailerUrl"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
      <button class="close-btn" @click="closeTrailer">Close</button>
    </div>

    <p>{{ movie.overview }}</p>
    <p><strong>Release Date:</strong> {{ movie.release_date }}</p>
    <p><strong>Rating:</strong> {{ movie.vote_average }}/10</p>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

const route = useRoute()
const movie = ref(null)
const trailerUrl = ref(null)

onMounted(async () => {
  const id = route.params.id
  // Fetch movie details
  const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`)
  const data = await res.json()
  movie.value = data
})

const posterUrl = computed(() =>
  movie.value?.poster_path ? `${IMAGE_BASE_URL}${movie.value.poster_path}` : '',
)

const showTrailer = async () => {
  const id = route.params.id
  // Fetch trailer video data using the movie ID
  const trailerRes = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`)
  const trailerData = await trailerRes.json()

  // Check if the trailer is available and get the YouTube video key
  if (trailerData.results && trailerData.results.length > 0) {
    trailerUrl.value = `https://www.youtube.com/embed/${trailerData.results[0].key}`
  } else {
    trailerUrl.value = null
    alert('Trailer not available for this movie.')
  }
}

const closeTrailer = () => {
  trailerUrl.value = null
}
</script>

<style scoped>
.movie-poster {
  width: 100%;
  max-width: 200px; /* Maximum width */
  height: auto;
  object-fit: cover;
  margin-bottom: 20px;
}

.video-container {
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
  margin: auto;
}

iframe {
  width: 100%;
  height: 450px;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.close-btn {
  background-color: red;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}

.close-btn:hover {
  background-color: #c82333;
}
</style>
