# nlkart - React E-Commerce Frontend

A full-featured multi-role e-commerce frontend built with React 18, Bootstrap 5, and Vite. Part of the nlkart e-commerce platform.

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| React Router | 6.26.0 | Client-side routing |
| React Bootstrap | 2.10.4 | UI component library |
| Bootstrap | 5.3.3 | CSS framework |
| Axios | 1.7.2 | HTTP client |
| React Icons | 5.3.0 | Icon library (FontAwesome) |
| Vite | 5.4.0 | Build tool & dev server |
| Vitest | 2.1.8 | Unit testing framework |
| Testing Library | 16.1.0 | React component testing |

## Features

### User Roles (5 Roles)

| Role | Access |
|------|--------|
| **EndUser** | Browse products, manage cart, place orders, write reviews, manage wallet |
| **Dealer** | Create/edit products, view own product stats and approval status |
| **Reviewer** | Approve/reject pending products submitted by dealers |
| **Administrator** | User management (CRUD), run utilities (ratings, offers, notifications), dashboard stats |
| **SupportAgent** | View all orders and products in read-only mode |

### Core Features

- **Product Catalog** — Browse, search, filter by category, sort by price/name/rating with pagination
- **Product Details** — Full product info with images, reviews, star ratings, add to cart
- **Shopping Cart** — Add/remove items, update quantities, view order summary
- **Checkout** — Shipping address form with wallet-based payment
- **Order History** — View past orders with accordion-style details
- **Wallet System** — View balance, quick recharge (Rs.500 - Rs.50,000), transaction history
- **Product Reviews** — Submit 1-5 star ratings with comments (one review per user per product)
- **Notifications** — Real-time notification bell with unread count, mark as read
- **User Registration** — Self-service EndUser account creation

### Dealer Workflow

1. Dealer creates a new product → Status: **Pending**
2. Reviewer approves or rejects → Status: **Approved** / **Rejected**
3. Approved products become visible on the storefront
4. Dealer gets notifications on approval/rejection
5. Dealer can edit rejected products and resubmit

### Admin Dashboard

- **Stats Cards** — Total users, dealers, end users, reviewers count
- **Run Utilities** — Styled 2x2 grid with colored icon cards:
  - Calculate Ratings (Bayesian algorithm)
  - Run Offers (discount matching)
  - Send Notifications (event-based alerts)
  - Run All (executes all three)
- Each utility shows result/error with loading spinner

### Client-Side Event Logging

All user actions are logged to `localStorage` for analytics:

```javascript
// Log format
{
  timestamp: "2026-03-17T10:30:00.000Z",
  level: "info",          // error | warn | info | flow
  category: "product",    // auth | product | cart | order | navigation
  action: "product_view", // specific action name
  data: { productId: 1, name: "Laptop", category: "Electronics" },
  sessionId: "sess_abc123",
  userId: "user_101"
}
```

**Logged Actions:** `page_view`, `product_view`, `product_list_view`, `add_to_cart`, `order_placed`, `search`, `category_filter`, `quantity_change`, `item_remove`, `recharge_success`, etc.

**Export:** Users can export logs as JSON via the navbar dropdown → "Export Logs" button. These logs can be imported into **nlkart-trend-analyzer** for visualization.

## Project Structure

```
nlkart/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies & scripts
├── vite.config.js                      # Vite config (port 5174, API proxy)
│
├── src/
│   ├── main.jsx                        # React root render
│   ├── App.jsx                         # Router setup & route definitions
│   ├── index.css                       # Global styles
│   │
│   ├── api/
│   │   └── apiClient.js                # Axios instance with auth interceptors
│   │
│   ├── context/
│   │   └── AuthContext.jsx             # Global auth state (login/logout/register)
│   │
│   ├── hooks/
│   │   └── useAuth.js                  # Hook to access AuthContext
│   │
│   ├── utils/
│   │   └── logger.js                   # localStorage-based event logging
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx              # Top nav with cart badge, notifications, export logs
│   │   │   ├── Footer.jsx              # Site footer
│   │   │   ├── ProtectedRoute.jsx      # Role-based route guard
│   │   │   └── StarRating.jsx          # 5-star rating display
│   │   ├── layout/
│   │   │   └── MainLayout.jsx          # Layout wrapper (Navbar + Outlet + Footer)
│   │   └── products/
│   │       ├── ProductCard.jsx         # Single product card
│   │       └── ProductGrid.jsx         # Grid of product cards
│   │
│   ├── pages/
│   │   ├── Home.jsx                    # Hero section, featured products
│   │   ├── Login.jsx                   # Login form with role-based redirect
│   │   ├── Register.jsx                # User registration
│   │   ├── ProductList.jsx             # Products with search/filter/sort/pagination
│   │   ├── ProductDetail.jsx           # Single product + reviews + add to cart
│   │   ├── Cart.jsx                    # Cart management
│   │   ├── Checkout.jsx                # Shipping + wallet payment
│   │   ├── OrderHistory.jsx            # Past orders
│   │   ├── Wallet.jsx                  # Balance + recharge + transactions
│   │   ├── dealer/
│   │   │   ├── DealerDashboard.jsx     # Dealer's product list with status
│   │   │   ├── AddProduct.jsx          # Create new product form
│   │   │   └── EditProduct.jsx         # Edit existing product
│   │   ├── reviewer/
│   │   │   ├── ReviewerDashboard.jsx   # Pending products queue
│   │   │   └── ReviewProduct.jsx       # Approve/reject with notes
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx      # Stats + run utilities
│   │   │   └── UserManagement.jsx      # CRUD users + toggle active
│   │   └── support/
│   │       └── SupportDashboard.jsx    # View all orders & products
│   │
│   ├── __tests__/                      # Unit tests
│   │   ├── AuthContext.test.jsx
│   │   ├── ProtectedRoute.test.jsx
│   │   ├── Login.test.jsx
│   │   ├── Cart.test.jsx
│   │   ├── ProductCard.test.jsx
│   │   ├── Navbar.test.jsx
│   │   └── Wallet.test.jsx
│   │
│   └── test/
│       ├── setup.js                    # Test environment setup (jest-dom)
│       └── helpers.jsx                 # renderWithProviders, mockAuthForRole
│
└── .gitignore
```

## Routes

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | Home | Public | Hero section, featured products, categories |
| `/login` | Login | Public | Login form with role-based redirect |
| `/register` | Register | Public | EndUser self-registration |
| `/products` | ProductList | Public | Search, filter, sort, paginate products |
| `/products/:id` | ProductDetail | Public | Product details + reviews + add to cart |
| `/cart` | Cart | EndUser | Shopping cart management |
| `/checkout` | Checkout | EndUser | Shipping address + wallet payment |
| `/orders` | OrderHistory | EndUser | Past orders in accordion view |
| `/wallet` | Wallet | EndUser | Balance, recharge, transaction history |
| `/dealer/dashboard` | DealerDashboard | Dealer | Own products with approval status |
| `/dealer/add-product` | AddProduct | Dealer | Create new product (status: Pending) |
| `/dealer/edit-product/:id` | EditProduct | Dealer | Edit product (resets to Pending) |
| `/reviewer/dashboard` | ReviewerDashboard | Reviewer | Queue of pending products |
| `/reviewer/review/:id` | ReviewProduct | Reviewer | Approve/reject with optional notes |
| `/admin/dashboard` | AdminDashboard | Administrator | User stats + run utilities |
| `/admin/users` | UserManagement | Administrator | Create/edit/toggle users |
| `/support/dashboard` | SupportDashboard | SupportAgent | View all orders & products |
| `*` | 404 | Public | Page not found |

## Authentication Flow

1. User enters username/password on `/login`
2. `AuthContext.login()` sends `POST /api/auth/login`
3. Server returns `{ token, user: { userId, username, roleName, ... } }`
4. Token + user stored in `localStorage`
5. Axios interceptor adds `Authorization: Basic {token}` to all requests
6. `ProtectedRoute` validates auth + role before rendering protected pages
7. On 401 response, token is cleared and user is redirected to `/login`

**Role-Based Redirect After Login:**
- Administrator → `/admin/dashboard`
- Dealer → `/dealer/dashboard`
- Reviewer → `/reviewer/dashboard`
- SupportAgent → `/support/dashboard`
- EndUser → `/`

## API Integration

The app communicates with **nlkart-api** (Flask backend on port 8007) via Axios:

```javascript
// apiClient.js - Centralized API client
const apiClient = axios.create({ baseURL: '/api' })

// Request interceptor: adds auth token
// Response interceptor: unwraps { success, data } envelope, handles 401
```

Vite dev server proxies `/api/*` requests to `http://localhost:8007`.

## How to Run

### Prerequisites
- Node.js 22+
- nlkart-api running on port 8007

### Install & Start
```bash
cd nlkart
npm install
npm run dev
```

App runs at: **http://localhost:5174**

### Available Scripts
| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Vite dev server (port 5174) |
| Build | `npm run build` | Production build |
| Preview | `npm run preview` | Preview production build |
| Test (watch) | `npm test` | Run tests in watch mode |
| Test (CI) | `npm run test:run` | Run tests once |

## Running Tests

```bash
# Watch mode (re-runs on file changes)
npm test

# Single run (CI mode)
npm run test:run
```

### Test Coverage — 35 tests across 7 files

| Test File | Tests | What It Tests |
|-----------|-------|---------------|
| `AuthContext.test.jsx` | 4 | Initial state, login, logout, token restoration |
| `ProtectedRoute.test.jsx` | 5 | Loading state, auth redirect, role check, content rendering |
| `Login.test.jsx` | 4 | Form rendering, register link, error handling |
| `Cart.test.jsx` | 4 | Empty cart, item rendering, total calculation, error handling |
| `ProductCard.test.jsx` | 8 | Name/price/category, discount pricing, stock status, image fallback |
| `Navbar.test.jsx` | 5 | Brand, navigation links, auth menus, cart badge |
| `Wallet.test.jsx` | 5 | Balance display, recharge, transaction history |

**Test Setup:**
- Framework: **Vitest** with **jsdom** environment
- Utilities: `@testing-library/react` + `@testing-library/user-event`
- Helpers: `renderWithProviders()` wraps components with Router + AuthContext
- All tests use mocked API — no backend needed

## Login Credentials

All accounts use password: **Testing@123**

| Username | Role | Email |
|----------|------|-------|
| admin | Administrator | admin@nlkart.com |
| dealer1 | Dealer | dealer1@nlkart.com |
| dealer2 | Dealer | dealer2@nlkart.com |
| reviewer1 | Reviewer | reviewer1@nlkart.com |
| reviewer2 | Reviewer | reviewer2@nlkart.com |
| user1 | EndUser | user1@nlkart.com |
| user2 | EndUser | user2@nlkart.com |
| user3 | EndUser | user3@nlkart.com |
| support1 | SupportAgent | support1@nlkart.com |

## Related Repositories

| Repo | Description |
|------|-------------|
| [nlkart-api](https://github.com/dlokanadham/nlkart-api) | Flask REST API backend |
| [nlkart-database](https://github.com/dlokanadham/nlkart-database) | SQL Server DACPAC project |
| [nlkart-utils](https://github.com/dlokanadham/nlkart-utils) | Python utility scripts (rating, offers, notifications) |
| [nlkart-trend-analyzer](https://github.com/dlokanadham/nlkart-trend-analyzer) | Analytics dashboard for user behavior logs |
