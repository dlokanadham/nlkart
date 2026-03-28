import { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaShoppingBag, FaTruck, FaShieldAlt, FaHeadset } from 'react-icons/fa'
import apiClient from '../api/apiClient'
import ProductGrid from '../components/products/ProductGrid'
import { logFlow } from '../utils/logger'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    logFlow('navigation', 'page_view', { page: '/' })
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.allSettled([
        apiClient.get('/products?limit=8'),
        apiClient.get('/products/categories'),
      ])
      if (productsRes.status === 'fulfilled') {
        const data = productsRes.value.data
        setFeaturedProducts(Array.isArray(data) ? data : data.products || [])
      }
      if (categoriesRes.status === 'fulfilled') {
        setCategories(Array.isArray(categoriesRes.value.data) ? categoriesRes.value.data : [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="display-4 fw-bold mb-3">Welcome to NLKart</h1>
          <p className="lead mb-4">
            Discover amazing products at unbeatable prices. Shop the latest trends and get them delivered to your doorstep.
          </p>
          <Button as={Link} to="/products" variant="light" size="lg" className="px-5">
            <FaShoppingBag className="me-2" />
            Shop Now
          </Button>
        </Container>
      </section>

      {/* Features */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="text-center g-4">
            <Col md={3}>
              <FaTruck size={40} className="text-primary mb-3" />
              <h5>Free Shipping</h5>
              <p className="text-muted small">On orders over $50</p>
            </Col>
            <Col md={3}>
              <FaShieldAlt size={40} className="text-primary mb-3" />
              <h5>Secure Payment</h5>
              <p className="text-muted small">100% secure transactions</p>
            </Col>
            <Col md={3}>
              <FaHeadset size={40} className="text-primary mb-3" />
              <h5>24/7 Support</h5>
              <p className="text-muted small">Dedicated customer service</p>
            </Col>
            <Col md={3}>
              <FaShoppingBag size={40} className="text-primary mb-3" />
              <h5>Easy Returns</h5>
              <p className="text-muted small">30-day return policy</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-5">
          <Container>
            <h2 className="text-center mb-4">Shop by Category</h2>
            <Row className="g-3 justify-content-center">
              {categories.map((cat) => (
                <Col key={cat.id} xs={6} sm={4} md={3} lg={2}>
                  <Card
                    as={Link}
                    to={`/products?category=${cat.id}`}
                    className="category-card text-center text-decoration-none h-100"
                  >
                    <Card.Body>
                      <Card.Title className="fs-6 mb-0">{cat.name}</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-5 bg-white">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Featured Products</h2>
            <Button as={Link} to="/products" variant="outline-primary">
              View All
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}
        </Container>
      </section>
    </>
  )
}
