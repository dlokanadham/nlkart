import { useState, useEffect } from 'react'
import { Container, Table, Badge, Button, Spinner, Alert, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import apiClient from '../../api/apiClient'

const NO_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="#dee2e6"><rect width="50" height="50"/></svg>')

export default function ReviewerDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPending()
  }, [])

  const loadPending = async () => {
    try {
      const res = await apiClient.get('/reviewer/pending')
      setProducts(Array.isArray(res.data) ? res.data : res.data.products || [])
    } catch {
      setError('Failed to load pending products')
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
      <h2 className="mb-4">Review Queue</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body className="text-center">
          <h3 className="text-warning">{products.length}</h3>
          <small className="text-muted">Products Pending Review</small>
        </Card.Body>
      </Card>

      {products.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h5 className="text-muted">No pending products</h5>
            <p className="text-muted">All products have been reviewed. Check back later.</p>
          </Card.Body>
        </Card>
      ) : (
        <Table responsive hover className="align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Dealer</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productId}>
                <td>{product.productId}</td>
                <td>
                  <img
                    src={product.imageUrl || NO_IMG}
                    alt={product.name}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    onError={(e) => { e.target.onerror = null; e.target.src = NO_IMG }}
                  />
                </td>
                <td>{product.name}</td>
                <td>&#8377;{(product.price || 0).toFixed(2)}</td>
                <td>{product.dealerName || product.dealerUsername || '-'}</td>
                <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    as={Link}
                    to={`/reviewer/review/${product.productId}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  )
}
