// backend/index.js

const express = require('express');
const axios = require('axios');  // To fetch data from TMDb API
const app = express();
const port = 5173;

app.use(express.json()); // Middleware to parse JSON

// Fetch popular movies
app.get('/api/popular-movies', async (req, res) => {
  const API_KEY = 'YOUR_TMDB_API_KEY';  // Replace with your TMDb API key
  try {
    const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
      params: { api_key: API_KEY, language: 'en-US', page: 1 }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({ error: 'Error fetching popular movies' });
  }
});

// Post a review for a movie
app.post('/api/review', (req, res) => {
  const { movieId, rating, review } = req.body;
  // Here you can handle saving the review to a database
  console.log(`Review for movie ${movieId} - Rating: ${rating}, Review: ${review}`);
  res.json({ message: `Review for movie ${movieId} received!` });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
