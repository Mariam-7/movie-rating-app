<template>
  <div class="watchlist-view container py-5">
    <h1 class="title is-3 has-text-centered">Your Watch List</h1>
<!-- If empty msg -->
    <div v-if="wantToWatch.length === 0" class="has-text-centered mt-5">
      <p class="subtitle is-5">Start adding some movies!</p>
    </div>

    <div v-else class="columns is-multiline is-variable is-4">
      <div v-for="movie in wantToWatch" :key="movie.id" class="column is-one-quarter">
        <div class="card">
          <div class="card-image">
            <!-- go to movie details if clicked -->
            <router-link :to="`/movie/${movie.id}`">
              <figure class="image is-3by4">
                <img :src="getImageUrl(movie.poster_path)" alt="Movie Poster" />
              </figure>
            </router-link>
          </div>
          <div class="card-content has-text-centered">
            <p class="title is-6">{{ movie.title }}</p>
            <p class="is-size-7 has-text-grey">
              <strong>Added on:</strong> {{ movie.added_date ? new Date(movie.added_date).toLocaleDateString() : 'N/A' }}
            </p>
            <button @click="removeFromWantToWatch(movie.id)" class="button is-info is-small mt-3"> Remove Movie </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const wantToWatch = ref([]) 
onMounted(async () => {
  const user = getAuth().currentUser; 
  if (user) {
    try {
      // access users detials from firebase
      const userRef = doc(db, 'users', user.uid); 
      const docSnap = await getDoc(userRef); 
      if (docSnap.exists()) {
        wantToWatch.value = docSnap.data().watchList || []; 
      } else {
        console.log('No watchlist found for this user');
      }
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
    }
  } else {
    console.log('User is not logged in');
  }
});

const removeFromWantToWatch = async (movieId) => {
  // remove and update page
  const updatedList = wantToWatch.value.filter((movie) => movie.id !== movieId); 
  wantToWatch.value = updatedList;

  const user = getAuth().currentUser;
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid); 
      await updateDoc(userRef, { watchList: updatedList }); 
      console.log('Movie removed from watchlist!');
    } catch (error) {
      console.error('Error removing movie from watchlist:', error);
    }
  }
};


// Helper function to generate image URLs for movie posters
const getImageUrl = (path) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/150x225?text=No+Image'
}
</script>

<style scoped>
.no-movies {
  text-align: center;
}
</style>
