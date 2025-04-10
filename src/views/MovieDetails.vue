<template>
  <div v-if="movie" class="section">
    <div class="container">
      <div class="columns is-variable is-6">
        <div class="column is-one-third">
          <figure class="image is-3by4">
            <img :src="posterUrl" alt="Movie Poster" />
          </figure>
        </div>

        <div class="column">
          <h1 class="title">{{ movie.title }}</h1>
          <p><strong>Release Date:</strong> {{ movie.release_date || 'N/A' }}</p>
          <p>
            <strong>Rating:</strong> {{ movie.vote_average || 'N/A' }}/10
            <span class="has-text-warning">{{ starRating }}</span>
          </p>
          <p v-if="movie.genres && movie.genres.length">
            <strong>Genres:</strong>
            <span v-for="(genre, index) in movie.genres" :key="genre.id">
              {{ genre.name }}<span v-if="index < movie.genres.length - 1">, </span>
            </span>
          </p>
          <p><strong>Duration:</strong> {{ formattedDuration || 'N/A' }}</p>
          <p>{{ movie.overview || 'No overview available.' }}</p>

          <div class="buttons mt-4">
            <button @click="showTrailer" class="button">Watch Trailer</button>
            <button @click="handleWatchedClick" class="button">Watched</button>
            <button @click="addToWantToWatch" class="button">Want to Watch</button>
          </div>
        </div>
      </div>

      <div v-if="trailerUrl" class="box mt-5">
        <div class="video">
          <iframe
            :src="trailerUrl"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <button @click="closeTrailer" class="button is-danger mt-3">Close</button>
      </div>

      <div v-if="showReviewForm" class="box mt-5">
        <h3 class="title is-4">Leave a Review</h3>

        <div class="star-rating mb-3">
          <span
            v-for="i in 10"
            :key="i"
            :class="['star', { filled: i <= review.rating }]"
            @click="setRating(i)"
            >&#9733;</span>
        </div>

        <textarea
          class="textarea"
          v-model="review.note"
          placeholder="Write your review here..."
        ></textarea>
        <p v-if="ratingError" class="has-text-danger mt-1">Please select a rating between 1 and 10.</p>

        <button @click="saveReview" class="button is-info mt-3">Submit Review</button>
      </div>

      <div v-if="recommendedMovies.length" class="mt-6">
        <h2 class="title is-5">Similar Movies</h2>
        <div class="columns is-multiline is-mobile">
          <div
            v-for="rec in recommendedMovies"
            :key="rec.id"
            class="column is-one-quarter"
            @click="navigateToMovie(rec.id)"
          >
            <div class="card hoverable">
              <div class="card-image">
                <figure class="image is-3by4">
                  <img :src="getImageUrl(rec.poster_path)" alt="Recommended Movie" />
                </figure>
              </div>
              <div class="card-content">
                <p class="has-text-centered">{{ rec.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { onMounted, ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getAuth } from 'firebase/auth'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  import { db } from '../firebase'
  const router = useRouter(); // <-- Initialize the router
  
  // Import methods from MovieService.js
  import { getMovieDetails, getImageUrl, getPopularMovies, searchMovies } from '../MovieService'
  
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
      // Use getMovieDetails from MovieService to fetch movie details
      movie.value = await getMovieDetails(id)
  
      // Fetch recommended movies (you can create a method for that as well in the service)
      recommendedMovies.value = await getPopularMovies()
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
        added_date: new Date().toISOString(), // This will store the current date and time
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
  
  // Fetch movie poster image using the imported getImageUrl method
  const posterUrl = computed(() =>
    movie.value?.poster_path ? getImageUrl(movie.value.poster_path) : '',
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
        added_date: new Date().toISOString(), // Add date when the movie is added
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
  const fetchMovieData = async (id) => {
    try {
      movie.value = await getMovieDetails(id)
      recommendedMovies.value = await getPopularMovies()
    } catch (error) {
      console.error('Error fetching movie data:', error)
    }
  }
  
  const navigateToMovie = (id) => {
    console.log('Navigating to movie with id:', id)
    router.push({ name: 'MovieDetails', params: { id } }).then(() => {
      // Manually call the function that fetches the movie data again
      fetchMovieData(id)
    })
  }
  
  
  </script>
  
  <style scoped>
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
