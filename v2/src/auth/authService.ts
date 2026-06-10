import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged as fbOnAuthStateChanged
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, isFirebaseActive } from './firebase'

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
  if (!isFirebaseActive || !auth) throw new Error('Firebase is not active')
  const cred = await signInWithEmailAndPassword(auth, email, pass)
  return cred.user
}

export const signupWithEmail = async (email: string, pass: string, name: string): Promise<User> => {
  if (!isFirebaseActive || !auth) throw new Error('Firebase is not active')
  const cred = await createUserWithEmailAndPassword(auth, email, pass)
  if (cred.user) {
    await updateProfile(cred.user, { displayName: name.trim() })
  }
  return cred.user
}

/**
 * Initiates Google Sign-in via redirect (works on Safari + all browsers).
 * The page will navigate away; call handleGoogleRedirectResult() on return.
 */
export const loginWithGoogle = async (): Promise<void> => {
  if (!isFirebaseActive || !auth) throw new Error('Firebase is not active')
  const provider = new GoogleAuthProvider()
  await signInWithRedirect(auth, provider)
}

/**
 * Must be called on app mount to process the redirect result from loginWithGoogle().
 * Returns the user if authentication succeeded, null otherwise.
 */
export const handleGoogleRedirectResult = async (): Promise<User | null> => {
  if (!isFirebaseActive || !auth) return null
  try {
    const result = await getRedirectResult(auth)
    return result?.user ?? null
  } catch (error) {
    console.error('Google redirect result error:', error)
    return null
  }
}

export const logout = async (): Promise<void> => {
  if (isFirebaseActive && auth) {
    await signOut(auth)
  }
}

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  if (!isFirebaseActive || !auth) {
    callback(null)
    return () => {}
  }
  return fbOnAuthStateChanged(auth, callback)
}
