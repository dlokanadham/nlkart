import { useState, useEffect } from 'react'
import { Container, Card, Table, Badge, Spinner, Alert, Accordion } from 'react-bootstrap'
import apiClient from '../api/apiClient'
import { logFlow } from '../utils/logger'

const statusVariant = (status) => {
  const map = {
    Placed: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Cancelled: 'danger',
  }
  return map[status] || 'secondary'
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    logFlow('navigation', 'page_view', { page: '/orders' })
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const res = await apiClient.get('/orders')
      const data = res.data
      setOrders(Array.isArray(data) ? data : data.orders || [])
    } catch {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
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
      <h2 className="mb-4">My Orders</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h5 className="text-muted">No orders yet</h5>
            <p className="text-muted">Start shopping to see your orders here.</p>
          </Card.Body>
        </Card>
      ) : (
        <Accordion defaultActiveKey="0">
          {orders.map((order, idx) => (
            <Accordion.Item key={order.orderId} eventKey={String(idx)}>
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                  <div>
                    <strong>Order #{order.orderId}</strong>
                    <small className="text-muted ms-3">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </small>
                    <Badge bg={statusVariant(order.orderStatus)} className="ms-2">
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <strong className="text-primary">&#8377;{(order.totalAmount || 0).toFixed(2)}</strong>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                {order.items && order.items.length > 0 && (
                  <Table size="sm" bordered>
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>&#8377;{(item.unitPrice || 0).toFixed(2)}</td>
                          <td>&#8377;{((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  )
}
