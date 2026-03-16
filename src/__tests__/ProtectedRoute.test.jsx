import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import ProtectedRoute from '../components/common/ProtectedRoute'
import { renderWithProviders, mockAuthForRole } from '../test/helpers'

describe('ProtectedRoute', () => {
  it('shows loading spinner when auth is loading', () => {
    renderWithProviders(
      <ProtectedRoute><p>secret</p></ProtectedRoute>,
      {
        authValue: {
          user: null, token: null, loading: true,
          isAuthenticated: false, login: vi.fn(), register: vi.fn(),
          logout: vi.fn(), hasRole: vi.fn(),
        },
      }
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', () => {
    renderWithProviders(
      <ProtectedRoute><p>secret</p></ProtectedRoute>,
      { route: '/cart' }
    )
    // Content should not be rendered (Navigate to /login)
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('redirects to / when user lacks the required role', () => {
    const authValue = mockAuthForRole('EndUser')
    renderWithProviders(
      <ProtectedRoute roles={['Administrator']}><p>admin panel</p></ProtectedRoute>,
      { authValue }
    )
    expect(screen.queryByText('admin panel')).not.toBeInTheDocument()
  })

  it('renders children when user has the required role', () => {
    const authValue = mockAuthForRole('Dealer')
    renderWithProviders(
      <ProtectedRoute roles={['Dealer']}><p>dealer content</p></ProtectedRoute>,
      { authValue }
    )
    expect(screen.getByText('dealer content')).toBeInTheDocument()
  })

  it('renders children when no roles restriction is specified', () => {
    const authValue = mockAuthForRole('EndUser')
    renderWithProviders(
      <ProtectedRoute><p>any authenticated</p></ProtectedRoute>,
      { authValue }
    )
    expect(screen.getByText('any authenticated')).toBeInTheDocument()
  })
})
