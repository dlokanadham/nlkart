import { createContext, useState, useCallback } from 'react'
import apiClient from '../api/apiClient'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0)

  const refreshCartCount = useCallback(async () => {
    try {
      const res = await apiClient.get('/cart')
      const items = Array.isArray(res.data) ? res.data : res.data.items || []
      setCartCount(items.length)
    } catch {
      setCartCount(0)
    }
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  )
}
