import { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Table } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa'
import apiClient from '../api/apiClient'
import { logFlow, logInfo } from '../utils/logger'
import { CartContext } from '../context/CartContext'

const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#dee2e6"><rect width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6c757d" font-size="10">No Image</text></svg>')

export default function Cart() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setCartCount } = useContext(CartContext)

  useEffect(() => {
    logFlow('navigation', 'page_view', { page: '/cart' })
    loadCart()
  }, [])

  const loadCart = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/cart')
      const data = res.data
      const cartItems = Array.isArray(data) ? data : data.items || []
      setItems(cartItems)
      setCartCount(cartItems.length)
    } catch {
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) return
    logInfo('cart', 'quantity_change', { cartItemId, newQuantity: newQty })
    try {
      await apiClient.put(`/cart/${cartItemId}`, { quantity: newQty })
      setItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
        )
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity')
    }
  }

  const removeItem = async (cartItemId) => {
    logInfo('cart', 'item_remove', { cartItemId })
    try {
      await apiClient.delete(`/cart/${cartItemId}`)
      setItems((prev) => {
        const updated = prev.filter((item) => item.cartItemId !== cartItemId)
        setCartCount(updated.length)
        return updated
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item')
    }
  }

  const total = items.reduce((sum, item) => sum + (item.productPrice || 0) * (item.quantity || 0), 0)

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Shopping Cart</h2>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {items.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h4 className="text-muted mb-3">Your cart is empty</h4>
            <Button as={Link} to="/products" variant="primary">
              Continue Shopping
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col lg={8}>
            <Table responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th style={{ width: '150px' }}>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.cartItemId}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={item.productImage || FALLBACK_IMG}
                          alt={item.productName}
                          className="cart-item-img me-3"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = FALLBACK_IMG
                          }}
                        />
                        <div>
                          <Link to={`/products/${item.productId}`} className="text-decoration-none fw-bold">
                            {item.productName}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td>&#8377;{(item.productPrice || 0).toFixed(2)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus size={10} />
                        </Button>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.cartItemId, parseInt(e.target.value) || 1)}
                          min={1}
                          className="mx-2 text-center"
                          style={{ width: '60px' }}
                          size="sm"
                        />
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        >
                          <FaPlus size={10} />
                        </Button>
                      </div>
                    </td>
                    <td className="fw-bold">&#8377;{((item.productPrice || 0) * (item.quantity || 0)).toFixed(2)}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeItem(item.cartItemId)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Items ({items.length})</span>
                  <span>&#8377;{total.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3 fw-bold fs-5">
                  <span>Total</span>
                  <span className="text-primary">&#8377;{total.toFixed(2)}</span>
                </div>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => { logFlow('cart', 'proceed_to_checkout'); navigate('/checkout') }}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  as={Link}
                  to="/products"
                  variant="outline-secondary"
                  className="w-100 mt-2"
                >
                  Continue Shopping
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  )
}
