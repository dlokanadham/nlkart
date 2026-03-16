import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5 className="text-white">NLKart</h5>
            <p className="text-muted">
              Your one-stop destination for online shopping. Quality products at great prices.
            </p>
          </Col>
          <Col md={4} className="mb-3">
            <h5 className="text-white">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li><Link to="/products" className="text-muted text-decoration-none">Products</Link></li>
              <li><Link to="/login" className="text-muted text-decoration-none">Login</Link></li>
              <li><Link to="/register" className="text-muted text-decoration-none">Register</Link></li>
            </ul>
          </Col>
          <Col md={4} className="mb-3">
            <h5 className="text-white">Contact</h5>
            <ul className="list-unstyled text-muted">
              <li>Email: support@nlkart.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Commerce St, Tech City</li>
            </ul>
          </Col>
        </Row>
        <hr className="border-secondary" />
        <Row>
          <Col className="text-center text-muted">
            <small>&copy; {new Date().getFullYear()} NLKart. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
