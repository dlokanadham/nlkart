import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaUsers, FaBox, FaClipboardList, FaCog, FaChartBar, FaPercent, FaBell, FaRocket } from 'react-icons/fa'
import apiClient from '../../api/apiClient'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [utilResults, setUtilResults] = useState({})
  const [utilErrors, setUtilErrors] = useState({})
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
    setUtilResults((prev) => ({ ...prev, [name]: '' }))
    setUtilErrors((prev) => ({ ...prev, [name]: '' }))
    setRunningUtil(name)
    try {
      const res = await apiClient.post(`/admin/utils/${endpoint}`)
      setUtilResults((prev) => ({ ...prev, [name]: res.data?.message || `${name} completed successfully!` }))
    } catch (err) {
      setUtilErrors((prev) => ({ ...prev, [name]: err.response?.data?.message || err.response?.data?.error || `Failed to run ${name}` }))
    } finally {
      setRunningUtil('')
    }
  }

  const roleCount = (role) => users.filter((u) => u.roleName === role).length
  const activeCount = users.filter((u) => u.isActive).length

  const utilities = [
    {
      key: 'Rating Calculator',
      title: 'Calculate Ratings',
      icon: FaChartBar,
      color: '#0d6efd',
      bgLight: '#e7f1ff',
      borderColor: 'primary',
      btnVariant: 'primary',
      endpoint: 'run-rating',
      description: 'Recalculates product ratings using Bayesian average formula (like IMDB). Products with more reviews get ratings closer to their actual average.',
    },
    {
      key: 'Offer Generator',
      title: 'Run Offers',
      icon: FaPercent,
      color: '#198754',
      bgLight: '#e8f5e9',
      borderColor: 'success',
      btnVariant: 'success',
      endpoint: 'run-offers',
      description: 'Matches products against active offer rules by category, season, price range. Highest matching discount is applied to each product.',
    },
    {
      key: 'Notifications',
      title: 'Send Notifications',
      icon: FaBell,
      color: '#fd7e14',
      bgLight: '#fff3e0',
      borderColor: 'warning',
      btnVariant: 'warning',
      endpoint: 'run-notifications',
      description: 'Scans for events (product approved/rejected, low stock) and creates notifications for dealers. Also stubs email sending.',
    },
    {
      key: 'All Utilities',
      title: 'Run All',
      icon: FaRocket,
      color: '#6f42c1',
      bgLight: '#f3e8ff',
      borderColor: 'secondary',
      btnVariant: 'dark',
      endpoint: 'run-all',
      description: 'Runs all three utilities in sequence: Ratings \u2192 Offers \u2192 Notifications.',
    },
  ]

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
              <Card className="text-center border-info">
                <Card.Body>
                  <FaBox size={30} className="text-info mb-2" />
                  <h3>{roleCount('Dealer')}</h3>
                  <small className="text-muted">Dealers</small>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={3}>
              <Card className="text-center border-success">
                <Card.Body>
                  <FaClipboardList size={30} className="text-success mb-2" />
                  <h3>{roleCount('Reviewer')}</h3>
                  <small className="text-muted">Reviewers</small>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={3}>
              <Card className="text-center border-warning">
                <Card.Body>
                  <FaUsers size={30} className="text-warning mb-2" />
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
          </Row>

          {/* Run Utilities */}
          <h4 className="mb-3">
            <FaCog className="me-2" />
            Run Utilities
          </h4>
          <Row className="g-3 mb-4">
            {utilities.map((util) => {
              const IconComponent = util.icon
              const isRunning = runningUtil === util.key
              const result = utilResults[util.key]
              const error = utilErrors[util.key]

              return (
                <Col md={6} key={util.key}>
                  <Card className={`h-100 border-${util.borderColor}`} style={{ borderTop: `3px solid ${util.color}` }}>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                          style={{
                            width: 48,
                            height: 48,
                            backgroundColor: util.bgLight,
                          }}
                        >
                          <IconComponent size={22} style={{ color: util.color }} />
                        </div>
                        <h5 className="mb-0">{util.title}</h5>
                      </div>

                      <p className="text-muted small mb-3">{util.description}</p>

                      {result && (
                        <Alert variant="success" dismissible onClose={() => setUtilResults((prev) => ({ ...prev, [util.key]: '' }))} className="small py-2 mb-2">
                          {result}
                        </Alert>
                      )}
                      {error && (
                        <Alert variant="danger" dismissible onClose={() => setUtilErrors((prev) => ({ ...prev, [util.key]: '' }))} className="small py-2 mb-2">
                          {error}
                        </Alert>
                      )}

                      <div className="mt-auto">
                        <Button
                          variant={util.btnVariant}
                          size="sm"
                          onClick={() => runUtil(util.endpoint, util.key)}
                          disabled={!!runningUtil}
                        >
                          {isRunning ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" className="me-2" />
                              Running...
                            </>
                          ) : (
                            <>
                              <IconComponent className="me-1" />
                              {util.title}
                            </>
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </>
      )}
    </Container>
  )
}
