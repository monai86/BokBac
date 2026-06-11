import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'

declare global {
  interface Window {
    MICROBACT_FIREBASE_CONFIG?: {
      apiKey?: string
      authDomain?: string
      projectId?: string
      storageBucket?: string
      messagingSenderId?: string
      appId?: string
      measurementId?: string
    }
  }
}

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyD8sZ9bJoOq5Dv0M7NSaDkt5Dj321LgYQA",
  authDomain: "bokbac-app.firebaseapp.com",
  projectId: "bokbac-app",
  storageBucket: "bokbac-app.firebasestorage.app",
  messagingSenderId: "1058529712770",
  appId: "1:1058529712770:web:a7d00fe2ac20d39fe9729b",
  measurementId: "G-YNS6WJSJ2L",
}

const firebaseConfig = (typeof window !== 'undefined' && window.MICROBACT_FIREBASE_CONFIG && window.MICROBACT_FIREBASE_CONFIG.apiKey && window.MICROBACT_FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY")
  ? window.MICROBACT_FIREBASE_CONFIG
  : fallbackFirebaseConfig

let app: any = null
let auth: Auth | null = null
let db: Firestore | null = null
let isFirebaseActive = false

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    // Set explicit persistence to avoid Safari ITP blocking auth state
    setPersistence(auth, browserLocalPersistence).catch((e) =>
      console.warn('Firebase Auth persistence warning:', e)
    )
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
