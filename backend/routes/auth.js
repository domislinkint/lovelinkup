import express from 'express'
import { adminAuth } from '../firebase-admin.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/auth/profile
 * Requires authentication
 * Returns current user profile from Firebase
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userRecord = await adminAuth.getUser(req.user.uid)
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || null,
      photoURL: userRecord.photoURL || null,
      emailVerified: userRecord.emailVerified,
      createdAt: userRecord.metadata.creationTime,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

/**
 * POST /api/auth/logout
 * Client-side logout endpoint (informational)
 * The client removes the token; this endpoint can log the logout event
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Optionally revoke refresh tokens for immediate sign-out across devices
    await adminAuth.revokeRefreshTokens(req.user.uid)
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' })
  }
})

export default router
