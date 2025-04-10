import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const initAuth = (callback) => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {
      // Only create doc if email is verified
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            email: user.email,
            // username: user.username,
            watchlist: [],
            rated_movies: [],
            last_login: new Date(),
          },
          { merge: true },
        )
      } catch (err) {
        console.error('Firestore write failed:', err)
      }
    }
    callback?.(user)
  })
  return unsubscribe
}

export { auth, db }
