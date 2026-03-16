import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Navbar from '../components/common/Navbar'
import { renderWithProviders, mockAuthForRole } from '../test/helpers'

// Mock apiClient to prevent real API calls in useEffect
vi.mock('../api/apiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

describe('Navbar', () => {
  it('shows Login and Register links when not authenticated', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('shows Dealer dropdown for dealer role', () => {
    renderWithProviders(<Navbar />, { authValue: mockAuthForRole('Dealer') })
    expect(screen.getByText('Dealer')).toBeInTheDocument()
  })

  it('shows Review Queue link for reviewer role', () => {
    renderWithProviders(<Navbar />, { authValue: mockAuthForRole('Reviewer') })
    expect(screen.getByText('Review Queue')).toBeInTheDocument()
  })

  it('shows Admin dropdown for administrator role', () => {
    renderWithProviders(<Navbar />, { authValue: mockAuthForRole('Administrator') })
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('does not show Dealer menu for EndUser role', () => {
    renderWithProviders(<Navbar />, { authValue: mockAuthForRole('EndUser') })
    expect(screen.queryByText('Dealer')).not.toBeInTheDocument()
  })

  it('shows username when authenticated', () => {
    renderWithProviders(<Navbar />, {
      authValue: mockAuthForRole('EndUser', 'johndoe'),
    })
    expect(screen.getByText('johndoe')).toBeInTheDocument()
  })
})
