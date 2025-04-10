import axios from 'axios'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY  // Make sure this is defined in your .env file
const BASE_URL = 'https://api.themoviedb.org/3'

export const searchMovies = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query: query,
      },
    })
    return response.data.results
  } catch (error) {
    console.error('Could not fetch movies:', error)
    return []
  }
}

export const getMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: API_KEY,
      },
    })
    return response.data
  } catch (error) {
    console.error('Could not fetch details:', error)
    return null
  }
}

export const getImageUrl = (path) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/100x150'
}

export const getPopularMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: API_KEY,
      },
    })
    return response.data.results
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return []
  }
}

// Method to post a review for a movie
export const postReview = async (movieId, rating, review) => {
  try {
    const response = await axios.post(`${BASE_URL}/review`, {
      movieId,
      rating,
      review
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error posting review:', error);
    return null;
  }
};
