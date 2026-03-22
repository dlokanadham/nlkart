# nlkart — React Frontend

## Overview
E-commerce frontend for nlkart (Next Level Kart). Users can browse products, add to cart, place orders using wallet balance, and write reviews.

## Tech Stack
- Vite + React 18 (JavaScript — NO TypeScript)
- Bootstrap 5 + React-Bootstrap (NOT Tailwind, NOT raw HTML bootstrap)
- React Router v6 for navigation
- Axios for API calls via `src/api/apiClient.js`
- Vitest + React Testing Library for tests
- react-icons/fa for all icons

## File Structure Rules
- Pages: `src/pages/` (subdirs per role: admin/, dealer/, reviewer/, support/)
- Reusable components: `src/components/common/`
- API client: `src/api/apiClient.js` (Axios instance with auth interceptor — ALL API calls go through this)
- Context providers: `src/context/`
- Tests: `src/__tests__/ComponentName.test.jsx`
- Utilities: `src/utils/` (e.g., logger.js)

## Conventions
- File naming: PascalCase for components (e.g., `ProductCard.jsx`)
- Use `const` + arrow functions for components (NO class components)
- Role-based routing via `<ProtectedRoute roles={['RoleName']}>`
- Available roles: Administrator, Dealer, Reviewer, EndUser, SupportAgent
- User object in localStorage has `roleName` field (NOT `role`)
- User ID field is `userId` (NOT `id`)

## Do's and Don'ts
- ALWAYS use React-Bootstrap components, NOT raw HTML bootstrap classes
- ALWAYS use `apiClient` for API calls, NEVER use raw `axios` or `fetch`
- NEVER use TypeScript (.tsx) — this project uses JavaScript (.jsx)
- NEVER use Tailwind CSS — this project uses Bootstrap 5

## Testing
- Run: `npm test` (35 tests, 7 files)
- Test files: `src/__tests__/ComponentName.test.jsx`
- Uses Vitest + React Testing Library
- Mock API calls with `vi.mock('../api/apiClient')`

## Dependency: nlkart-api (Backend API)
- Base URL: http://localhost:8007
- Auth: Basic Auth — base64(username:password) in Authorization header
- All endpoints return plain JSON objects (camelCase keys)
- Endpoint pattern: GET/POST/PUT/DELETE `/api/{resource}`
- Common response fields: userId, roleName, productId, categoryName
- Error format: `{ "message": "error text" }` with HTTP status code

## Related Repos
- nlkart-api (Flask backend): `../nlkart-api`
- nlkart-database (SQL schema): `../nlkart-database`
- nlkart-utils (utility scripts): `../nlkart-utils`
- nlkart-trend-analyzer (analytics — reads logs exported from this app): `../nlkart-trend-analyzer`
