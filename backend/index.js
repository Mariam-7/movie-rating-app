const express = require('express');
const axios = require('axios');  
const app = express();
const port = 5173;

app.use(express.json()); // Middleware to parse JSON

// Fetch popular movies
app.get('/api/popular-movies', async (req, res) => {
  const API_KEY = 'YOUR_TMDB_API_KEY';  
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
