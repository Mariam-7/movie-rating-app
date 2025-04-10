# Movie Rating App

## Overview

This is a movie rating app that allows users to browse popular movies, rate them, and manage their watchlist and watched movies. The app uses Firebase for authentication and data storage, and the TMDB API for fetching movie data.

## Prerequisites

Before running the app, make sure you have the following installed:
- Node.js (v16 or later)
- npm (Node Package Manager)

## Getting Started

### 1. Clone the Repository

To get started, clone the repository to your local machine:

```bash
git clone <project-link>
```

Navigate to the project directory:

```bash
cd <project-directory>
```

### 2. Install Dependencies

Run the following command to install the necessary dependencies:

```bash
npm install
```

### 3. Firebase Setup

This app uses Firebase for authentication and Firestore database. To set it up:

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/) and create a new Firebase project (if you don't have one already).

2. **Enable Authentication**:
   - Go to **Authentication** in Firebase Console.
   - Enable **Email/Password Authentication** (or other methods if needed).

3. **Configure Firestore**:
   - Go to **Firestore Database** in Firebase Console.
   - Set up the Firestore database and configure security rules.

4. **Get Firebase Configuration**:
   - Go to **Project Settings** > **General** > **Your apps** > **Firebase SDK setup and configuration**.
   - Copy the Firebase configuration object and paste it into the `firebase.js` file in your project.

### 4. TMDB API Setup

This app fetches movie data using the TMDB (The Movie Database) API. To set it up:

1. **Create an Account on TMDB**:
   - Go to [TMDB](https://www.themoviedb.org/) and create a free account.

2. **Get Your API Key**:
   - Once logged in, go to **Account Settings** > **API**.
   - Generate a new API key.

3. **Configure the API Key**:
   - Replace the placeholder `YOUR_TMDB_API_KEY` in the project with your actual API key.

### 5. Running the Application

Once all dependencies are installed and the Firebase and TMDB configurations are set:

1. **Start the Development Server**:

```bash
npm run dev
```

2. The app will be running locally on `http://localhost:5173`.

Note: If backend isn't starting with express, cd into backend and manually start, then run as usual
```
cd backend
npm run start
cd .. 
npm run dev
```

### 6. Environment Variables

To store sensitive information such as your Firebase and TMDB API keys, use environment variables:

1. **Create a `.env` file** in the root directory of your project:

```bash
VITE_TMDB_API_KEY=your-tmdb-api-key-here
VITE_FIREBASE_API_KEY=your-firebase-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain-here
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id-here
...
```

2. **Add `.env` to `.gitignore`** to prevent it from being committed to version control.

---
