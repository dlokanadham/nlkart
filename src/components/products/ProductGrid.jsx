import { Row, Col } from 'react-bootstrap'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted fs-5">No products found.</p>
      </div>
    )
  }

  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {products.map((product) => (
        <Col key={product.id}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  )
}
