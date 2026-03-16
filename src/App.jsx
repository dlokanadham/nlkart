import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'

// EndUser pages
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderHistory from './pages/OrderHistory'

// Dealer pages
import DealerDashboard from './pages/dealer/DealerDashboard'
import AddProduct from './pages/dealer/AddProduct'

// Reviewer pages
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard'
import ReviewProduct from './pages/reviewer/ReviewProduct'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'

// Support pages
import SupportDashboard from './pages/support/SupportDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* EndUser routes */}
            <Route path="/cart" element={
              <ProtectedRoute roles={['EndUser']}>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute roles={['EndUser']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute roles={['EndUser']}>
                <OrderHistory />
              </ProtectedRoute>
            } />

            {/* Dealer routes */}
            <Route path="/dealer/dashboard" element={
              <ProtectedRoute roles={['Dealer']}>
                <DealerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dealer/add-product" element={
              <ProtectedRoute roles={['Dealer']}>
                <AddProduct />
              </ProtectedRoute>
            } />

            {/* Reviewer routes */}
            <Route path="/reviewer/dashboard" element={
              <ProtectedRoute roles={['Reviewer']}>
                <ReviewerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reviewer/review/:id" element={
              <ProtectedRoute roles={['Reviewer']}>
                <ReviewProduct />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['Administrator']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['Administrator']}>
                <UserManagement />
              </ProtectedRoute>
            } />

            {/* Support routes */}
            <Route path="/support/dashboard" element={
              <ProtectedRoute roles={['SupportAgent']}>
                <SupportDashboard />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={
              <div className="text-center py-5">
                <h1>404</h1>
                <p>Page not found</p>
              </div>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
