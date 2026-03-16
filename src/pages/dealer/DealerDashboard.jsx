import { useState, useEffect } from 'react'
import { Container, Table, Badge, Button, Spinner, Alert, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaPlus, FaEdit } from 'react-icons/fa'
import apiClient from '../../api/apiClient'

const NO_IMG = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="#dee2e6"><rect width="50" height="50"/></svg>')

const statusVariant = (status) => {
  const map = {
    Approved: 'success',
    Pending: 'warning',
    Rejected: 'danger',
  }
  return map[status] || 'secondary'
}

export default function DealerDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await apiClient.get('/dealer/products')
      setProducts(Array.isArray(res.data) ? res.data : res.data.products || [])
    } catch {
      setError('Failed to load products')
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dealer Dashboard</h2>
        <Button as={Link} to="/dealer/add-product" variant="primary">
          <FaPlus className="me-2" />
          Add Product
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats Cards */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Card className="flex-fill">
          <Card.Body className="text-center">
            <h3 className="text-primary">{products.length}</h3>
            <small className="text-muted">Total Products</small>
          </Card.Body>
        </Card>
        <Card className="flex-fill">
          <Card.Body className="text-center">
            <h3 className="text-success">{products.filter((p) => p.approvalStatus === 'Approved').length}</h3>
            <small className="text-muted">Approved</small>
          </Card.Body>
        </Card>
        <Card className="flex-fill">
          <Card.Body className="text-center">
            <h3 className="text-warning">{products.filter((p) => p.approvalStatus === 'Pending').length}</h3>
            <small className="text-muted">Pending</small>
          </Card.Body>
        </Card>
        <Card className="flex-fill">
          <Card.Body className="text-center">
            <h3 className="text-danger">{products.filter((p) => p.approvalStatus === 'Rejected').length}</h3>
            <small className="text-muted">Rejected</small>
          </Card.Body>
        </Card>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h5 className="text-muted">No products yet</h5>
            <p className="text-muted">Start by adding your first product.</p>
            <Button as={Link} to="/dealer/add-product" variant="primary">
              Add Product
            </Button>
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
              <th>Stock</th>
              <th>Status</th>
              <th>Reviewer Notes</th>
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
                <td>{product.stock}</td>
                <td>
                  <Badge bg={statusVariant(product.approvalStatus)} className="status-badge">
                    {product.approvalStatus}
                  </Badge>
                </td>
                <td>
                  <small className="text-muted">{product.reviewerNotes || '-'}</small>
                </td>
                <td>
                  {(product.approvalStatus === 'Pending' || product.approvalStatus === 'Rejected') && (
                    <Button
                      as={Link}
                      to={`/dealer/edit-product/${product.productId}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      <FaEdit className="me-1" />Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  )
}
