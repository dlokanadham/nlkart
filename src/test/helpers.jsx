import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

/**
 * Render a component wrapped with MemoryRouter and AuthContext.
 */
export function renderWithProviders(
  ui,
  {
    authValue = {
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(() => false),
    },
    route = '/',
    ...renderOptions
  } = {}
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={authValue}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
    renderOptions
  )
}

/** Build a mock auth value for a given role. */
export function mockAuthForRole(role, username = 'testuser') {
  const user = { username, roleName: role }
  const hasRole = vi.fn((r) => {
    if (Array.isArray(r)) return r.includes(role)
    return r === role
  })
  return {
    user,
    token: 'fake-token',
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    hasRole,
  }
}
