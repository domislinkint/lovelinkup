import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, authReady } from './firebase'

const googleProvider = new GoogleAuthProvider()

export async function registerWithEmail({ name, email, password }) {
  await authReady
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  if (name) await updateProfile(credential.user, { displayName: name })
  await sendEmailVerification(credential.user)
  return credential.user
}

export async function loginWithEmail(email, password) {
  await authReady
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function loginWithGoogle() {
  await authReady
  const credential = await signInWithPopup(auth, googleProvider)
  return credential.user
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

export function logout() {
  return signOut(auth)
}

export function getCurrentUser() {
  return auth.currentUser
}

export async function getIdToken() {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in')
  return user.getIdToken()
}

export async function updateUserProfile(updates) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in')
  return updateProfile(user, updates)
}
