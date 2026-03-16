import { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../../api/apiClient'

export default function EditProduct() {
  const { id } = useParams()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [productRes, catRes] = await Promise.all([
        apiClient.get(`/dealer/products/${id}`),
        apiClient.get('/products/categories')
      ])
      const product = productRes.data
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        categoryId: product.categoryId || '',
        imageUrl: product.imageUrl || '',
        stock: product.stock || '',
      })
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.categories || [])
    } catch {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        imageUrl: formData.imageUrl || null,
        stock: parseInt(formData.stock),
      }
      await apiClient.put(`/dealer/products/${id}`, payload)
      navigate('/dealer/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    )
  }

  if (!formData) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Product not found.</Alert>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4">Edit Product</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Original Price (₹) <small className="text-muted">(optional)</small></Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Image URL <small className="text-muted">(optional)</small></Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </Form.Group>

                <Alert variant="info" className="mb-3">
                  After updating, the product will be reset to <strong>Pending</strong> status for re-review.
                </Alert>

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Product'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/dealer/dashboard')}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
