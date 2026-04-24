# Spec: Rental Management

## Purpose

The rental-management capability governs the lifecycle of bicycle rentals, including listing, starting, and completing rentals. All endpoints require authentication.

## Requirements

### Requirement: List all rentals
The system SHALL expose a `GET /api/v1/rentals` endpoint, restricted to authenticated users, that returns all rentals.

#### Scenario: Authenticated user lists all rentals
- **WHEN** an authenticated client sends `GET /api/v1/rentals`
- **THEN** the system returns `200 OK` with a JSON array of all rentals, each containing `id`, `bicycle_id`, `user_id`, `start_time`, `end_time`, and `status`

#### Scenario: List returns empty array when no rentals exist
- **WHEN** an authenticated client sends `GET /api/v1/rentals` and no rentals exist
- **THEN** the system returns `200 OK` with an empty array `[]`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a client sends `GET /api/v1/rentals` without a valid JWT
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: Start a rental
The system SHALL expose a `POST /api/v1/rentals` endpoint, restricted to authenticated users, that creates a new active rental for the caller. The `user_id` SHALL be derived from the JWT and MUST NOT be accepted in the request body.

#### Scenario: Authenticated user rents an available bicycle
- **WHEN** an authenticated client sends `POST /api/v1/rentals` with `{ "bicycle_id": 1 }` and bicycle 1 has status `available`
- **THEN** the system returns `201 Created` with the rental data including `user_id` set to the caller's id, `status: "active"`, and a `start_time`

#### Scenario: Cannot rent an unavailable bicycle
- **WHEN** an authenticated client sends `POST /api/v1/rentals` with a `bicycle_id` whose status is `rented`
- **THEN** the system returns `400 Bad Request`

#### Scenario: Cannot rent a non-existing bicycle
- **WHEN** an authenticated client sends `POST /api/v1/rentals` with a `bicycle_id` that does not exist
- **THEN** the system returns `404 Not Found`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a client sends `POST /api/v1/rentals` without a valid JWT
- **THEN** the system returns `401 Unauthorized`

#### Scenario: user_id in request body is ignored
- **WHEN** an authenticated client sends `POST /api/v1/rentals` with `{ "bicycle_id": 1, "user_id": 99 }` as caller id 5
- **THEN** the created rental's `user_id` is 5 (the caller's id), not 99

---

### Requirement: Complete a rental
The system SHALL expose a `PUT /api/v1/rentals/{id}/complete` endpoint, restricted to authenticated users, that marks an active rental as completed.

#### Scenario: Authenticated user completes an active rental
- **WHEN** an authenticated client sends `PUT /api/v1/rentals/1/complete` and rental 1 has status `active`
- **THEN** the system returns `200 OK` with the rental data updated to `status: "completed"` and an `end_time`

#### Scenario: Cannot complete an already-completed rental
- **WHEN** an authenticated client sends `PUT /api/v1/rentals/1/complete` and rental 1 already has status `completed`
- **THEN** the system returns `400 Bad Request`

#### Scenario: Cannot complete a non-existing rental
- **WHEN** an authenticated client sends `PUT /api/v1/rentals/999/complete` and no rental with that id exists
- **THEN** the system returns `404 Not Found`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a client sends `PUT /api/v1/rentals/1/complete` without a valid JWT
- **THEN** the system returns `401 Unauthorized`
