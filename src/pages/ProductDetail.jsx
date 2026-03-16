import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap'
import { FaShoppingCart } from 'react-icons/fa'
import apiClient from '../api/apiClient'
import useAuth from '../hooks/useAuth'
import StarRating from '../components/common/StarRating'
import { logFlow, logInfo } from '../utils/logger'

export default function ProductDetail() {
  const { id } = useParams()
  const { isAuthenticated, hasRole } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [cartMsg, setCartMsg] = useState('')
  const [cartError, setCartError] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewMsg, setReviewMsg] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    loadProduct()
    loadReviews()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`/products/${id}`)
      setProduct(res.data)
      logFlow('product', 'product_view', { productId: parseInt(id), name: res.data.name, category: res.data.categoryName })
    } catch {
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const res = await apiClient.get(`/reviews/${id}`)
      setReviews(Array.isArray(res.data) ? res.data : res.data.reviews || [])
    } catch {
      // ignore
    }
  }

  const addToCart = async () => {
    logInfo('cart', 'add_to_cart', { productId: parseInt(id), name: product?.name, quantity })
    setCartMsg('')
    setCartError('')
    try {
      await apiClient.post('/cart', { productId: parseInt(id), quantity })
      setCartMsg('Added to cart!')
      setTimeout(() => setCartMsg(''), 3000)
    } catch (err) {
      setCartError(err.response?.data?.message || err.response?.data?.error || 'Failed to add to cart')
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setReviewMsg('')
    setReviewError('')
    setSubmittingReview(true)
    try {
      await apiClient.post(`/reviews/${id}`, {
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment,
      })
      setReviewMsg('Review submitted successfully!')
      setReviewForm({ rating: 5, comment: '' })
      loadReviews()
    } catch (err) {
      setReviewError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
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

  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  return (
    <Container className="py-4">
      <Row className="g-4">
        {/* Product Image */}
        <Col md={5}>
          <img
            src={product.imageUrl || 'https://via.placeholder.com/500x400?text=No+Image'}
            alt={product.name}
            className="img-fluid rounded shadow-sm"
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x400?text=No+Image'
            }}
          />
        </Col>

        {/* Product Info */}
        <Col md={7}>
          <h1 className="h2 mb-2">{product.name}</h1>
          {product.categoryName && (
            <Badge bg="secondary" className="mb-2">{product.categoryName}</Badge>
          )}
          <div className="mb-3">
            <StarRating rating={product.averageRating || 0} size={20} showValue />
            <small className="text-muted ms-2">({reviews.length} reviews)</small>
          </div>

          <div className="mb-3">
            {hasDiscount ? (
              <>
                <span className="original-price fs-5 me-2">${product.originalPrice.toFixed(2)}</span>
                <span className="discount-price fs-3">${product.price.toFixed(2)}</span>
                <Badge bg="danger" className="ms-2">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </Badge>
              </>
            ) : (
              <span className="fs-3 fw-bold text-primary">${product.price?.toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted mb-3">{product.description}</p>

          <p className="mb-3">
            <strong>Availability: </strong>
            {product.stock > 0 ? (
              <span className="text-success">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-danger">Out of Stock</span>
            )}
          </p>

          {/* Add to Cart */}
          {isAuthenticated && hasRole('EndUser') && product.stock > 0 && (
            <div className="d-flex align-items-center gap-3 mb-3">
              <Form.Control
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                style={{ width: '80px' }}
              />
              <Button variant="primary" onClick={addToCart}>
                <FaShoppingCart className="me-2" />
                Add to Cart
              </Button>
            </div>
          )}
          {cartMsg && <Alert variant="success" className="mt-2">{cartMsg}</Alert>}
          {cartError && <Alert variant="danger" className="mt-2">{cartError}</Alert>}
        </Col>
      </Row>

      {/* Reviews Section */}
      <Row className="mt-5">
        <Col>
          <h3 className="mb-4">Customer Reviews</h3>

          {/* Write Review Form */}
          {isAuthenticated && hasRole('EndUser') && (
            <Card className="mb-4">
              <Card.Body>
                <h5>Write a Review</h5>
                {reviewMsg && <Alert variant="success">{reviewMsg}</Alert>}
                {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                <Form onSubmit={submitReview}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    <Form.Select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))}
                    >
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Good</option>
                      <option value="3">3 Stars - Average</option>
                      <option value="2">2 Stars - Below Average</option>
                      <option value="1">1 Star - Poor</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="mb-3 review-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong>{review.username || review.userName || 'Anonymous'}</strong>
                      <div>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                    </div>
                    <small className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <p className="mb-0">{review.comment}</p>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  )
}
