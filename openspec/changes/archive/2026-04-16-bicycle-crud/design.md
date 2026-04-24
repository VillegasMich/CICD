## Context

The `Bicycle` model and `bicycles` table already exist (created in base-setup). The backend has the folder structure (`app/routers`, `app/schemas`, `app/services`) but no domain code yet. The frontend is a blank React app. This design covers how to wire up the full CRUD layer on top of that foundation.

Auth is not yet implemented — write operations will be left with a placeholder guard for now and enforced once the auth feature ships.

## Goals / Non-Goals

**Goals:**
- REST API for bicycle CRUD following existing conventions (`/api/v1/bicycles`)
- Service layer that encapsulates business logic (e.g., block deletion of active rentals)
- Pydantic schemas for request/response validation
- React UI with a bicycle list, add form, edit form, and delete action

**Non-Goals:**
- User authentication / JWT (separate feature)
- Rental logic (separate feature)
- Pagination or filtering (can be added later)

## Decisions

### 1. Three-layer backend: router → service → model
Keep FastAPI routers thin (only HTTP concerns). Move all business logic to a service function (`app/services/bicycle.py`). Routers call services, services call SQLAlchemy.

**Why:** Easier to test services in isolation and reuse logic across endpoints (e.g., rental feature will also need to check bicycle status).

### 2. Separate Pydantic schemas per operation
- `BicycleCreate` — fields required on creation (brand, type, status optional)
- `BicycleUpdate` — all fields optional (partial update)
- `BicycleResponse` — what the API returns (includes `id`)

**Why:** Avoids leaking internal fields and gives clear contracts per endpoint.

### 3. API endpoints

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| GET | `/api/v1/bicycles` | — | `BicycleResponse[]` | List all bicycles |
| GET | `/api/v1/bicycles/{id}` | — | `BicycleResponse` | Get one bicycle |
| POST | `/api/v1/bicycles` | `BicycleCreate` | `BicycleResponse` | Create bicycle |
| PUT | `/api/v1/bicycles/{id}` | `BicycleUpdate` | `BicycleResponse` | Update bicycle |
| DELETE | `/api/v1/bicycles/{id}` | — | `204 No Content` | Delete bicycle |

### 4. React UI — two pages, no external state library
- `/bicycles` — list page: table with all bicycles, "Add" button, edit/delete per row
- Modal or inline form for create/edit

**Why:** The app is simple enough that `useState` + `fetch` is sufficient. No Redux/Zustand needed yet.

### 5. No auth enforcement yet
Write endpoints will exist without a role guard. A `TODO` comment will mark where the admin check goes once JWT auth is implemented.

**Why:** Unblocks CRUD development without depending on the auth feature.

## Risks / Trade-offs

- **No auth on write endpoints** → anyone can create/delete bicycles in dev. Acceptable short-term; must be closed before going to production.
- **No optimistic UI** → UI re-fetches after every mutation. Simpler but slightly slower UX.

## Migration Plan

No DB schema changes — `bicycles` table already exists. No migration needed.
