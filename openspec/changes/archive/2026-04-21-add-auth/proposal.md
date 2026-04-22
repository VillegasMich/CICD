## Why

The app currently accepts `user_id` as a plain field on rentals and leaves bicycle write endpoints unprotected, allowing anyone to impersonate any user or modify the inventory. We need real authentication and role-based authorization so that rentals are tied to the caller and only admins can manage bicycles.

## What Changes

- Add JWT-based authentication: users log in with email + password and receive an access token
- Add public registration endpoint that creates `customer` accounts with hashed passwords
- Derive `user_id` on rental creation from the JWT (remove it from the request body) — **BREAKING** for `POST /api/v1/rentals`
- Guard bicycle write endpoints (`POST`, `PUT`, `DELETE /api/v1/bicycles`) with `admin` role
- Guard rental endpoints: any authenticated user can create/list their own rentals and complete them
- Hash passwords with bcrypt on registration; verify on login
- React frontend: login and register pages, token storage, auth-aware API client, protected routes, logout action

## Capabilities

### New Capabilities
- `auth`: registration, login, JWT issuance, password hashing, role-based dependency guards for FastAPI routes, and React UI for login/register/logout

### Modified Capabilities
- `bicycle-crud`: write endpoints (create/update/delete) now require an authenticated user with role `admin`
- `rental-management`: `POST /api/v1/rentals` no longer accepts `user_id` in the body — it is derived from the JWT; all rental endpoints require authentication

## Impact

- New files: `app/routers/auth.py`, `app/services/auth.py`, `app/schemas/auth.py`, `app/core/security.py` (JWT + password hashing), `app/core/dependencies.py` (`get_current_user`, `require_admin`)
- New files: `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`, `frontend/src/api/auth.js`, `frontend/src/context/AuthContext.jsx`
- Modified: `app/routers/bicycles.py` (admin guard on writes), `app/routers/rentals.py` (auth guard, `user_id` from token), `app/schemas/rental.py` (remove `user_id` from `RentalCreate`)
- Modified: `frontend/src/api/*` (attach `Authorization: Bearer` header), `frontend/src/App.jsx` (protected routes, nav reflects auth state), `frontend/src/pages/BicycleDetailPage.jsx` (remove manual `user_id` input)
- New dependencies: `python-jose[cryptography]`, `passlib[bcrypt]`
- `main.py` registers the new auth router at `/api/v1/auth`
- `scripts/seed_test_user.py` is replaced by a seed that hashes the password properly (or removed entirely)

## Non-goals

- OAuth / Google / social login or any external identity provider
- Refresh tokens, token revocation lists, or session management
- Password reset flow, email verification, or 2FA
- Per-user rental history views (still deferred)
- Admin UI for managing users
