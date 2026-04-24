## 1. Backend — Schemas

- [x] 1.1 Create `app/schemas/rental.py` with `RentalCreate` (`bicycle_id`, `user_id`) and `RentalResponse` (`id`, `bicycle_id`, `user_id`, `start_time`, `end_time`, `status`) Pydantic models
- [x] 1.2 Export new schemas from `app/schemas/__init__.py`

## 2. Backend — Service

- [x] 2.1 Create `app/services/rental.py` with `get_all` async function
- [x] 2.2 Add `create` function: fetch bicycle, check `status == available` (400 if not), set bicycle to `rented`, create rental with `start_time=now` and `status=active`
- [x] 2.3 Add `complete` function: fetch rental (404 if missing), check `status == active` (400 if already completed), set `end_time=now` and `status=completed`, set bicycle to `available`

## 3. Backend — Router

- [x] 3.1 Create `app/routers/rentals.py` with `GET /`, `POST /`, and `PUT /{id}/complete` endpoints
- [x] 3.2 Add `TODO` comment on write endpoints marking where auth guard goes
- [x] 3.3 Register the router in `main.py` with prefix `/api/v1/rentals`

## 4. Backend — Verification

- [x] 4.1 Start the backend and verify all rental endpoints respond correctly via `http://localhost:8000/docs`

## 5. Frontend — API Client

- [x] 5.1 Create `frontend/src/api/rentals.js` with `fetchRentals`, `createRental`, `completeRental` functions
- [x] 5.2 Add `fetchBicycle(id)` to `frontend/src/api/bicycles.js`

## 6. Frontend — Bicycle Detail Page (rental entry point)

- [x] 6.1 Create `frontend/src/pages/BicycleDetailPage.jsx` that fetches a bicycle by URL `:id` and shows brand, type, status
- [x] 6.2 Add "Rent this bicycle" button visible only when `status == available`
- [x] 6.3 On click, open a modal with a disabled `bicycle_id` field (auto-filled from URL) and an editable `user_id` input
- [x] 6.4 On submit, call `createRental` and redirect to `/rentals`
- [x] 6.5 Add "View" link on each `BicyclesPage` row pointing to `/bicycles/:id`

## 7. Frontend — Rentals Page

- [x] 7.1 Create `frontend/src/pages/RentalsPage.jsx` with a table showing all rentals (id, bicycle id, user id, start time, end time, status)
- [x] 7.2 Add "Complete" button on each row with `status == active`; re-fetch the list after complete
- [x] 7.3 Link `bicycle_id` cells to `/bicycles/:id` and show a pointer to the inventory for starting rentals
- [x] 7.4 Style the page following the same card/table/modal pattern as BicyclesPage

## 8. Frontend — Routing

- [x] 8.1 Add `/rentals` and `/bicycles/:id` routes in `App.jsx`
- [x] 8.2 Add "Rentals" nav link in the navbar

## 9. Frontend — Verification

- [x] 9.1 Start the frontend and test the full flow: view a bicycle, rent it from its detail page, complete the rental from `/rentals`
