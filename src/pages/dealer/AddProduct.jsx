import { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../api/apiClient'

export default function AddProduct() {
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    imageUrl: '',
    stock: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await apiClient.get('/categories')
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch {
      // ignore
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
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
      await apiClient.post('/dealer/products', payload)
      navigate('/dealer/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4">Add New Product</h2>
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
                    placeholder="Enter product name"
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
                    placeholder="Describe your product"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Original Price ($) <small className="text-muted">(optional)</small></Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        placeholder="0.00"
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
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                        placeholder="0"
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

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Product'}
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
