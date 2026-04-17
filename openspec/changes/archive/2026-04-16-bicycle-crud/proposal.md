## Why

The application has a working foundation (FastAPI backend, React frontend, PostgreSQL database) but no domain functionality. The `Bicycle` model and table already exist; now we need the full CRUD layer so administrators can manage the bicycle inventory through the API and the UI.

## What Changes

- New REST endpoints under `/api/v1/bicycles`: list, get by id, create, update, delete
- Pydantic schemas for bicycle request/response validation
- Service layer with business logic (e.g., prevent deletion of a rented bicycle)
- React UI: bicycle list page with add, edit, and delete actions
- Admin-only guard on write operations (create, update, delete)

## Capabilities

### New Capabilities

- `bicycle-crud`: Full CRUD for the `Bicycle` entity — API endpoints, service logic, Pydantic schemas, and React UI

### Modified Capabilities

_(none — no existing spec requirements are changing)_

## Impact

- **New files:** `app/schemas/bicycle.py`, `app/services/bicycle.py`, `app/routers/bicycles.py`
- **Modified files:** `main.py` (register new router), `frontend/src/` (new pages/components)
- **API:** adds `GET/POST /api/v1/bicycles` and `GET/PUT/DELETE /api/v1/bicycles/{id}`
- **No breaking changes** to existing `/api/v1/health` endpoint or DB schema
