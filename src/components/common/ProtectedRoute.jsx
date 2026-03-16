import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { Spinner, Container } from 'react-bootstrap'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, hasRole } = useAuth()

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading...</p>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />
  }

  return children
}
