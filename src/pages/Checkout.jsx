import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table, Modal } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { FaCheckCircle, FaWallet } from 'react-icons/fa'
import apiClient from '../api/apiClient'
import useAuth from '../hooks/useAuth'
import { logFlow, logInfo, logError } from '../utils/logger'

export default function Checkout() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [walletBalance, setWalletBalance] = useState(0)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  })
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    logFlow('navigation', 'page_view', { page: '/checkout' })
    loadCartAndWallet()
  }, [])

  const loadCartAndWallet = async () => {
    try {
      const [cartRes, meRes] = await Promise.all([
        apiClient.get('/cart'),
        apiClient.get('/auth/me')
      ])
      const data = cartRes.data
      const items = Array.isArray(data) ? data : data.items || []
      if (items.length === 0) {
        navigate('/cart')
        return
      }
      setCartItems(items)
      setWalletBalance(meRes.data.walletBalance || 0)
    } catch {
      setError('Failed to load checkout details')
    } finally {
      setLoading(false)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * (item.quantity || 0), 0)
  const hasEnoughBalance = walletBalance >= total

  const handleChange = (e) => {
    setShippingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const addressString = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`
      const res = await apiClient.post('/orders', { shippingAddress: addressString })
      logInfo('order', 'order_placed', { orderId: res.data.orderId, total: res.data.totalAmount })
      setOrderSuccess(res.data)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to place order'
      logError('order', 'checkout_error', { error: errorMsg })
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  // Success screen
  if (orderSuccess) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={7}>
            <Card className="shadow text-center py-5">
              <Card.Body>
                <FaCheckCircle size={80} className="text-success mb-4" />
                <h2 className="text-success mb-3">Payment Successful!</h2>
                <p className="text-muted fs-5 mb-1">Your order has been placed successfully.</p>
                <hr className="my-4" />
                <Row className="text-start mx-auto" style={{ maxWidth: '350px' }}>
                  <Col xs={6} className="mb-2 text-muted">Order ID:</Col>
                  <Col xs={6} className="mb-2 fw-bold">#{orderSuccess.orderId}</Col>
                  <Col xs={6} className="mb-2 text-muted">Amount Paid:</Col>
                  <Col xs={6} className="mb-2 fw-bold text-success">&#8377;{(orderSuccess.totalAmount || 0).toFixed(2)}</Col>
                  <Col xs={6} className="mb-2 text-muted">Payment Method:</Col>
                  <Col xs={6} className="mb-2 fw-bold"><FaWallet className="me-1" />Wallet</Col>
                  <Col xs={6} className="mb-2 text-muted">Status:</Col>
                  <Col xs={6} className="mb-2"><span className="badge bg-success">Placed</span></Col>
                  <Col xs={6} className="mb-2 text-muted">Remaining Balance:</Col>
                  <Col xs={6} className="mb-2 fw-bold">&#8377;{(walletBalance - (orderSuccess.totalAmount || 0)).toFixed(2)}</Col>
                </Row>
                <hr className="my-4" />
                <div className="d-flex justify-content-center gap-3">
                  <Button variant="primary" as={Link} to="/orders">
                    View My Orders
                  </Button>
                  <Button variant="outline-secondary" as={Link} to="/products">
                    Continue Shopping
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={7}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Shipping Address</h5>
              <Form onSubmit={handleSubmit} id="checkout-form">
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleChange}
                    required
                    placeholder="123 MG Road, Apartment 4B"
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleChange}
                        required
                        placeholder="Hyderabad"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleChange}
                        required
                        placeholder="Telangana"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>PIN Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleChange}
                        required
                        placeholder="500001"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Payment Method */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3"><FaWallet className="me-2" />Payment Method</h5>
              <div className={`border rounded p-3 ${hasEnoughBalance ? 'border-success bg-light' : 'border-danger'}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Check
                      type="radio"
                      label={<span className="fw-bold">NLKart Wallet</span>}
                      checked
                      readOnly
                      id="wallet-payment"
                    />
                    <small className="text-muted ms-4">Pay directly from your wallet balance</small>
                  </div>
                  <div className="text-end">
                    <div className={`fw-bold fs-5 ${hasEnoughBalance ? 'text-success' : 'text-danger'}`}>
                      &#8377;{walletBalance.toFixed(2)}
                    </div>
                    <small className="text-muted">Available Balance</small>
                  </div>
                </div>
              </div>
              {!hasEnoughBalance && (
                <Alert variant="danger" className="mt-3 mb-0">
                  Insufficient wallet balance. You need &#8377;{(total - walletBalance).toFixed(2)} more to complete this purchase.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm sticky-top" style={{ top: '1rem' }}>
            <Card.Body>
              <h5 className="mb-3">Order Summary</h5>
              <Table borderless size="sm">
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.cartItemId}>
                      <td>
                        {item.productName}
                        <small className="text-muted"> x{item.quantity}</small>
                      </td>
                      <td className="text-end">&#8377;{((item.productPrice || 0) * (item.quantity || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <hr />
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Subtotal</span>
                <span>&#8377;{total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Total</span>
                <span className="text-primary">&#8377;{total.toFixed(2)}</span>
              </div>

              {hasEnoughBalance && (
                <div className="d-flex justify-content-between text-muted small mb-3">
                  <span>Balance after payment:</span>
                  <span>&#8377;{(walletBalance - total).toFixed(2)}</span>
                </div>
              )}

              <Button
                variant="success"
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-100"
                disabled={submitting || !hasEnoughBalance}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaWallet className="me-2" />
                    Pay &#8377;{total.toFixed(2)}
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
