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
      setOrders(Array.isArray(res.data) ? res.data : res.data.orders || [])
    } catch {
      setError('Failed to load orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await apiClient.get('/products?limit=100')
      const data = res.data
      setProducts(Array.isArray(data) ? data : data.products || [])
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
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.username || order.customerName || '-'}</td>
                    <td>${(order.totalAmount || order.total || 0).toFixed(2)}</td>
                    <td>
                      <Badge bg={orderStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <small>{order.shippingAddress}</small>
                    </td>
                    <td>{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</td>
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
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>${(product.price || 0).toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.categoryName || '-'}</td>
                    <td>
                      <Badge bg={productStatusVariant(product.status)}>
                        {product.status || 'N/A'}
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
