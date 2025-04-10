import RatingD3Chart from '../components/RatingD3Chart.vue'
const showGraph = ref(false)
const ratingData = computed(() => watchedMovies.value.map(movie => movie.review?.rating))


<template>
  <div class="watched-view">
    <h1>Your Watched Movies</h1>

    <!-- If no movies are watched, display a message -->
    <div v-if="watchedMovies.length === 0" class="no-movies">
      <p>Start adding some movies!</p>
    </div>

    <!-- Display rating bar graph toggle -->
    <button @click="showGraph = !showGraph" class="edit-btn" style="margin-bottom: 20px;">
      {{ showGraph ? 'Hide Rating Breakdown' : 'Show Rating Breakdown' }}
    </button>

    <div v-if="showGraph" style="margin-bottom: 30px;">
      <RatingD3Chart :ratings="ratingData" />
    </div>

    <!-- Display movies if watchedMovies is populated -->
    <div v-else class="movie-list">
      <div v-for="movie in watchedMovies" :key="movie.id" class="movie-item">
        <router-link :to="`/movie/${movie.id}`" class="movie-link">
          <img :src="getImageUrl(movie.poster_path)" alt="Movie Poster" width="150" />
          <h3>{{ movie.title }}</h3>
        </router-link>

        <!-- Display the review for the movie -->
        <div v-if="!movie.isEditing">
          <p><strong>Added on:</strong> {{ movie.added_date ? new Date(movie.added_date).toLocaleDateString() : 'N/A' }}</p>
          <p><strong>Rating:</strong> <span v-html="generateStarRating(movie.review.rating)"></span></p>
          <p><strong>Review:</strong> {{ movie.review.note || 'No review provided.' }}</p>
a
          <!-- Edit button -->
          <button @click="editReview(movie)" class="edit-btn">Edit Review</button>
        </div>

        <!-- Review edit form -->
        <div v-else>
          <div class="star-rating">
            <span
              v-for="star in 10"
              :key="star"
              @click="setRating(movie, star)"
              :class="{'filled': movie.review.rating >= star}"
              class="star"
            >
              ★
            </span>
          </div>
          <textarea v-model="movie.review.note" placeholder="Write your review here..."></textarea>
          <button @click="saveReview(movie)" class="save-btn">Save Review</button>
          <button @click="removeFromWatched(movie.id)" class="remove-btn">Remove Movie</button>
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
import RatingD3Chart from '../components/RatingD3Chart.vue' // <-- this was outside before

const watchedMovies = ref([])
const showGraph = ref(false) // <-- added
const ratingData = computed(() => watchedMovies.value.map(movie => movie.review?.rating)) // <-- added

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

.edit-btn,
.save-btn,
.remove-btn {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: rgb(0, 145, 255);
  color: white;
  border: none;
  cursor: pointer;
}

.edit-btn:hover,
.save-btn:hover,
.remove-btn:hover {
  background-color: rgb(0, 145, 255);
}

.no-movies {
  text-align: center;
}

.movie-link {
  text-decoration: none;
}

.movie-link h3 {
  font-size: 1.2rem;
  margin-top: 10px;
  color: #333;
}

.movie-link img {
  max-width: 150px;
  max-height: 225px;
  object-fit: cover;
}

/* Star rating styles */
.star-rating {
  display: flex;
  gap: 5px;
  font-size: 30px;
}

.star {
  cursor: pointer;
  color: #ccc;
}

.star.filled {
  color: #ffb400;
}
</style>