import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

interface FirebaseConfig {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
  measurementId?: string
}

// Fallback config (from legacy index.html)
const fallbackConfig: FirebaseConfig = {
  authDomain: "microbialworld-3ab5d.firebaseapp.com",
  projectId: "microbialworld-3ab5d",
  storageBucket: "microbialworld-3ab5d.firebasestorage.app",
  messagingSenderId: "756709081394",
  appId: "1:756709081394:web:a5c304b151429fbe49d72b"
}

const getFirebaseConfig = (): FirebaseConfig => {
  // Check window object (legacy compat helper loading firebase-config.js)
  const windowConfig = (window as any).MICROBACT_FIREBASE_CONFIG
  
  if (windowConfig && windowConfig.apiKey && windowConfig.apiKey !== "YOUR_API_KEY") {
    return windowConfig
  }

  // Check Vite environment variables
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  }

  if (envConfig.apiKey) {
    return envConfig
  }

  return fallbackConfig
}

const config = getFirebaseConfig()

let app: any = null
let auth: any = null
let db: any = null
let isFirebaseActive = false

if (config.apiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    isFirebaseActive = true
    console.log("🔥 Firebase Initialized successfully in Vite app")
  } catch (error) {
    console.error("Firebase initialization failed:", error)
  }
} else {
  console.warn("⚠️ Firebase Config is empty. Running in Offline LocalStorage Mode.")
}

export { app, auth, db, isFirebaseActive }
