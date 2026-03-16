import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, InputGroup, Spinner, Pagination } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'
import apiClient from '../api/apiClient'
import ProductGrid from '../components/products/ProductGrid'
import { logFlow, logInfo } from '../utils/logger'

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''

  useEffect(() => {
    logFlow('navigation', 'product_list_view', { page: '/products' })
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [page, search, category, sort]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async () => {
    try {
      const res = await apiClient.get('/products/categories')
      setCategories(Array.isArray(res.data) ? res.data : res.data.categories || [])
    } catch {
      // ignore
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', '12')
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (sort) params.set('sort', sort)

      const res = await apiClient.get(`/products?${params.toString()}`)
      const data = res.data
      if (Array.isArray(data)) {
        setProducts(data)
        setTotalPages(1)
      } else {
        setProducts(data.products || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    setSearchParams(params)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const query = formData.get('search')
    logInfo('product', 'search', { query })
    updateParam('search', query)
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">All Products</h2>

      {/* Filters */}
      <Row className="mb-4 g-3">
        <Col md={5}>
          <Form onSubmit={handleSearchSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                name="search"
                placeholder="Search products..."
                defaultValue={search}
              />
              <button className="btn btn-primary" type="submit">
                <FaSearch />
              </button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={3}>
          <Form.Select
            value={category}
            onChange={(e) => { logInfo('product', 'category_filter', { categoryId: e.target.value }); updateParam('category', e.target.value) }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="rating_desc">Highest Rated</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Products */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={page <= 1}
                  onClick={() => updateParam('page', String(page - 1))}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Pagination.Item
                    key={p}
                    active={p === page}
                    onClick={() => updateParam('page', String(p))}
                  >
                    {p}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={page >= totalPages}
                  onClick={() => updateParam('page', String(page + 1))}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  )
}
