<template>
  <div class="watchlist-view">
    <h1>Your Watch List</h1>
    <div v-if="wantToWatchMovies.length === 0" class="no-movies">
      <p>Start adding some movies!</p>
    </div>

    <div v-else class="movie-list">
      <div v-for="movie in wantToWatchMovies" :key="movie.id" class="movie-item">
        <router-link :to="`/movie/${movie.id}`" class="movie-link">
          <img :src="getImageUrl(movie.poster_path)" alt="Movie Poster" width="150" />
          <h3>{{ movie.title }}</h3>
        </router-link>
        <p>{{ movie.overview }}</p>
        <button @click="removeFromWantToWatch(movie.id)" class="remove-btn">Remove Movie</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const wantToWatchMovies = ref([])

onMounted(async () => {
  const user = getAuth().currentUser
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(userRef)
      if (docSnap.exists()) {
        wantToWatchMovies.value = docSnap.data().watchlist || []
      } else {
        console.log('No want to watch movies found for this user')
      }
    } catch (error) {
      console.error('Error fetching want to watch movies:', error)
    }
  } else {
    console.log('User not logged in')
  }
})

const getImageUrl = (path) => {
  return path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : 'https://via.placeholder.com/150x225?text=No+Image'
}

const removeFromWantToWatch = async (movieId) => {
  const updatedList = wantToWatchMovies.value.filter((movie) => movie.id !== movieId)
  wantToWatchMovies.value = updatedList
  const user = getAuth().currentUser

  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        watchlist: updatedList,
      })
      console.log('Movie removed from Want to Watch list in Firestore!')
    } catch (error) {
      console.error('Error removing movie from want to watch list:', error)
    }
  }
  alert('Movie removed from Want to Watch list!')
}
</script>

<style scoped>
.watchlist-view {
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
  background-color: rgb(0, 110, 220);
}

.no-movies {
  text-align: center;
}
</style>