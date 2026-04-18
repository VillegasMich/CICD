## 1. Backend — Dependencies and Config

- [x] 1.1 Add `python-jose[cryptography]` and `passlib[bcrypt]` to `requirements.txt` and install
- [x] 1.2 Add `JWT_SECRET`, `JWT_EXPIRE_MINUTES`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` entries to `.env.example` with dev defaults
- [x] 1.3 Extend `app/config.py` (or equivalent) to load these env vars via Pydantic settings

## 2. Backend — Security Primitives

- [x] 2.1 Create `app/core/security.py` with `hash_password`, `verify_password`, `create_access_token(user_id, role)`, and `decode_access_token(token)` helpers
- [x] 2.2 Create `app/core/dependencies.py` with `get_current_user` (resolves `User` from `Authorization: Bearer ...`, 401 on failure) and `require_admin` (403 if `role != admin`)

## 3. Backend — Auth Schemas

- [x] 3.1 Create `app/schemas/auth.py` with `RegisterRequest` (`name`, `email`, `password`), `LoginRequest` (`email`, `password`), `TokenResponse` (`access_token`, `token_type`), `UserResponse` (`id`, `name`, `email`, `role`)
- [x] 3.2 Export new schemas from `app/schemas/__init__.py`

## 4. Backend — Auth Service

- [x] 4.1 Create `app/services/auth.py` with `register` (check email uniqueness, hash password, force `role=customer`, persist user)
- [x] 4.2 Add `authenticate` (fetch user by email, verify password, return token or raise 401)
- [x] 4.3 Add `get_user_by_id` used by `get_current_user`

## 5. Backend — Auth Router

- [x] 5.1 Create `app/routers/auth.py` with `POST /register`, `POST /login`, `GET /me` endpoints
- [x] 5.2 Register the router in `main.py` with prefix `/api/v1/auth`

## 6. Backend — Guard Existing Routers

- [x] 6.1 Add `Depends(require_admin)` to `POST`, `PUT`, `DELETE` endpoints in `app/routers/bicycles.py`
- [x] 6.2 Add `Depends(get_current_user)` to all endpoints in `app/routers/rentals.py`
- [x] 6.3 Remove `user_id` from `RentalCreate` in `app/schemas/rental.py`; pass `current_user.id` from the router to `rental_service.create()`
- [x] 6.4 Update `rental_service.create()` signature to accept `user_id` as a separate argument
- [x] 6.5 Remove the `TODO: auth guard` comments now that the guards are in place

## 7. Backend — Admin Seed

- [x] 7.1 Create `scripts/seed_admin.py` that reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from env, hashes the password with bcrypt, and inserts an admin user if absent (idempotent)
- [x] 7.2 Delete `scripts/seed_test_user.py` (N/A — file does not exist in repo)

## 8. Backend — Verification

- [ ] 8.1 Start the backend and confirm `/api/v1/auth/register`, `/login`, `/me` work via `http://localhost:8000/docs`
- [ ] 8.2 Confirm bicycle writes return 401 without token and 403 for a customer token; work for admin
- [ ] 8.3 Confirm `POST /api/v1/rentals` derives `user_id` from JWT and ignores any `user_id` in the body

## 9. Frontend — Auth API Client and Context

- [x] 9.1 Create `frontend/src/api/auth.js` with `register`, `login`, `fetchMe` functions
- [x] 9.2 Create `frontend/src/context/AuthContext.jsx` exposing `user`, `token`, `login`, `register`, `logout`, and a `useAuth()` hook; load token from `localStorage` on mount and call `fetchMe`
- [x] 9.3 Wrap `<App />` in `AuthProvider` in `frontend/src/main.jsx`
- [x] 9.4 Update every `frontend/src/api/*.js` file to attach `Authorization: Bearer <token>` when a token is present, and trigger logout + redirect to `/login` on 401

## 10. Frontend — Login and Register Pages

- [x] 10.1 Create `frontend/src/pages/LoginPage.jsx` with an email/password form; on success call `login()` from context and redirect
- [x] 10.2 Create `frontend/src/pages/RegisterPage.jsx` with a name/email/password form; on success log the user in and redirect to `/bicycles`
- [x] 10.3 Show inline error messages on invalid credentials or duplicate email
- [x] 10.4 Style both pages using the existing card/form classes from `BicyclesPage.css`

## 11. Frontend — Protected Routes and Role-aware UI

- [x] 11.1 Create `frontend/src/components/ProtectedRoute.jsx` that redirects unauthenticated users to `/login` and accepts a `requireAdmin` prop
- [x] 11.2 In `frontend/src/App.jsx`, wrap `/rentals` and `/bicycles/:id` rent action with `ProtectedRoute`; add `/login` and `/register` routes
- [x] 11.3 Update the navbar: show user name + "Logout" when authenticated; show "Login"/"Register" otherwise
- [x] 11.4 In `frontend/src/pages/BicyclesPage.jsx`, hide "Add bicycle", "Edit", and "Delete" controls when user role is not `admin`
- [x] 11.5 In `frontend/src/pages/BicycleDetailPage.jsx`, remove the `user_id` input from the rent modal; show the rent button only when logged in

## 12. Frontend — Verification

- [ ] 12.1 Start the frontend and verify: register a customer, log in, rent a bicycle (no user_id prompt), complete the rental
- [ ] 12.2 Verify a customer cannot see admin controls on `/bicycles` and receives 403 if they try admin actions
- [ ] 12.3 Log in as admin (from seed) and confirm create/edit/delete on bicycles works
- [ ] 12.4 Verify logout clears state and redirects to `/login`

## 13. Docs

- [x] 13.1 Update `README.md`: add auth endpoints to the API table, describe the seed admin script, remove references to `seed_test_user.py`
