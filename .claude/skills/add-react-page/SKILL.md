---
name: add-react-page
description: Create a new React page with route, navigation link, and API integration
argument-hint: <page-name> <role>
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Add React Page

Create a new React page called `$0` for the `$1` role dashboard.

## Steps

1. **Ask** for page name (if not provided), which role dashboard it belongs to, and what data it displays.

2. **Create Page Component** — `src/pages/$1/$0.jsx`
   - Use `const` + arrow function (NO class components)
   - Use React-Bootstrap components (Container, Row, Col, Card, Table, Button)
   - Use `apiClient` for API calls — NEVER raw axios or fetch
   - Use `react-icons/fa` for icons
   - Add localStorage logging via `src/utils/logger.js`

3. **Add Route** — `src/App.jsx`
   - Import the new page component
   - Add route inside `<ProtectedRoute roles={['$1']}>` wrapper
   - Use kebab-case URL path (e.g., `/wishlist`, `/order-history`)

4. **Add Navigation Link** — `src/components/common/Navbar.jsx`
   - Add nav link under the correct role section
   - Use `<Nav.Link as={Link} to="/path">`
   - Include an appropriate FaIcon

5. **Create API Integration** (if needed)
   - Add API calls using `apiClient.get()`, `apiClient.post()`, etc.
   - Handle loading, error, and empty states
   - Use `try/catch` with user-friendly error messages

6. **Verify** — Run `npm run dev` and navigate to the new page to confirm it renders.
