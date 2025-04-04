<template>
  <div class="home">  
    <div class="page-content">
      <div class="search-bar">
        <h1>Welcome to MovieMeter </h1>
        <input v-model="query" @input="searchMovies" placeholder="Search for movies..." />
      </div>
      <div class="dashboard">
          <div v-if="movies.length" class="movie-carousel">
        <div v-for="movie in movies" :key="movie.id" class="movie-card">
          <img :src="getImageUrl(movie.poster_path)" alt="Movie" width="150" />
          <h3>{{ movie.title }}</h3>
          <p>{{ movie.overview }}</p>
        </div>
      </div>
        <p v-else>Start by searching for movies!</p>
      </div>
    </div>
  </div>
</template>

<script>
import { searchMovies, getImageUrl, getPopularMovies } from "/Users/Ainia Farqaleet/movie-rating-app/src/MovieService"; 

export default {
  data() {
    return {
      query: "",
      movies: []
    };
  },
  async mounted() {
    // load popular movies by default
    this.movies = await getPopularMovies();
  },
  methods: {
    async searchMovies() {
      if (this.query.length > 2) {
        this.movies = await searchMovies(this.query);
      } else if (this.query.length === 0) {
        //  popular movies will show again if the search bar is cleared 
        this.movies = await getPopularMovies();
      }
    },
    getImageUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : "https://via.placeholder.com/100x150";
    }
  }
};
</script>


<style scoped>
.home {
  display: flex;
  height: 100vh;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}

.dashboard {
  margin-top: 20px;
}

.dashboard h2 {
  margin-bottom: 20px;
}

.dashboard img {
  margin-right: 10px;
}
.movie-carousel {
display: flex;
overflow-x: auto;
gap: 10px;
padding: 10px;
white-space: nowrap;
scroll-behavior: smooth;
}

.movie-card {
flex: 0 0 100%;  
max-width: 500px;  
text-align: center;
padding: 20px;
background: lightcyan;
color: black;
border-radius: 10px;
}

</style>
