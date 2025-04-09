<template>
  <div class="watched-view">
    <h1>Your Watched Movies</h1>
    <p>Here you’ll see all the movies you’ve watched. 🎬</p>
    
    <div v-if="watchedMovies.length === 0" class="no-movies">
      <p>Start adding some movies!</p>
    </div>

    <div v-else class="movie-list">
      <div v-for="movie in watchedMovies" :key="movie.id" class="movie-item">
        <img :src="getImageUrl(movie.poster_path)" alt="Movie Poster" />
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <p>{{ movie.overview }}</p>
          <button @click="removeFromWatched(movie.id)" class="remove-btn">Remove Movie</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getImageUrl } from '@/MovieService'  

const watchedMovies = ref([])

onMounted(() => {
  const storedWatched = JSON.parse(localStorage.getItem('watched')) || []
  watchedMovies.value = storedWatched
})

const removeFromWatched = (movieId) => {
  const updatedWatched = watchedMovies.value.filter(movie => movie.id !== movieId)
  localStorage.setItem('watched', JSON.stringify(updatedWatched))
  watchedMovies.value = updatedWatched 
  alert('Movie removed from Watched list!')
}
</script>

<style scoped>
.watched-view {
  padding: 20px;
}

.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.movie-item {
  flex: 1 1 200px;
  max-width: 250px;
}

.movie-item img {
  width: 100%;
  height: auto;
}

.movie-info {
  text-align: center;
}

.remove-btn {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: rgb(0, 145, 255);
  color: white;
  border: none;
  cursor: pointer;
}

.remove-btn:hover {
  background-color: rgb(0, 145, 255);
}

.no-movies {
  text-align: center;
}
</style>
