import { auth } from './firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Authenticated fetch wrapper
 * Automatically includes Firebase ID token in Authorization header
 */
export async function authorizedFetch(endpoint, options = {}) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in')

  const idToken = await user.getIdToken()
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${idToken}`)
  headers.set('Content-Type', 'application/json')

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || response.statusText)
  }

  return response.json()
}

/**
 * Unauthenticated fetch wrapper
 */
export async function publicFetch(endpoint, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || response.statusText)
  }

  return response.json()
}

// API service methods
export const api = {
  // Auth
  async getProfile() {
    return authorizedFetch('/api/profile')
  },

  async updateProfile(profileData) {
    return authorizedFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  // Matches
  async getMatches(limit = 10) {
    return authorizedFetch(`/api/matches?limit=${limit}`)
  },

  async likeMatch(matchId) {
    return authorizedFetch(`/api/matches/${matchId}/like`, {
      method: 'POST',
    })
  },

  async passMatch(matchId) {
    return authorizedFetch(`/api/matches/${matchId}/pass`, {
      method: 'POST',
    })
  },

  // Ads
  async getMyAds() {
    return authorizedFetch('/api/ads')
  },

  async createAd(adData) {
    return authorizedFetch('/api/ads', {
      method: 'POST',
      body: JSON.stringify(adData),
    })
  },

  async updateAd(adId, adData) {
    return authorizedFetch(`/api/ads/${adId}`, {
      method: 'PUT',
      body: JSON.stringify(adData),
    })
  },

  async deleteAd(adId) {
    return authorizedFetch(`/api/ads/${adId}`, {
      method: 'DELETE',
    })
  },

  // Payments
  async createPaymentIntent(amount, description) {
    return authorizedFetch('/api/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    })
  },

  async verifyPayment(reference) {
    return authorizedFetch(`/api/payments/verify/${reference}`)
  },
}
