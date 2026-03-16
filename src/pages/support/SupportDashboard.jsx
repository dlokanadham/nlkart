import { useState, useEffect } from 'react'
import { Container, Table, Badge, Spinner, Alert, Card, Tabs, Tab } from 'react-bootstrap'
import apiClient from '../../api/apiClient'

const orderStatusVariant = (status) => {
  const map = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'primary',
    Delivered: 'success',
    Cancelled: 'danger',
  }
  return map[status] || 'secondary'
}

const productStatusVariant = (status) => {
  const map = {
    Approved: 'success',
    Pending: 'warning',
    Rejected: 'danger',
  }
  return map[status] || 'secondary'
}

export default function SupportDashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrders()
    loadProducts()
  }, [])

  const loadOrders = async () => {
    try {
      const res = await apiClient.get('/orders')
      const data = res.data
      setOrders(Array.isArray(data) ? data : data.data || data.orders || [])
    } catch (err) {
      setError('Failed to load orders: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await apiClient.get('/products?per_page=50')
      const data = res.data
      setProducts(Array.isArray(data) ? data : data.data || data.products || [])
    } catch {
      // ignore
    } finally {
      setLoadingProducts(false)
    }
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Support Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Card className="flex-fill">
          <Card.Body className="text-center">
            <h3 className="text-primary">{orders.length}</h3>
            <small className="text-muted">Total Orders</small>
          </Card.Body>
        </Card>
        <Card className="flex-fill">
          <Card.Body className="text-center">
            <h3 className="text-info">{products.length}</h3>
            <small className="text-muted">Total Products</small>
          </Card.Body>
        </Card>
      </div>

      <Tabs defaultActiveKey="orders" className="mb-4">
        <Tab eventKey="orders" title="All Orders">
          {loadingOrders ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted text-center py-4">No orders found.</p>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Shipping Address</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.username || `User #${order.userId}`}</td>
                    <td>Rs.{(order.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <Badge bg={orderStatusVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td>
                      <small>{order.shippingAddress}</small>
                    </td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        <Tab eventKey="products" title="All Products">
          {loadingProducts ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted text-center py-4">No products found.</p>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.productId}</td>
                    <td>{product.name}</td>
                    <td>Rs.{(product.price || 0).toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.categoryName || '-'}</td>
                    <td>
                      <Badge bg={productStatusVariant(product.approvalStatus)}>
                        {product.approvalStatus || 'N/A'}
                      </Badge>
                    </td>
                    <td>{product.averageRating ? product.averageRating.toFixed(1) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>
    </Container>
  )
}
