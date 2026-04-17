## Why

The `Rental` model exists in the database but there is no API or UI to start, complete, or list rentals. Without this, the app cannot fulfill its core purpose of renting bicycles.

## What Changes

- Add REST endpoints for rental lifecycle: start a rental, complete a rental, list all rentals
- Automatically sync bicycle status (`available` ↔ `rented`) when a rental starts or ends
- Add a bicycle detail page in the React frontend with a "Rent" action available when the bicycle is `available`
- Add a Rentals page in the React frontend to list active/completed rentals and complete them

## Capabilities

### New Capabilities
- `rental-management`: REST endpoints and UI for creating, completing, and listing rentals; enforces business rules (cannot rent an unavailable bicycle, cannot complete an already-completed rental)

### Modified Capabilities
- `bicycle-crud`: bicycle `status` field is now also driven by the rental lifecycle — creating a rental sets status to `rented`, completing a rental sets it back to `available`

## Impact

- New files: `app/routers/rentals.py`, `app/services/rental.py`, `app/schemas/rental.py`
- New files: `frontend/src/pages/RentalsPage.jsx`, `frontend/src/pages/BicycleDetailPage.jsx`, `frontend/src/api/rentals.js`
- `frontend/src/api/bicycles.js` adds `fetchBicycle(id)`
- `frontend/src/App.jsx` registers `/bicycles/:id` route and "Rentals" nav link
- `main.py` registers new rentals router at `/api/v1/rentals`
- No breaking changes to existing bicycle endpoints

## Non-goals

- User authentication and authorization (rentals will not be scoped to a logged-in user yet)
- Payment processing
- Rental history per user
