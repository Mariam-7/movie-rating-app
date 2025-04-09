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
        <p><strong>Release Date:</strong> {{ movie.release_date || 'N/A' }}</p>
        <p>
          <strong>Rating:</strong> {{ movie.vote_average || 'N/A' }}/10
          <span class="stars">{{ starRating }}</span>
        </p>

        <!-- Display Genres -->
        <p v-if="movie.genres && movie.genres.length">
          <strong>Genres: </strong>
          <span v-for="(genre, index) in movie.genres" :key="genre.id">
            {{ genre.name }}<span v-if="index < movie.genres.length - 1">,</span>
          </span>
        </p>

        <!-- Display Duration -->
        <p><strong>Duration:</strong> {{ formattedDuration || 'N/A' }}</p>

        <p>{{ movie.overview || 'No overview available.' }}</p>
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

    <div class="action-buttons">
      <button @click="addToWatched">Watched</button>
      <button @click="addToWantToWatch">Want to Watch</button>
    </div>

    <div v-if="recommendedMovies.length" class="recommended-section">
      <h2>Similar Movies</h2>
      <div class="recommended-list">
        <div v-for="rec in recommendedMovies" :key="rec.id" class="recommended-item">
          <router-link :to="`/movie/${rec.id}`" class="rec-link">
            <img :src="getImageUrl(rec.poster_path)" alt="Recommended Movie" />
            <p>{{ rec.title }}</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// Import Firebase functions
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase' // Make sure you have the Firebase config properly set up

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

const route = useRoute()
const movie = ref(null)
const trailerUrl = ref(null)
const recommendedMovies = ref([])

onMounted(async () => {
  const id = route.params.id
  // Fetch movie details
  try {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`)
    const data = await res.json()
    movie.value = data

    // Fetch recommended movies
    const recRes = await fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`)
    const recData = await recRes.json()
    recommendedMovies.value = recData.results
  } catch (error) {
    console.error('Error fetching movie details or recommendations:', error)
  }
})

// Function to add movie to the "watched" list
const addToWatched = async () => {
  const user = getAuth().currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    let watchedList = docSnap.exists() ? docSnap.data().watched || [] : [];

    // Add only essential details to watched list
    const movieData = {
      id: movie.value.id,
      title: movie.value.title,
      poster_path: movie.value.poster_path,
      release_date: movie.value.release_date,
      overview: movie.value.overview,
    };

    // Avoid adding duplicates
    if (!watchedList.find(m => m.id === movie.value.id)) {
      watchedList.push(movieData);
      await updateDoc(userRef, {
        watched: watchedList,
      });
      console.log('Movie added to watched list!');
    } else {
      alert('Movie already in Watched list!');
    }
  }
}

  const addToWantToWatch = async () => {
  const user = getAuth().currentUser;
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        let wantToWatchList = docSnap.exists() ? docSnap.data().watchlist || [] : [];

        const movieData = {
        id: movie.value.id,
        title: movie.value.title,
        poster_path: movie.value.poster_path,
        release_date: movie.value.release_date,
        overview: movie.value.overview,
        };
        if (!wantToWatchList.find(m => m.id === movie.value.id)) {
        wantToWatchList.push(movieData);
        await updateDoc(userRef, {
            watchlist: wantToWatchList,
        });
        console.log('Movie added to Want to Watch list!');
        } else {
        alert('Movie already in Want to Watch list!');
        }
    }
    }


// Helper function to get image URL
const getImageUrl = (path) => {
  return path ? `${IMAGE_BASE_URL}${path}` : 'https://via.placeholder.com/150x225?text=No+Image'
}

const posterUrl = computed(() =>
  movie.value?.poster_path ? `${IMAGE_BASE_URL}${movie.value.poster_path}` : '',
)

// Function to show trailer video
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

// Computed property to format duration into hours and minutes
const formattedDuration = computed(() => {
  const duration = movie.value?.runtime
  if (duration) {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return `${hours}h ${minutes}m`
  }
  return 'N/A' // If runtime is not available
})

const starRating = computed(() => {
  const ratingOutOfFive = Math.round((movie.value?.vote_average || 0) / 2)
  return '★'.repeat(ratingOutOfFive) + '☆'.repeat(5 - ratingOutOfFive)
})
</script>


<style scoped>
.movie-details {
  padding: 20px;
}

.movie-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}

.movie-cover {
  flex: 1 1 200px;
  max-width: 250px;
}

.movie-poster {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.movie-info {
  flex: 2 1 400px;
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

.recommended-section {
  margin-top: 40px;
}

.recommended-section h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.recommended-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.recommended-item {
  flex: 0 0 auto;
  width: 150px;
  text-align: center;
}

.recommended-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.recommended-item p {
  margin-top: 8px;
  font-size: 0.9rem;
}

.rec-link {
  text-decoration: none;
  color: inherit;
}

.rec-link:hover {
  opacity: 0.9;
}

.stars {
  font-size: 1.2rem;
  color: #f5c518;
  margin-left: 10px;
}
</style>
