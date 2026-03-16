import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import StarRating from '../common/StarRating'

export default function ProductCard({ product }) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  return (
    <Card className="product-card h-100">
      <Link to={`/products/${product.id}`} className="text-decoration-none">
        <Card.Img
          variant="top"
          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
          }}
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
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
              <span className="original-price me-2">${product.originalPrice.toFixed(2)}</span>
              <span className="discount-price fs-5">${product.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="fw-bold fs-5 text-primary">${product.price?.toFixed(2)}</span>
          )}
        </div>
        {product.stock !== undefined && product.stock <= 0 && (
          <small className="text-danger mt-1">Out of Stock</small>
        )}
      </Card.Body>
    </Card>
  )
}
