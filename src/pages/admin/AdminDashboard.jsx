import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaUsers, FaBox, FaClipboardList, FaCog } from 'react-icons/fa'
import apiClient from '../../api/apiClient'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [utilsMsg, setUtilsMsg] = useState('')
  const [utilsError, setUtilsError] = useState('')
  const [runningUtil, setRunningUtil] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await apiClient.get('/admin/users')
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const runUtil = async (endpoint, name) => {
    setUtilsMsg('')
    setUtilsError('')
    setRunningUtil(name)
    try {
      const res = await apiClient.post(`/admin/utils/${endpoint}`)
      setUtilsMsg(res.data?.message || `${name} completed successfully!`)
    } catch (err) {
      setUtilsError(err.response?.data?.message || err.response?.data?.error || `Failed to run ${name}`)
    } finally {
      setRunningUtil('')
    }
  }

  const roleCount = (role) => users.filter((u) => u.role === role).length
  const activeCount = users.filter((u) => u.isActive).length

  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <Row className="g-3 mb-4">
            <Col sm={6} md={3}>
              <Card className="text-center border-primary">
                <Card.Body>
                  <FaUsers size={30} className="text-primary mb-2" />
                  <h3>{users.length}</h3>
                  <small className="text-muted">Total Users</small>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={3}>
              <Card className="text-center border-success">
                <Card.Body>
                  <FaUsers size={30} className="text-success mb-2" />
                  <h3>{activeCount}</h3>
                  <small className="text-muted">Active Users</small>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={3}>
              <Card className="text-center border-info">
                <Card.Body>
                  <FaBox size={30} className="text-info mb-2" />
                  <h3>{roleCount('Dealer')}</h3>
                  <small className="text-muted">Dealers</small>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={3}>
              <Card className="text-center border-warning">
                <Card.Body>
                  <FaClipboardList size={30} className="text-warning mb-2" />
                  <h3>{roleCount('EndUser')}</h3>
                  <small className="text-muted">End Users</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5 className="mb-3">
                    <FaUsers className="me-2" />
                    User Management
                  </h5>
                  <p className="text-muted">Manage users, create accounts, and control access.</p>
                  <Button as={Link} to="/admin/users" variant="primary">
                    Manage Users
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5 className="mb-3">
                    <FaCog className="me-2" />
                    Run Utilities
                  </h5>
                  {utilsMsg && <Alert variant="success" dismissible onClose={() => setUtilsMsg('')}>{utilsMsg}</Alert>}
                  {utilsError && <Alert variant="danger" dismissible onClose={() => setUtilsError('')}>{utilsError}</Alert>}
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => runUtil('run-rating', 'Rating Calculator')}
                      disabled={!!runningUtil}
                    >
                      {runningUtil === 'Rating Calculator' ? 'Running...' : 'Calc Ratings'}
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => runUtil('run-offers', 'Offer Generator')}
                      disabled={!!runningUtil}
                    >
                      {runningUtil === 'Offer Generator' ? 'Running...' : 'Run Offers'}
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => runUtil('run-notifications', 'Notifications')}
                      disabled={!!runningUtil}
                    >
                      {runningUtil === 'Notifications' ? 'Running...' : 'Send Notifications'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => runUtil('run-all', 'All Utilities')}
                      disabled={!!runningUtil}
                    >
                      {runningUtil === 'All Utilities' ? 'Running...' : 'Run All'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}
