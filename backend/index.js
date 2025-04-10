// backend/index.js

const express = require('express');
const axios = require('axios');  // To fetch data from TMDb API
const app = express();
const port = 5173;

app.use(express.json()); // Middleware to parse JSON

// Get user details
app.get('/api/user', async (req, res) => {
  const user = getAuth().currentUser;
  if (user) {
    res.json({
      email: user.email,
      // other user details (you could fetch from Firestore)
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Update user details (email/password)
app.put('/api/update-user', async (req, res) => {
  const { email, password } = req.body;
  const user = getAuth().currentUser;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Update email if provided
    if (email && email !== user.email) {
      await updateEmail(user, email);
    }

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // hash the password before storing
      await updatePassword(user, hashedPassword);
    }

    // If you want to update Firestore (e.g., for user profile info), do so here:
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { email });
    res.json({ message: 'User details updated successfully!' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user details' });
  }
});


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
