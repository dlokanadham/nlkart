import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'

function renderCard(product) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  )
}

describe('ProductCard', () => {
  const baseProduct = {
    productId: 1,
    name: 'Wireless Mouse',
    price: 599.99,
    imageUrl: 'https://example.com/mouse.jpg',
    categoryName: 'Electronics',
    averageRating: 4.2,
    reviewCount: 15,
  }

  it('renders product name', () => {
    renderCard(baseProduct)
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument()
  })

  it('renders price with rupee symbol', () => {
    renderCard(baseProduct)
    // ₹ is &#8377;
    expect(screen.getByText(/₹599\.99/)).toBeInTheDocument()
  })

  it('renders category name', () => {
    renderCard(baseProduct)
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('renders review count', () => {
    renderCard(baseProduct)
    expect(screen.getByText('(15)')).toBeInTheDocument()
  })

  it('shows discount pricing when originalPrice > price', () => {
    const discounted = { ...baseProduct, originalPrice: 999.00, price: 599.99 }
    renderCard(discounted)
    expect(screen.getByText(/₹999\.00/)).toBeInTheDocument()
    expect(screen.getByText(/₹599\.99/)).toBeInTheDocument()
  })

  it('shows "Out of Stock" when stock is 0', () => {
    renderCard({ ...baseProduct, stock: 0 })
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('uses fallback image when imageUrl is missing', () => {
    renderCard({ ...baseProduct, imageUrl: null })
    const img = screen.getByAltText('Wireless Mouse')
    expect(img.src).toContain('data:image/svg+xml')
  })

  it('falls back on image error', () => {
    renderCard(baseProduct)
    const img = screen.getByAltText('Wireless Mouse')
    fireEvent.error(img)
    expect(img.src).toContain('data:image/svg+xml')
  })
})
