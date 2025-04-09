const API_KEY = import.meta.env.VITE_TMDB_API_KEY//MAKE SURE TO ADD UR OWN API KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export const searchMovies = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('could not fetch movies:', error)
    return []
  }
}

export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
    return await response.json()
  } catch (error) {
    console.error('could not fetch details:', error)
    return null
  }
}

// movie poster URL
export const getImageUrl = (path) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/100x150'
}

export const getPopularMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return []
  }
}
