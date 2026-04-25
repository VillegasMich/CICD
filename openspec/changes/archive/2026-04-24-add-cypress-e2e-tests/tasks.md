## 1. Setup Cypress

- [x] 1.1 Install `cypress` and `start-server-and-test` as devDependencies in `frontend/package.json`
- [x] 1.2 Create `frontend/cypress.config.js` with `baseUrl: http://localhost:5173` and `specPattern: e2e/**/*.cy.js`
- [x] 1.3 Add `"cy:run": "cypress run"` and `"cy:open": "cypress open"` scripts to `frontend/package.json`
- [x] 1.4 Create `frontend/e2e/` directory and add a `.gitkeep` or the first test file

## 2. Auth Tests

- [x] 2.1 Create `frontend/e2e/auth.cy.js` with a test for successful login (valid credentials → redirect to bicycles page)
- [x] 2.2 Add a test for failed login (wrong password → error message visible, stays on login page)

## 3. Bicycle Tests

- [x] 3.1 Create `frontend/e2e/bicycles.cy.js` with a test that verifies the bicycle list is displayed after login
- [x] 3.2 Add a test that clicks a bicycle entry and verifies navigation to the detail page

## 4. Rental Tests

- [x] 4.1 Create `frontend/e2e/rentals.cy.js` with a test that verifies the rentals page loads without errors for an authenticated user

## 5. CI Integration

- [x] 5.1 Add a backend startup step to `ci_fe.yml` (install Python deps and start FastAPI with `uvicorn` in the background)
- [x] 5.2 Add a Cypress e2e step to `ci_fe.yml` using `start-server-and-test` to start the Vite dev server and run `cypress run`
- [x] 5.3 Add Cypress binary caching (`~/.cache/Cypress`) to `ci_fe.yml` to avoid re-downloading on every run
