import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap'
import { FaShoppingCart, FaUser, FaBell, FaWallet, FaDownload } from 'react-icons/fa'
import useAuth from '../../hooks/useAuth'
import apiClient from '../../api/apiClient'
import { exportLogs } from '../../utils/logger'
import { CartContext } from '../../context/CartContext'

export default function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const { cartCount, refreshCartCount } = useContext(CartContext)

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
      if (hasRole('EndUser')) {
        refreshCartCount()
      }
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications')
      setNotifications(res.data.filter((n) => !n.isRead))
    } catch {
      // ignore
    }
  }

  const markRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // ignore
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleExportLogs = () => {
    const json = exportLogs()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nlkart_logs_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          NLKart
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/products">Products</Nav.Link>

            {hasRole('Dealer') && (
              <NavDropdown title="Dealer" id="dealer-nav">
                <NavDropdown.Item as={Link} to="/dealer/dashboard">Dashboard</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/dealer/add-product">Add Product</NavDropdown.Item>
              </NavDropdown>
            )}

            {hasRole('Reviewer') && (
              <Nav.Link as={Link} to="/reviewer/dashboard">Review Queue</Nav.Link>
            )}

            {hasRole('Administrator') && (
              <NavDropdown title="Admin" id="admin-nav">
                <NavDropdown.Item as={Link} to="/admin/dashboard">Dashboard</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/users">User Management</NavDropdown.Item>
              </NavDropdown>
            )}

            {hasRole('SupportAgent') && (
              <Nav.Link as={Link} to="/support/dashboard">Support</Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center">
            {isAuthenticated && hasRole('EndUser') && (
              <Nav.Link as={Link} to="/cart" className="position-relative me-2">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.65em' }}>
                    {cartCount}
                  </Badge>
                )}
              </Nav.Link>
            )}

            {isAuthenticated && (
              <NavDropdown
                title={<FaBell size={18} />}
                id="notif-dropdown"
                align="end"
                className="me-2"
              >
                {notifications.length === 0 ? (
                  <NavDropdown.Item disabled>No new notifications</NavDropdown.Item>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <NavDropdown.Item key={n.id} onClick={() => markRead(n.id)}>
                      <small>{n.message}</small>
                    </NavDropdown.Item>
                  ))
                )}
              </NavDropdown>
            )}

            {isAuthenticated ? (
              <NavDropdown
                title={<><FaUser className="me-1" />{user?.username}</>}
                id="user-dropdown"
                align="end"
              >
                {hasRole('EndUser') && (
                  <>
                    <NavDropdown.Item as={Link} to="/wallet"><FaWallet className="me-2" />My Wallet</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleExportLogs}><FaDownload className="me-2" />Export Logs</NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  )
}
