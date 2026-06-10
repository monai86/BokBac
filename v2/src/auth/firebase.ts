import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let app: any = null
let auth: Auth | null = null
let db: Firestore | null = null
let isFirebaseActive = false

if (firebaseConfig.apiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    isFirebaseActive = true
    console.log("🔥 Firebase Initialized successfully in v2/src/auth/firebase.ts")
  } catch (error) {
    console.error("Firebase initialization failed:", error)
  }
} else {
  console.warn("⚠️ Firebase Config is empty in src/auth/firebase.ts. Running in Offline LocalStorage Mode.")
}

export { app, auth, db, isFirebaseActive }
