import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import StarRating from '../common/StarRating'

const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" fill="%23dee2e6"><rect width="300" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-size="16">No Image</text></svg>')

export default function ProductCard({ product }) {
  const id = product.productId || product.id
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  return (
    <Card className="product-card h-100">
      <Link to={`/products/${id}`} className="text-decoration-none">
        <Card.Img
          variant="top"
          src={product.imageUrl || FALLBACK_IMG}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null
            e.target.src = FALLBACK_IMG
          }}
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Link to={`/products/${id}`} className="text-decoration-none text-dark">
          <Card.Title className="fs-6 mb-1">{product.name}</Card.Title>
        </Link>
        {product.categoryName && (
          <small className="text-muted mb-1">{product.categoryName}</small>
        )}
        <div className="mb-1">
          <StarRating rating={product.averageRating || 0} size={14} />
          {product.reviewCount > 0 && (
            <small className="text-muted ms-1">({product.reviewCount})</small>
          )}
        </div>
        <div className="mt-auto">
          {hasDiscount ? (
            <div>
              <span className="original-price me-2">&#8377;{product.originalPrice.toFixed(2)}</span>
              <span className="discount-price fs-5">&#8377;{product.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="fw-bold fs-5 text-primary">&#8377;{product.price?.toFixed(2)}</span>
          )}
        </div>
        {product.stock !== undefined && product.stock <= 0 && (
          <small className="text-danger mt-1">Out of Stock</small>
        )}
      </Card.Body>
    </Card>
  )
}
