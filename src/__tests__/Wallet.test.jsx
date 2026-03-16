import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Wallet from '../pages/Wallet'

// Mock apiClient
vi.mock('../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import apiClient from '../api/apiClient'

function renderWallet() {
  return render(
    <MemoryRouter>
      <Wallet />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Wallet', () => {
  it('displays wallet balance after loading', async () => {
    apiClient.get.mockResolvedValue({
      data: { balance: 2500.50, transactions: [] },
    })
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText(/₹2,?500\.50/)).toBeInTheDocument()
    })
  })

  it('renders quick recharge amount buttons', async () => {
    apiClient.get.mockResolvedValue({
      data: { balance: 0, transactions: [] },
    })
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText('Recharge Wallet')).toBeInTheDocument()
    })
    // Check for the quick amount buttons (₹500, ₹1,000, ₹2,000, ₹5,000, ₹10,000)
    expect(screen.getByText(/500/)).toBeInTheDocument()
    expect(screen.getByText(/1,000/)).toBeInTheDocument()
    expect(screen.getByText(/2,000/)).toBeInTheDocument()
    expect(screen.getByText(/5,000/)).toBeInTheDocument()
    expect(screen.getByText(/10,000/)).toBeInTheDocument()
  })

  it('shows "No transactions yet" when history is empty', async () => {
    apiClient.get.mockResolvedValue({
      data: { balance: 100, transactions: [] },
    })
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument()
    })
  })

  it('shows error when wallet fails to load', async () => {
    apiClient.get.mockRejectedValue(new Error('Network error'))
    renderWallet()
    await waitFor(() => {
      expect(screen.getByText('Failed to load wallet')).toBeInTheDocument()
    })
  })
})
