import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin SDK
// Uses Application Default Credentials (ADC)
// For local development, set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  })
}

export const adminAuth = getAuth()
