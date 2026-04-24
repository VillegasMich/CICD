## Context

The `User` model (`id`, `name`, `email`, `hashed_password`, `role`) already exists in the database, with `UserRole` as an enum of `admin` / `customer`. However, there is no authentication layer: bicycle writes are unprotected, and `POST /api/v1/rentals` accepts a raw `user_id` from the request body, which is trivially forgeable. A temporary seed script (`scripts/seed_test_user.py`) creates a test user with a placeholder string in `hashed_password`, which is not a real bcrypt hash.

The frontend has no notion of a logged-in user: all pages are public, no nav state, no token handling. `BicycleDetailPage.jsx` currently asks the user to type a `user_id` manually when renting.

## Goals / Non-Goals

**Goals:**
- Password-based registration and login returning a JWT access token
- FastAPI dependencies that (a) resolve the current user from the token and (b) enforce `admin` role on bicycle writes
- Remove `user_id` from the rental create payload; derive it from the JWT
- React auth flow: login/register pages, context-based auth state, token attached to every API call, protected routes, logout

**Non-Goals:**
- OAuth or social login
- Refresh tokens, revocation, or session tracking
- Password reset, email verification, 2FA
- Admin UI for managing users / changing roles
- Rate limiting login attempts

## Decisions

### 1. JWT library: `python-jose[cryptography]`; hashing: `passlib[bcrypt]`
Standard stack for FastAPI auth. `python-jose` handles encode/decode; `passlib` wraps bcrypt so we can swap algorithms later without touching call sites.

**Alternatives considered:** `PyJWT` + raw `bcrypt` — rejected, `passlib` gives us a cleaner API and future-proofing.

### 2. HS256 with a secret loaded from env (`JWT_SECRET`), 60-minute access token
Symmetric signing is enough for a monolith where the same process issues and validates tokens. Add `JWT_SECRET` and `JWT_EXPIRE_MINUTES` to `.env.example` with dev defaults. Payload: `{ sub: <user_id>, role: <"admin" | "customer">, exp: <unix ts> }`.

**Alternatives considered:** RS256 — rejected, unnecessary complexity for a monolith with no external verifiers. Shorter expirations — rejected without a refresh token the UX is bad.

### 3. Frontend stores the token in `localStorage`
Simple and sufficient for this app's threat model (no third-party scripts, no cookies to CSRF). An `AuthContext` reads it on mount, exposes `user`, `login()`, `logout()`, `register()`, and re-decodes the JWT to get `role`.

**Alternatives considered:** `httpOnly` cookie — rejected, forces CSRF tokens and complicates the dev proxy. Memory-only — rejected, page refresh would log the user out.

### 4. FastAPI dependencies: `get_current_user` and `require_admin`
- `get_current_user` reads the `Authorization: Bearer ...` header, decodes the JWT, loads the `User`, returns it. 401 on any failure.
- `require_admin` depends on `get_current_user` and raises 403 if `role != admin`.

Wired into routers via `Depends(get_current_user)` (rentals, future user-scoped routes) and `Depends(require_admin)` (bicycle writes).

**Alternatives considered:** Middleware per router — rejected, less composable and harder to test than per-endpoint deps.

### 5. API endpoints (new)

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/v1/auth/register` | `{ name, email, password }` | `UserResponse` 201 |
| POST | `/api/v1/auth/login` | `{ email, password }` | `{ access_token, token_type: "bearer" }` |
| GET | `/api/v1/auth/me` | — | `UserResponse` (current user) |

`/register` always creates a `customer`. Admins are bootstrapped via a seed script (`scripts/seed_admin.py`, replaces `seed_test_user.py`) that creates an admin user with a bcrypt-hashed password pulled from env.

### 6. Rental API — BREAKING change
`POST /api/v1/rentals` no longer accepts `user_id` in the body. `RentalCreate` reduces to `{ bicycle_id }`. The router uses `get_current_user` and passes the user's id to `rental_service.create()`. `GET /api/v1/rentals` still returns all rentals (filtering per-user is out of scope for this change).

### 7. Bicycle API — auth tightening
`POST`, `PUT`, `DELETE /api/v1/bicycles/*` gain `Depends(require_admin)`. `GET` endpoints remain public so the inventory is browsable pre-login.

### 8. Frontend shape
- `src/context/AuthContext.jsx`: provider, hook `useAuth()`, reads token on boot, decodes JWT for role
- `src/api/client.js` (new helper) or edit each `api/*.js` file: attach `Authorization` header if token present, redirect to `/login` on 401
- `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`: forms styled with existing `BicyclesPage.css` tokens
- `src/components/ProtectedRoute.jsx`: wraps routes that need auth; redirects to `/login`; optional `requireAdmin` prop hides admin-only routes from customers
- Navbar shows "Login"/"Register" when logged out, and user name + "Logout" when logged in; bicycle create/edit/delete controls hidden for non-admins
- `BicycleDetailPage.jsx`: rent button only visible when logged in; modal loses the `user_id` field and just confirms

## Risks / Trade-offs

- **localStorage + XSS** → any XSS can steal the token. Mitigation: no third-party scripts in the SPA today; sanitize any user-rendered text; accept the risk at this scale.
- **No token revocation** → logging out only clears client state; a stolen token is valid until it expires. Mitigation: short (60 min) expiration; document as known limitation.
- **Breaking rental API** → any existing client sending `user_id` in the body will now fail validation. Mitigation: change is in active development, no external consumers; update the frontend in the same PR.
- **Admin bootstrap via script** → the seed script must be run manually per environment. Mitigation: document in README; fail fast if `ADMIN_EMAIL`/`ADMIN_PASSWORD` aren't set.

## Migration Plan

1. Add `python-jose[cryptography]` and `passlib[bcrypt]` to `requirements.txt`
2. Add `JWT_SECRET`, `JWT_EXPIRE_MINUTES`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` to `.env.example`
3. Deploy backend and frontend together (breaking rental change)
4. Run `python -m scripts.seed_admin` to create the first admin
5. Delete `scripts/seed_test_user.py`

No schema migration needed — the `User` table already exists with the right columns.

## Open Questions

- Should we allow admins to be created via `/register` by passing a role, or strictly via seed? — **Decided:** strictly via seed. Protects against privilege escalation by default.
- Should we expose `GET /api/v1/users/me/rentals` now, or defer? — **Deferred**, not required for this change.
