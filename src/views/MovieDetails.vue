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

    <!-- Review Form -->
    <div v-if="showReviewForm" class="review-form">
      <h3>Leave a Review</h3>

      <!-- Star Rating System -->
      <div class="star-rating">
        <span
          v-for="i in 10"
          :key="i"
          :class="{ filled: i <= review.rating }"
          @click="setRating(i)"
          class="star"
          >&#9733;</span
        >
      </div>

      <textarea v-model="review.note" placeholder="Write your review here..."></textarea>

      <!-- Error Message -->
      <p v-if="ratingError" style="color: red">Please select a rating between 1 and 10.</p>

      <button @click="saveReview" class="review-btn">Submit Review</button>
    </div>

    <div class="action-buttons">
      <button @click="handleWatchedClick" class="watched-btn">Watched</button>
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
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const route = useRoute()
const movie = ref(null)
const trailerUrl = ref(null)
const recommendedMovies = ref([])

// Control the visibility of the review form
const showReviewForm = ref(false)
const review = ref({
  rating: 0,
  note: '',
})
const ratingError = ref(false)

onMounted(async () => {
  const id = route.params.id
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`,
    )
    const data = await res.json()
    movie.value = data

    const recRes = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY}`,
    )
    const recData = await recRes.json()
    recommendedMovies.value = recData.results
  } catch (error) {
    console.error('Error fetching movie details or recommendations:', error)
  }
})

// Handle adding to the watched list
const handleWatchedClick = () => {
  showReviewForm.value = true // Show the review form when "Watched" is clicked
}

const saveReview = async () => {
  if (review.rating < 1 || review.rating > 10) {
    ratingError.value = true
    return
  }

  const user = getAuth().currentUser
  if (user) {
    const userRef = doc(db, 'users', user.uid)
    const docSnap = await getDoc(userRef)
    let watchedList = docSnap.exists() ? docSnap.data().watched || [] : []

    const movieData = {
      id: movie.value.id,
      title: movie.value.title,
      poster_path: movie.value.poster_path,
      release_date: movie.value.release_date,
      review: {
        rating: review.value.rating,
        note: review.value.note,
      },
    }

    if (!watchedList.find((m) => m.id === movie.value.id)) {
      watchedList.push(movieData)
      await updateDoc(userRef, {
        watched: watchedList,
      })
      showReviewForm.value = false // Close the review form
      console.log('Movie and review added to watched list!')
    } else {
      alert('Movie already in Watched list!')
    }
  }
}

// Set rating when a star is clicked
const setRating = (rating) => {
  review.value.rating = rating
  ratingError.value = false // Reset error message
}

// Fetch movie poster image
const getImageUrl = (path) => {
  return path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : 'https://via.placeholder.com/150x225?text=No+Image'
}

const posterUrl = computed(() =>
  movie.value?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.value.poster_path}` : '',
)

const showTrailer = async () => {
  if (!movie.value?.id) return

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.value.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`,
    )
    const data = await res.json()

    const trailers = data.results.filter((vid) => vid.type === 'Trailer' && vid.site === 'YouTube')

    // First look for official trailer with matching name
    let trailer = trailers.find((vid) => vid.official && /official trailer/i.test(vid.name))

    // If not found, fallback to any official trailer
    if (!trailer) {
      trailer = trailers.find((vid) => vid.official)
    }

    // Final fallback to any trailer
    if (!trailer && trailers.length) {
      trailer = trailers[0]
    }

    if (trailer) {
      trailerUrl.value = `https://www.youtube.com/embed/${trailer.key}`
    } else {
      alert('No trailer available for this movie.')
    }
  } catch (error) {
    console.error('Error fetching trailer:', error)
  }
}

const closeTrailer = () => {
  trailerUrl.value = null
}
const addToWantToWatch = async () => {
  const user = getAuth().currentUser
  if (user) {
    const userRef = doc(db, 'users', user.uid)
    const docSnap = await getDoc(userRef)
    let wantToWatchList = docSnap.exists() ? docSnap.data().watchlist || [] : []

    const movieData = {
      id: movie.value.id,
      title: movie.value.title,
      poster_path: movie.value.poster_path,
      release_date: movie.value.release_date,
      overview: movie.value.overview,
    }
    if (!wantToWatchList.find((m) => m.id === movie.value.id)) {
      wantToWatchList.push(movieData)
      await updateDoc(userRef, {
        watchlist: wantToWatchList,
      })
      console.log('Movie added to Want to Watch list!')
    } else {
      alert('Movie already in Want to Watch list!')
    }
  }
}

const formattedDuration = computed(() => {
  const duration = movie.value?.runtime
  if (duration) {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return `${hours}h ${minutes}m`
  }
  return 'N/A'
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

/* Review form styles */
.review-form {
  margin-top: 20px;
}

.review-form input,
.review-form select,
.review-form textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

.review-form button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.review-form button:hover {
  background-color: #0056b3;
}

/* Star Rating Styles */
.star-rating {
  font-size: 2rem;
  cursor: pointer;
}

.star {
  color: gray;
  margin-right: 5px;
}

.star.filled {
  color: gold;
}
</style>
