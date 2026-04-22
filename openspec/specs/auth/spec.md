# Spec: Auth

## Purpose

Defines user registration, login, JWT authentication, role-based access control, and the corresponding frontend pages and guards.

## Requirements

### Requirement: User registration
The system SHALL expose a `POST /api/v1/auth/register` endpoint that creates a new user account with the `customer` role.

#### Scenario: Register with valid data
- **WHEN** a client sends `POST /api/v1/auth/register` with `{ "name": "Alice", "email": "alice@example.com", "password": "s3cret!" }` and no user with that email exists
- **THEN** the system returns `201 Created` with the new user's `id`, `name`, `email`, and `role: "customer"`, and stores the password as a bcrypt hash

#### Scenario: Register with duplicate email
- **WHEN** a client sends `POST /api/v1/auth/register` with an email that already exists
- **THEN** the system returns `400 Bad Request`

#### Scenario: Register with missing required fields
- **WHEN** a client sends `POST /api/v1/auth/register` without `name`, `email`, or `password`
- **THEN** the system returns `422 Unprocessable Entity`

#### Scenario: Registered users cannot self-assign admin role
- **WHEN** a client sends `POST /api/v1/auth/register` including `"role": "admin"` in the payload
- **THEN** the created user's role is `customer` (the role field is ignored)

---

### Requirement: User login
The system SHALL expose a `POST /api/v1/auth/login` endpoint that verifies credentials and returns a JWT access token.

#### Scenario: Login with valid credentials
- **WHEN** a client sends `POST /api/v1/auth/login` with `{ "email": "alice@example.com", "password": "s3cret!" }` and the password matches the stored bcrypt hash
- **THEN** the system returns `200 OK` with `{ "access_token": "<jwt>", "token_type": "bearer" }` where the JWT encodes the user's `id` and `role`

#### Scenario: Login with wrong password
- **WHEN** a client sends `POST /api/v1/auth/login` with a password that does not match
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Login with unknown email
- **WHEN** a client sends `POST /api/v1/auth/login` with an email not in the database
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: Current user endpoint
The system SHALL expose a `GET /api/v1/auth/me` endpoint that returns the authenticated user's profile.

#### Scenario: Get current user with valid token
- **WHEN** a client sends `GET /api/v1/auth/me` with `Authorization: Bearer <valid-jwt>`
- **THEN** the system returns `200 OK` with the user's `id`, `name`, `email`, and `role`

#### Scenario: Get current user without token
- **WHEN** a client sends `GET /api/v1/auth/me` with no `Authorization` header
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Get current user with expired token
- **WHEN** a client sends `GET /api/v1/auth/me` with a JWT whose `exp` has passed
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: JWT authentication dependency
The system SHALL provide a FastAPI dependency that resolves the current user from the `Authorization: Bearer <token>` header, used by all protected endpoints.

#### Scenario: Request with valid token
- **WHEN** an endpoint depending on `get_current_user` receives a request with a valid JWT
- **THEN** the handler runs with the decoded `User` available

#### Scenario: Request with malformed token
- **WHEN** an endpoint depending on `get_current_user` receives a request with a malformed or invalidly-signed JWT
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Request referencing a deleted user
- **WHEN** a JWT is presented whose `sub` (user id) no longer exists in the database
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: Admin role guard
The system SHALL provide a FastAPI dependency that requires the current user's role to be `admin`, used by admin-only endpoints.

#### Scenario: Admin user passes the guard
- **WHEN** an endpoint depending on `require_admin` receives a request from a user with `role: "admin"`
- **THEN** the handler runs

#### Scenario: Customer user is rejected
- **WHEN** an endpoint depending on `require_admin` receives a request from a user with `role: "customer"`
- **THEN** the system returns `403 Forbidden`

---

### Requirement: Login and register UI
The system SHALL provide React pages at `/login` and `/register` that authenticate the user and persist the JWT in the browser.

#### Scenario: User registers from UI
- **WHEN** a visitor submits the register form with valid data
- **THEN** the UI creates the account, logs the user in by storing the token, and redirects to `/bicycles`

#### Scenario: User logs in from UI
- **WHEN** a visitor submits the login form with valid credentials
- **THEN** the UI stores the token in `localStorage`, updates the auth context, and redirects to the page they came from (or `/bicycles`)

#### Scenario: User logs out
- **WHEN** an authenticated user clicks "Logout" in the navbar
- **THEN** the UI clears the token from storage, resets auth state, and redirects to `/login`

#### Scenario: Failed login shows error
- **WHEN** a visitor submits the login form with wrong credentials
- **THEN** the UI shows an inline error message and does not redirect

---

### Requirement: Protected routes and role-aware navigation
The system SHALL restrict access to authenticated-only and admin-only pages in the React frontend, and adjust navigation links based on the current user.

#### Scenario: Unauthenticated user accesses a protected route
- **WHEN** a visitor with no token navigates to `/rentals`
- **THEN** the UI redirects them to `/login`

#### Scenario: Customer accesses an admin control
- **WHEN** a logged-in `customer` views `/bicycles`
- **THEN** the "Add bicycle", "Edit", and "Delete" controls are hidden

#### Scenario: Logged-in nav state
- **WHEN** a user is logged in
- **THEN** the navbar shows the user's name and a "Logout" button instead of "Login" and "Register" links

#### Scenario: 401 response from API triggers logout
- **WHEN** any API call returns `401 Unauthorized`
- **THEN** the UI clears stored auth state and redirects to `/login`
