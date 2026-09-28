import { adminAuth } from '../firebase-admin.js'

/**
 * Express middleware to verify Firebase ID tokens
 * Attaches verified user info to req.user
 */
export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || ''
  const match = authorization.match(/^Bearer (.+)$/)

  if (!match) {
    return res.status(401).json({ error: 'Missing bearer token' })
  }

  try {
    req.user = await adminAuth.verifyIdToken(match[1])
    return next()
  } catch (error) {
    console.error('Token verification failed:', error.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Optional middleware for routes that work with or without auth
 * Sets req.user if token is valid, but doesn't reject if missing
 */
export async function optionalAuth(req, res, next) {
  const authorization = req.headers.authorization || ''
  const match = authorization.match(/^Bearer (.+)$/)

  if (!match) {
    return next()
  }

  try {
    req.user = await adminAuth.verifyIdToken(match[1])
  } catch (error) {
    console.error('Token verification failed:', error.message)
  }

  return next()
}
