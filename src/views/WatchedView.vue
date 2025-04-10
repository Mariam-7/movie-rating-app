import RatingD3Chart from '../components/RatingD3Chart.vue'
const showGraph = ref(false)
const ratingData = computed(() => watchedMovies.value.map(movie => movie.review?.rating))

<template>
  <div class="watched-view section">
    <h1 class="title is-3">Your Watched Movies</h1>

    <div v-if="watchedMovies.length === 0">
      <p>Start adding some movies!</p>
    </div>

    <button @click="showGraph = !showGraph" class="button">
      {{ showGraph ? 'Hide Rating Breakdown' : 'Show Rating Breakdown' }}
    </button>

    <div v-if="showGraph" class="mb-5">
      <RatingD3Chart :ratings="ratingData" />
    </div>

    <div v-else class="columns is-multiline">
      <div v-for="movie in watchedMovies" :key="movie.id" class="column is-12 box">
        <div class="media">
          <figure class="media-left">
            <router-link :to="`/movie/${movie.id}`" class="image is-96x128">
              <img :src="getImageUrl(movie.poster_path)" alt="Movie Poster" />
            </router-link>
          </figure>

          <div class="media-content">
            <router-link :to="`/movie/${movie.id}`">
              <h3 class="title is-5">{{ movie.title }}</h3>
            </router-link>

            <div v-if="!movie.isEditing">
              <p><strong>Added on:</strong> {{ movie.added_date ? new Date(movie.added_date).toLocaleDateString() : 'N/A' }}</p>
              <p><strong>Rating:</strong> <span v-html="generateStarRating(movie.review.rating)"></span></p>
              <p><strong>Review:</strong> {{ movie.review.note || 'No review provided.' }}</p>

              <button @click="editReview(movie)" class="button is-primary mt-2">Edit Review</button>
            </div>

            <div v-else>
              <div class="mb-2">
                <p class="has-text-weight-semibold">Your Rating:</p>
                <div class="star-rating mb-2">
                  <span
                    v-for="star in 10"
                    :key="star"
                    @click="setRating(movie, star)"
                    :class="{'has-text-warning': movie.review.rating >= star}"
                    class="star is-size-4 mr-1"
                    style="cursor: pointer;"
                  >
                    ★
                  </span>
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <textarea class="textarea" v-model="movie.review.note" placeholder="Write your review here..."></textarea>
                </div>
              </div>

              <div class="buttons mt-3">
                <button @click="saveReview(movie)" class="button">Save Review</button>
                <button @click="removeFromWatched(movie.id)" class="button">Remove Movie</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import RatingD3Chart from '../components/RatingD3Chart.vue' 

const watchedMovies = ref([])
const showGraph = ref(false) 
const ratingData = computed(() => watchedMovies.value.map(movie => movie.review?.rating))

// Fetch watched movies from Firestore
onMounted(async () => {
  const user = getAuth().currentUser;
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        watchedMovies.value = docSnap.data().watched || [];
      } else {
        console.log('No watched movies found for this user');
      }
    } catch (error) {
      console.error('Error fetching watched movies:', error);
    }
  } else {
    console.log('User not logged in');
  }
})

// Helper function to generate image URLs for movie posters
const getImageUrl = (path) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/150x225?text=No+Image';
}

// Edit review form toggling
const editReview = (movie) => {
  movie.isEditing = true;
}

// Set the rating when the user clicks a star
const setRating = (movie, rating) => {
  movie.review.rating = rating;
}

// Save the edited review to Firestore
const saveReview = async (movie) => {
  const user = getAuth().currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    let watchedList = docSnap.exists() ? docSnap.data().watched || [] : [];

    // Find the movie in the watched list
    const movieIndex = watchedList.findIndex((m) => m.id === movie.id);
    if (movieIndex !== -1) {
      watchedList[movieIndex].review = movie.review; // Update the review

      // Save the updated list back to Firestore
      await updateDoc(userRef, {
        watched: watchedList,
      });
      movie.isEditing = false; // Close the edit form
      console.log('Review updated successfully!');
    }
  }
}

// Remove a movie from the watched list and update Firestore
const removeFromWatched = async (movieId) => {
  const updatedWatched = watchedMovies.value.filter((movie) => movie.id !== movieId);
  watchedMovies.value = updatedWatched; // Immediate UI update

  const user = getAuth().currentUser;
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        watched: updatedWatched, // Update the watched list in Firestore
      });
      console.log('Movie removed from watched list in Firestore!');
    } catch (error) {
      console.error('Error removing movie from watched list:', error);
    }
  }
  alert('Movie removed from Watched list!');
}

// Generate star rating HTML for display
const generateStarRating = (rating) => {
  if (!rating) return ''; 

  let stars = '';
  for (let i = 1; i <= 10; i++) {
    stars += i <= rating ? '★' : '☆';
  }
  return stars;
}

</script>
<style scoped>
.movie-link h3 {
  color: #363636;
  margin-top: 10px;
  font-weight: 600;
}


.watched-view {
  padding: 20px;
}

.star-rating {
  display: flex;
  gap: 5px;
  font-size: 30px;
}

.star {
  cursor: pointer;
  color: #ccc;
}

.star.filled,
.has-text-warning {
  color: #ffb400;
}

.star:hover {
  color: #ffaa00;
}
</style>
