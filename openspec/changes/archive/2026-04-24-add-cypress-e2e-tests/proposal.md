## Why

The app has no end-to-end test coverage, leaving critical user flows unverified in CI. Adding focused Cypress tests ensures that core functionality works before merges reach the develop branch.

## What Changes

- Add Cypress as a dev dependency in the frontend
- Create e2e test files under `frontend/e2e/` covering login, bicycle listing, and rental flows
- Extend `.github/workflows/ci_fe.yml` to run Cypress tests against a locally started dev server

## Capabilities

### New Capabilities
- `e2e-testing`: Cypress test suite covering authentication, bicycle browsing, and rental management flows, integrated into the frontend CI pipeline

### Modified Capabilities
- `bicycle-crud`: No requirement changes — existing CRUD behavior is tested, not modified
- `rental-management`: No requirement changes — existing rental behavior is tested, not modified

## Impact

- **Frontend**: New `cypress.config.ts` and `frontend/e2e/` test files; `cypress` added to `devDependencies`
- **CI**: `ci_fe.yml` gains a step to start the dev server and run Cypress headlessly
- **No API changes**: Tests consume the existing REST endpoints as-is
- **No breaking changes**

## Non-goals

- Visual regression testing
- Full page/component coverage
- Performance or load testing
- Backend-specific tests (covered separately)
