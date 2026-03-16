import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap'
import { FaCheck, FaTimes } from 'react-icons/fa'
import apiClient from '../../api/apiClient'

export default function ReviewProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProduct()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    try {
      const res = await apiClient.get(`/products/${id}`)
      setProduct(res.data)
    } catch {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action) => {
    setError('')
    setSubmitting(true)
    try {
      await apiClient.post(`/reviewer/${action}/${id}`, { notes })
      navigate('/reviewer/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || `Failed to ${action} product`)
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

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Product not found.</Alert>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Review Product</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <img
              src={product.imageUrl || 'https://via.placeholder.com/500x400?text=No+Image'}
              alt={product.name}
              className="card-img-top"
              style={{ maxHeight: 400, objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x400?text=No+Image'
              }}
            />
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <h3>{product.name}</h3>
              <Badge bg="warning" className="mb-3">Pending Review</Badge>
              <p><strong>Price:</strong> ${(product.price || 0).toFixed(2)}</p>
              {product.originalPrice && product.originalPrice !== product.price && (
                <p><strong>Original Price:</strong> ${product.originalPrice.toFixed(2)}</p>
              )}
              <p><strong>Stock:</strong> {product.stock}</p>
              <p><strong>Category:</strong> {product.categoryName || '-'}</p>
              <p><strong>Description:</strong></p>
              <p className="text-muted">{product.description}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h5 className="mb-3">Review Decision</h5>
              <Form.Group className="mb-3">
                <Form.Label>Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add review notes..."
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  onClick={() => handleAction('approve')}
                  disabled={submitting}
                  className="flex-fill"
                >
                  <FaCheck className="me-2" />
                  {submitting ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleAction('reject')}
                  disabled={submitting}
                  className="flex-fill"
                >
                  <FaTimes className="me-2" />
                  {submitting ? 'Processing...' : 'Reject'}
                </Button>
              </div>
              <Button
                variant="outline-secondary"
                className="w-100 mt-2"
                onClick={() => navigate('/reviewer/dashboard')}
              >
                Back to Queue
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
