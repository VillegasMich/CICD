## 1. Backend — Schemas

- [x] 1.1 Create `app/schemas/bicycle.py` with `BicycleCreate`, `BicycleUpdate`, and `BicycleResponse` Pydantic models
- [x] 1.2 Create `app/schemas/__init__.py`

## 2. Backend — Service

- [x] 2.1 Create `app/services/bicycle.py` with `get_all`, `get_by_id`, `create`, `update`, `delete` async functions
- [x] 2.2 Add guard in `delete`: raise `400` if bicycle has an active rental (status check on `Rental` table)

## 3. Backend — Router

- [x] 3.1 Create `app/routers/bicycles.py` with all five endpoints (`GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`)
- [x] 3.2 Add `TODO` comment on write endpoints marking where admin auth guard goes
- [x] 3.3 Register the router in `main.py` with prefix `/api/v1/bicycles`

## 4. Backend — Verification

- [x] 4.1 Start the backend (`uvicorn main:app --reload`) and confirm all endpoints respond correctly via `http://localhost:8000/docs`

## 5. Frontend — API Client

- [x] 5.1 Create `frontend/src/api/bicycles.js` with functions: `fetchBicycles`, `createBicycle`, `updateBicycle`, `deleteBicycle`

## 6. Frontend — Bicycle List Page

- [x] 6.1 Create `frontend/src/pages/BicyclesPage.jsx` with a table showing all bicycles (brand, type, status)
- [x] 6.2 Add "Add bicycle" button that opens a create form
- [x] 6.3 Add "Edit" button per row that opens an edit form pre-filled with the bicycle's data
- [x] 6.4 Add "Delete" button per row with a confirmation step before calling the API
- [x] 6.5 Re-fetch the list after every create, update, or delete action

## 7. Frontend — Routing

- [x] 7.1 Install `react-router-dom` if not already present
- [x] 7.2 Set up routes in `App.jsx`: `/` → redirect or home, `/bicycles` → `BicyclesPage`
- [x] 7.3 Verify navigation to `/bicycles` loads the page correctly

## 8. Frontend — Verification

- [x] 8.1 Start the frontend (`npm run dev`) and test the full flow: list, add, edit, delete a bicycle
