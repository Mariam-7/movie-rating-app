<template>
  <div v-if="movie" class="movie-details">
    <div class="movie-container">
      <!-- Movie Cover Image -->
      <div class="movie-cover">
        <img :src="posterUrl" alt="Movie Poster" class="movie-poster" />
      </div>

      <!-- Movie Details -->
      <div class="movie-info">
        <h1>{{ movie.title }}</h1>
        <p><strong>Release Date:</strong> {{ movie.release_date }}</p>
        <p><strong>Rating:</strong> {{ movie.vote_average }}/10</p>
        <p>{{ movie.overview }}</p>
        <button @click="showTrailer" class="trailer-btn">Watch Trailer</button>
      </div>
    </div>

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
.movie-details {
  padding: 20px;
}

.movie-container {
  display: flex;
  flex-wrap: wrap; /* Allows wrapping for smaller screens */
  gap: 20px;
  justify-content: flex-start;
}

.movie-cover {
  flex: 1 1 200px; /* Flex: grow, shrink, basis - makes image flexible */
  max-width: 250px; /* Limit image size */
}

.movie-poster {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.movie-info {
  flex: 2 1 400px; /* More space for movie details */
  padding: 10px;
}

.movie-info h1 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.movie-info p {
  margin-bottom: 10px;
}

.trailer-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.trailer-btn:hover {
  background-color: #0056b3;
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

/* Responsive Design for smaller screens */
@media (max-width: 768px) {
  .movie-container {
    flex-direction: column; /* Stack the image and info vertically */
  }

  .movie-cover {
    max-width: 100%; /* Make image take full width on small screens */
  }

  .movie-info {
    padding: 15px;
  }
}
</style>
