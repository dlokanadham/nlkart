import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthContext, AuthProvider } from '../context/AuthContext'
import { useContext } from 'react'

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

// Helper component that exposes auth context via UI
function AuthConsumer() {
  const auth = useContext(AuthContext)
  return (
    <div>
      <span data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</span>
      <span data-testid="token">{auth.token || 'null'}</span>
      <span data-testid="isAuth">{String(auth.isAuthenticated)}</span>
      <button data-testid="login-btn" onClick={() => auth.login('admin', 'pass123')}>Login</button>
      <button data-testid="logout-btn" onClick={auth.logout}>Logout</button>
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  // Default: no token in storage, so /auth/me won't be called
  apiClient.get.mockRejectedValue(new Error('not called'))
})

describe('AuthContext', () => {
  it('starts with null user and token when storage is empty', async () => {
    apiClient.get.mockRejectedValue(new Error('no token'))
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('isAuth')).toHaveTextContent('false')
  })

  it('login sets user, token, and updates localStorage', async () => {
    const mockUser = { username: 'admin', roleName: 'Administrator' }
    apiClient.post.mockResolvedValue({
      data: { token: 'tok123', user: mockUser },
    })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await act(async () => {
      await userEvent.click(screen.getByTestId('login-btn'))
    })

    expect(screen.getByTestId('isAuth')).toHaveTextContent('true')
    expect(screen.getByTestId('token')).toHaveTextContent('tok123')
    expect(screen.getByTestId('user')).toHaveTextContent('admin')
    expect(localStorage.getItem('token')).toBe('tok123')
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser)
  })

  it('logout clears user, token, and localStorage', async () => {
    const mockUser = { username: 'admin', roleName: 'Administrator' }
    apiClient.post.mockResolvedValue({
      data: { token: 'tok123', user: mockUser },
    })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    // Login first
    await act(async () => {
      await userEvent.click(screen.getByTestId('login-btn'))
    })
    expect(screen.getByTestId('isAuth')).toHaveTextContent('true')

    // Then logout
    await act(async () => {
      await userEvent.click(screen.getByTestId('logout-btn'))
    })

    expect(screen.getByTestId('isAuth')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('restores token from localStorage on mount and fetches /auth/me', async () => {
    localStorage.setItem('token', 'saved-tok')
    localStorage.setItem('user', JSON.stringify({ username: 'bob' }))
    const freshUser = { username: 'bob', roleName: 'EndUser' }
    apiClient.get.mockResolvedValue({ data: freshUser })

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      )
    })

    expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    expect(screen.getByTestId('user')).toHaveTextContent('bob')
  })
})
