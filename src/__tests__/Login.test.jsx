import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login'
import { renderWithProviders } from '../test/helpers'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('Login', () => {
  it('renders the login form with username and password fields', () => {
    renderWithProviders(<Login />)
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('renders link to register page', () => {
    renderWithProviders(<Login />)
    expect(screen.getByText('Register here')).toBeInTheDocument()
  })

  it('shows error message when login fails', async () => {
    const user = userEvent.setup()
    const loginMock = vi.fn().mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })
    renderWithProviders(<Login />, {
      authValue: {
        user: null, token: null, loading: false,
        isAuthenticated: false, login: loginMock, register: vi.fn(),
        logout: vi.fn(), hasRole: vi.fn(),
      },
    })

    await user.type(screen.getByPlaceholderText('Enter username'), 'wrong')
    await user.type(screen.getByPlaceholderText('Enter password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('shows generic error when no message from server', async () => {
    const user = userEvent.setup()
    const loginMock = vi.fn().mockRejectedValue({ response: { data: {} } })
    renderWithProviders(<Login />, {
      authValue: {
        user: null, token: null, loading: false,
        isAuthenticated: false, login: loginMock, register: vi.fn(),
        logout: vi.fn(), hasRole: vi.fn(),
      },
    })

    await user.type(screen.getByPlaceholderText('Enter username'), 'x')
    await user.type(screen.getByPlaceholderText('Enter password'), 'x')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please check your credentials.')).toBeInTheDocument()
    })
  })
})
