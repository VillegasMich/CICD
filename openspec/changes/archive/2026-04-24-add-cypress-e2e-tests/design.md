## Context

The frontend is a React SPA (Vite) with JWT-based auth and a proxy to the FastAPI backend at `/api`. Existing pages: `LoginPage`, `RegisterPage`, `BicyclesPage`, `BicycleDetailPage`, `RentalsPage`. There are no e2e tests today; CI only runs `npm install` without any test step.

## Goals / Non-Goals

**Goals:**
- Install Cypress and configure it for the Vite dev server
- Cover the three critical flows: authentication, bicycle listing, and rental management
- Run tests headlessly in CI using `cypress run`

**Non-Goals:**
- Component-level or unit tests
- Visual/snapshot regression
- Cross-browser matrix (Chrome only in CI)
- Stubbing the backend — tests will use a real running server

## Decisions

### 1. Cypress over Playwright
Cypress is simpler to configure for a Vite+React setup and has better community patterns for JWT-based auth testing. Playwright is more powerful but overkill for a focused, small suite.

### 2. Test against the dev server, not a build
`vite dev` starts faster in CI than `vite build + preview` and avoids build failures blocking e2e. The `start-server-and-test` package starts the server and waits for it before running Cypress.

### 3. No backend mock — real API
Tests will hit the real FastAPI backend. CI must start the backend before the frontend. A seeded test user (`test@test.com / test1234`) will be created via a `cy.request()` `beforeEach` or a dedicated fixture, not via UI, to keep tests fast.

### 4. Test file structure under `frontend/e2e/`
```
frontend/
  e2e/
    auth.cy.js         — login / logout / register
    bicycles.cy.js     — list, view detail
    rentals.cy.js      — create and view rentals
  cypress.config.js
```
`baseUrl` points to `http://localhost:5173`.

### 5. CI step order in `ci_fe.yml`
```
install deps → start backend → start frontend (background) → cypress run → stop servers
```
`start-server-and-test` handles the wait-for-ready logic so no manual `sleep` is needed.

## Risks / Trade-offs

- **Flaky tests due to timing** → Use `cy.intercept()` to wait on API responses rather than arbitrary timeouts
- **Backend not available in CI** → CI workflow must start FastAPI before Cypress; if the backend job is separate this requires `needs:` dependency or service containers
- **Test data state** → Tests that mutate data (create rental) may interfere with listing tests; mitigate by using unique test data or cleaning up in `afterEach`
- **Cypress install size (~300 MB)** → Cache `~/.cache/Cypress` in CI to avoid re-downloading on every run
