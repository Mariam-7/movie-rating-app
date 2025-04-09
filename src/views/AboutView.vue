<template>
  <div class="page-content">
    <h1>About MovieMeter 🎬 </h1>
    <p>
      MovieMeter is your go-to website for tracking movies you've previously watched and those you plan to watch. 
    </p>

    <p>
      Built using Vue.js for a seamless user experience, MovieMeter uses Firebase for real-time user authentication and data storage, allowing each user to securely maintain a personalized movie collection.
    </p>
    
    <h2>Features that make MovieMeter Amazing!</h2>
    <ul>
      <li><strong>Watched & Want-to-Watch Lists:</strong> Keep track of your movie history and future watchlist.</li>
      <li><strong>Rating System:</strong> Add personal star ratings to the movies you've watched.</li>
      <li><strong>D3 Charts:</strong> Visualize your ratings or watch trends through interactive charts.</li>
      <li><strong>Movie Details Page:</strong>  Get key info like movie overview, release date, ratings, trailers, and poster.</li>
      <li><strong>User Authentication:</strong> Secure sign-up/login with Firebase Authentication.</li>
      <li><strong>Modern UI:</strong> Clean layout, mobile-friendly design, and accessibility-first approach.</li>
    </ul>

    <p>
      Whether you're enjoy movies casually or consider yourself a cinephile, MovieMeter is the best option for you!
    </p>
  </div>

  <div class="page-content">
    <h1>Student List</h1>
    <table>
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Banner ID</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Areej Kamran</td>
          <td>100863076</td>
        </tr>
        <tr>
          <td>Ainia Farqaleet</td>
          <td>100874125</td>
        </tr>
        <tr>
          <td>Mariam Hafeez</td>
          <td>100875280</td>
        </tr>
        <tr>
          <td>Dima Salma</td>
          <td>100843040</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-content {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 1.5rem;
  font-size: 1.25rem;
  color: #007acc;
}

ul {
  padding-left: 20px;
  list-style: disc;
  margin-top: 0.5rem;
}

li {
  margin-bottom: 0.5rem;
}
table {
  width: 50%;
  border-collapse: collapse;
  margin: auto;
}

th, td {
  padding: 10px;
  text-align: left;
  border: 1px solid rgb(0, 145, 255);
}

th {
  background-color: rgb(0, 145, 255);
}

</style>
