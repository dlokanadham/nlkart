import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

export default function StarRating({ rating = 0, size = 16, showValue = false }) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} color="#ffc107" size={size} />)
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(<FaStarHalfAlt key={i} color="#ffc107" size={size} />)
    } else {
      stars.push(<FaRegStar key={i} color="#ffc107" size={size} />)
    }
  }

  return (
    <span className="d-inline-flex align-items-center gap-1">
      {stars}
      {showValue && <small className="text-muted ms-1">({rating.toFixed(1)})</small>}
    </span>
  )
}
