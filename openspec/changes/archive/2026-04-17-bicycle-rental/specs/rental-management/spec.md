## ADDED Requirements

### Requirement: List all rentals
The system SHALL expose a `GET /api/v1/rentals` endpoint that returns all rentals.

#### Scenario: List returns all rentals
- **WHEN** a client sends `GET /api/v1/rentals`
- **THEN** the system returns `200 OK` with a JSON array of all rentals, each containing `id`, `bicycle_id`, `user_id`, `start_time`, `end_time`, and `status`

#### Scenario: List returns empty array when no rentals exist
- **WHEN** a client sends `GET /api/v1/rentals` and no rentals exist
- **THEN** the system returns `200 OK` with an empty array `[]`

---

### Requirement: Start a rental
The system SHALL expose a `POST /api/v1/rentals` endpoint that creates a new active rental for a bicycle.

#### Scenario: Start rental for available bicycle
- **WHEN** a client sends `POST /api/v1/rentals` with `{ "bicycle_id": 1, "user_id": 1 }` and bicycle 1 has status `available`
- **THEN** the system returns `201 Created` with the rental data including `status: "active"` and a `start_time`

#### Scenario: Cannot start rental for unavailable bicycle
- **WHEN** a client sends `POST /api/v1/rentals` with a `bicycle_id` whose status is `rented`
- **THEN** the system returns `400 Bad Request`

#### Scenario: Cannot start rental for non-existing bicycle
- **WHEN** a client sends `POST /api/v1/rentals` with a `bicycle_id` that does not exist
- **THEN** the system returns `404 Not Found`

---

### Requirement: Complete a rental
The system SHALL expose a `PUT /api/v1/rentals/{id}/complete` endpoint that marks an active rental as completed.

#### Scenario: Complete an active rental
- **WHEN** a client sends `PUT /api/v1/rentals/1/complete` and rental 1 has status `active`
- **THEN** the system returns `200 OK` with the rental data updated to `status: "completed"` and an `end_time`

#### Scenario: Cannot complete an already-completed rental
- **WHEN** a client sends `PUT /api/v1/rentals/1/complete` and rental 1 already has status `completed`
- **THEN** the system returns `400 Bad Request`

#### Scenario: Cannot complete a non-existing rental
- **WHEN** a client sends `PUT /api/v1/rentals/999/complete` and no rental with that id exists
- **THEN** the system returns `404 Not Found`
