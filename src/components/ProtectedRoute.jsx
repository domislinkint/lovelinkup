import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'

/**
 * Protected route wrapper
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useCurrentUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * Guest route wrapper
 * Redirects to home if user is already authenticated
 */
export function GuestRoute({ children }) {
  const { user, loading } = useCurrentUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
