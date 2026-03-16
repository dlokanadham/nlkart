import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { logFlow, logInfo, logError } from '../utils/logger'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    logFlow('auth', 'login_attempt', { username })
    try {
      const user = await login(username, password)
      logInfo('auth', 'login_success', { roleName: user.roleName })
      // Redirect based on role
      switch (user.roleName) {
        case 'Administrator':
          navigate('/admin/dashboard')
          break
        case 'Dealer':
          navigate('/dealer/dashboard')
          break
        case 'Reviewer':
          navigate('/reviewer/dashboard')
          break
        case 'SupportAgent':
          navigate('/support/dashboard')
          break
        default:
          navigate('/')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.'
      logError('auth', 'login_failure', { error: errorMsg })
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Login</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register">Register here</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
