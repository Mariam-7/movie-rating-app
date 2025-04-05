import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { initializeFirestore, persistentLocalCache, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "536135692717",
  appId: "1:536135692717:web:50adba06fe718928c23124",
  measurementId: "G-GGMGBWHMMP"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
})

export const initAuth = (callback) => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {  // Only create doc if email is verified
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          watchlist: [],
          rated_movies: [],
          last_login: new Date()
        }, { merge: true })
      } catch (err) {
        console.error("Firestore write failed:", err)
      }
    }
    callback?.(user)
  })
  return unsubscribe
}

export { auth, db }