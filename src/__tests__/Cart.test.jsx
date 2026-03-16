import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Cart from '../pages/Cart'

// Mock apiClient
vi.mock('../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import apiClient from '../api/apiClient'

function renderCart() {
  return render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Cart', () => {
  it('shows empty cart message when there are no items', async () => {
    apiClient.get.mockResolvedValue({ data: [] })
    renderCart()
    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    })
  })

  it('renders cart items with product names', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        { cartItemId: 1, productId: 10, productName: 'Laptop', productPrice: 50000, quantity: 1, productImage: null },
        { cartItemId: 2, productId: 11, productName: 'Mouse', productPrice: 500, quantity: 2, productImage: null },
      ],
    })
    renderCart()
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument()
      expect(screen.getByText('Mouse')).toBeInTheDocument()
    })
  })

  it('calculates and displays the correct total', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        { cartItemId: 1, productId: 10, productName: 'Laptop', productPrice: 50000, quantity: 1, productImage: null },
        { cartItemId: 2, productId: 11, productName: 'Mouse', productPrice: 500, quantity: 2, productImage: null },
      ],
    })
    renderCart()
    // Total = 50000*1 + 500*2 = 51000.00
    await waitFor(() => {
      const totals = screen.getAllByText(/₹51,?000\.00/)
      expect(totals.length).toBeGreaterThan(0)
    })
  })

  it('shows error message when API call fails', async () => {
    apiClient.get.mockRejectedValue(new Error('Network error'))
    renderCart()
    await waitFor(() => {
      expect(screen.getByText('Failed to load cart')).toBeInTheDocument()
    })
  })
})
