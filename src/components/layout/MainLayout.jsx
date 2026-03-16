import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'

export default function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
