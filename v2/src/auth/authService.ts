import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  signInWithPopup, 
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

export const loginWithGoogle = async (): Promise<User> => {
  if (!isFirebaseActive || !auth) throw new Error('Firebase is not active')
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  return cred.user
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
