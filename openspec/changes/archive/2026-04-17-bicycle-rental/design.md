## Context

The `Rental` model (`id`, `user_id`, `bicycle_id`, `start_time`, `end_time`, `status`) and `Bicycle` model (`id`, `brand`, `type`, `status`) already exist in the database. The bicycle CRUD layer is complete. There is no rental service, router, or UI yet.

Since auth is not implemented, rentals will temporarily accept a `user_id` as a plain request field rather than deriving it from a JWT token.

## Goals / Non-Goals

**Goals:**
- REST endpoints to start and complete a rental and list all rentals
- Bicycle status automatically transitions `available → rented` on start and `rented → available` on complete
- React UI page to create a rental, complete it, and view the list

**Non-Goals:**
- Auth-scoped rentals (deferred to auth feature)
- Payment or billing
- Per-user rental history view

## Decisions

### 1. Three-layer backend: router → service → model
Same pattern as bicycle CRUD. `app/services/rental.py` holds all business logic; the router is thin.

**Alternatives considered:** Inline logic in router — rejected, inconsistent with existing pattern.

### 2. Bicycle status update lives in the rental service
When a rental is created, `rental_service.create()` fetches the bicycle, checks it is `available`, sets it to `rented`, and creates the rental in one transaction. On complete, it sets the bicycle back to `available`.

**Alternatives considered:** Separate endpoint to update bicycle status — rejected, introduces race conditions and forces callers to make two requests.

### 3. `user_id` supplied by caller (no auth yet)
The request body includes `user_id` as an integer. A `TODO` comment marks where the auth guard goes.

**Alternatives considered:** Hardcode a dummy user — rejected, less realistic and harder to remove later.

### 4. API endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/v1/rentals` | — | `RentalResponse[]` |
| POST | `/api/v1/rentals` | `{ bicycle_id, user_id }` | `RentalResponse` 201 |
| PUT | `/api/v1/rentals/{id}/complete` | — | `RentalResponse` |

### 5. Frontend: rental started from bicycle detail, listed on RentalsPage
Rentals are initiated contextually: `BicyclesPage` links each row to `/bicycles/:id` (`BicycleDetailPage`), which shows a "Rent this bicycle" button when status is `available`. The rent modal only asks for `user_id` — `bicycle_id` is taken from the URL. After submission, the user is redirected to `/rentals`, which lists all rentals and exposes the "Complete" action on active ones. This avoids asking the user to remember/lookup a `bicycle_id`.

**Alternatives considered:** Single form on RentalsPage asking for both ids — rejected, poor UX since the user must know bicycle ids and availability out-of-band.

### 6. Pydantic schemas
- `RentalCreate`: `bicycle_id: int`, `user_id: int`
- `RentalResponse`: `id`, `bicycle_id`, `user_id`, `start_time`, `end_time | None`, `status`

## Risks / Trade-offs

- **No transaction isolation on status update** → if two requests try to rent the same bicycle simultaneously, both could pass the `available` check before either writes. Mitigation: acceptable at this scale; a DB-level unique constraint on active rentals per bicycle can be added later.
- **user_id from request body** → caller can impersonate any user. Mitigation: `TODO` comment, auth will replace this field.

## Migration Plan

No schema changes needed — `Rental` table already exists via Alembic. Deploying this feature only requires restarting the backend.

## Open Questions

- Should listing rentals support filtering by status (`active` / `completed`)? — Deferred; full list is sufficient for now.
