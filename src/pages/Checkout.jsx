import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'

export default function Checkout() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const res = await apiClient.get('/cart')
      const data = res.data
      const items = Array.isArray(data) ? data : data.items || []
      if (items.length === 0) {
        navigate('/cart')
        return
      }
      setCartItems(items)
    } catch {
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)

  const handleChange = (e) => {
    setShippingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const addressString = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`
      await apiClient.post('/orders', { shippingAddress: addressString })
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to place order')
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

  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={7}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Shipping Address</h5>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleChange}
                    required
                    placeholder="123 Main St"
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
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleChange}
                        required
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
                        placeholder="USA"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Order Summary</h5>
              <Table borderless size="sm">
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.productName || item.name}
                        <small className="text-muted"> x{item.quantity}</small>
                      </td>
                      <td className="text-end">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
