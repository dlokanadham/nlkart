import { useState, useEffect } from 'react'
import { Container, Table, Button, Badge, Spinner, Alert, Modal, Form, Row, Col } from 'react-bootstrap'
import { FaPlus, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import apiClient from '../../api/apiClient'

const ROLES = ['EndUser', 'Dealer', 'Reviewer', 'Administrator', 'SupportAgent']

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EndUser',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await apiClient.get('/admin/users')
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || [])
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const openCreate = () => {
    setEditingUser(null)
    setFormData({ email: '', username: '', password: '', firstName: '', lastName: '', role: 'EndUser' })
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setFormData({
      email: user.email || '',
      username: user.username || '',
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'EndUser',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (editingUser) {
        const payload = { ...formData }
        if (!payload.password) delete payload.password
        await apiClient.put(`/admin/users/${editingUser.id}`, payload)
        setSuccess('User updated successfully')
      } else {
        await apiClient.post('/admin/users', formData)
        setSuccess('User created successfully')
      }
      setShowModal(false)
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Operation failed')
    }
  }

  const toggleActive = async (user) => {
    setError('')
    setSuccess('')
    try {
      await apiClient.put(`/admin/users/${user.id}/toggle`)
      setSuccess(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to toggle user status')
    }
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">User Management</h2>
        <Button variant="primary" onClick={openCreate}>
          <FaPlus className="me-2" />
          Create User
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Table responsive hover className="align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td><Badge bg="info">{user.role}</Badge></td>
              <td>
                <Badge bg={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td>
                <div className="d-flex gap-1">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEdit(user)}
                    title="Edit"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant={user.isActive ? 'outline-danger' : 'outline-success'}
                    size="sm"
                    onClick={() => toggleActive(user)}
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Create User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={!!editingUser}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Password
                {editingUser && <small className="text-muted"> (leave blank to keep current)</small>}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingUser}
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}
