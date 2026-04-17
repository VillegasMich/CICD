## ADDED Requirements

### Requirement: List all bicycles
The system SHALL expose a `GET /api/v1/bicycles` endpoint that returns all bicycles in the database.

#### Scenario: List returns all bicycles
- **WHEN** a client sends `GET /api/v1/bicycles`
- **THEN** the system returns `200 OK` with a JSON array of all bicycles, each containing `id`, `brand`, `type`, and `status`

#### Scenario: List returns empty array when no bicycles exist
- **WHEN** a client sends `GET /api/v1/bicycles` and the database has no bicycles
- **THEN** the system returns `200 OK` with an empty array `[]`

---

### Requirement: Get a single bicycle
The system SHALL expose a `GET /api/v1/bicycles/{id}` endpoint that returns one bicycle by its id.

#### Scenario: Get existing bicycle
- **WHEN** a client sends `GET /api/v1/bicycles/1` and a bicycle with id 1 exists
- **THEN** the system returns `200 OK` with the bicycle's data

#### Scenario: Get non-existing bicycle
- **WHEN** a client sends `GET /api/v1/bicycles/999` and no bicycle with that id exists
- **THEN** the system returns `404 Not Found`

---

### Requirement: Create a bicycle
The system SHALL expose a `POST /api/v1/bicycles` endpoint that creates a new bicycle.

#### Scenario: Create with valid data
- **WHEN** a client sends `POST /api/v1/bicycles` with `{ "brand": "Trek", "type": "mountain" }`
- **THEN** the system returns `201 Created` with the new bicycle including its generated `id` and default `status` of `available`

#### Scenario: Create with missing required fields
- **WHEN** a client sends `POST /api/v1/bicycles` without `brand` or `type`
- **THEN** the system returns `422 Unprocessable Entity`

---

### Requirement: Update a bicycle
The system SHALL expose a `PUT /api/v1/bicycles/{id}` endpoint that partially updates an existing bicycle.

#### Scenario: Update existing bicycle
- **WHEN** a client sends `PUT /api/v1/bicycles/1` with `{ "status": "rented" }` and the bicycle exists
- **THEN** the system returns `200 OK` with the updated bicycle data

#### Scenario: Update non-existing bicycle
- **WHEN** a client sends `PUT /api/v1/bicycles/999` and no bicycle with that id exists
- **THEN** the system returns `404 Not Found`

---

### Requirement: Delete a bicycle
The system SHALL expose a `DELETE /api/v1/bicycles/{id}` endpoint that removes a bicycle.

#### Scenario: Delete existing bicycle with no active rental
- **WHEN** a client sends `DELETE /api/v1/bicycles/1` and the bicycle exists and has no active rental
- **THEN** the system returns `204 No Content` and the bicycle is removed from the database

#### Scenario: Delete non-existing bicycle
- **WHEN** a client sends `DELETE /api/v1/bicycles/999` and no bicycle with that id exists
- **THEN** the system returns `404 Not Found`

---

### Requirement: Bicycle list UI
The system SHALL provide a React page at `/bicycles` that displays all bicycles and allows create, edit, and delete actions.

#### Scenario: User views bicycle list
- **WHEN** a user navigates to `/bicycles`
- **THEN** the page displays a table with all bicycles showing brand, type, and status

#### Scenario: User adds a bicycle
- **WHEN** a user clicks "Add bicycle" and submits the form with valid data
- **THEN** the new bicycle appears in the list without a full page reload

#### Scenario: User edits a bicycle
- **WHEN** a user clicks "Edit" on a bicycle row and submits the form
- **THEN** the updated data is reflected in the list

#### Scenario: User deletes a bicycle
- **WHEN** a user clicks "Delete" on a bicycle row and confirms
- **THEN** the bicycle is removed from the list
