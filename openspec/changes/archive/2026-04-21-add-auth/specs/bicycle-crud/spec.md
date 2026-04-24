## MODIFIED Requirements

### Requirement: Create a bicycle
The system SHALL expose a `POST /api/v1/bicycles` endpoint, restricted to admin users, that creates a new bicycle.

#### Scenario: Admin creates with valid data
- **WHEN** an admin client sends `POST /api/v1/bicycles` with `{ "brand": "Trek", "type": "mountain" }`
- **THEN** the system returns `201 Created` with the new bicycle including its generated `id` and default `status` of `available`

#### Scenario: Create with missing required fields
- **WHEN** an admin client sends `POST /api/v1/bicycles` without `brand` or `type`
- **THEN** the system returns `422 Unprocessable Entity`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a client sends `POST /api/v1/bicycles` without a valid JWT
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Customer is forbidden from creating bicycles
- **WHEN** a client authenticated as `customer` sends `POST /api/v1/bicycles`
- **THEN** the system returns `403 Forbidden`

---

### Requirement: Update a bicycle
The system SHALL expose a `PUT /api/v1/bicycles/{id}` endpoint, restricted to admin users, that partially updates an existing bicycle.

#### Scenario: Admin updates existing bicycle
- **WHEN** an admin client sends `PUT /api/v1/bicycles/1` with `{ "status": "rented" }` and the bicycle exists
- **THEN** the system returns `200 OK` with the updated bicycle data

#### Scenario: Update non-existing bicycle
- **WHEN** an admin client sends `PUT /api/v1/bicycles/999` and no bicycle with that id exists
- **THEN** the system returns `404 Not Found`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a client sends `PUT /api/v1/bicycles/1` without a valid JWT
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Customer is forbidden from updating bicycles
- **WHEN** a client authenticated as `customer` sends `PUT /api/v1/bicycles/1`
- **THEN** the system returns `403 Forbidden`

---

### Requirement: Delete a bicycle
The system SHALL expose a `DELETE /api/v1/bicycles/{id}` endpoint, restricted to admin users, that removes a bicycle from the database provided it has no active rental.

#### Scenario: Admin deletes bicycle with no rentals
- **WHEN** an admin client sends `DELETE /api/v1/bicycles/1` and bicycle 1 exists with no active rental
- **THEN** the system returns `204 No Content` and the bicycle is removed

#### Scenario: Cannot delete bicycle with active rental
- **WHEN** an admin client sends `DELETE /api/v1/bicycles/1` and bicycle 1 has an active rental (status `rented`)
- **THEN** the system returns `400 Bad Request`

#### Scenario: Delete non-existing bicycle
- **WHEN** an admin client sends `DELETE /api/v1/bicycles/999` and no bicycle with that id exists
- **THEN** the system returns `404 Not Found`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a client sends `DELETE /api/v1/bicycles/1` without a valid JWT
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Customer is forbidden from deleting bicycles
- **WHEN** a client authenticated as `customer` sends `DELETE /api/v1/bicycles/1`
- **THEN** the system returns `403 Forbidden`

---

### Requirement: Bicycle list UI
The system SHALL provide a React page at `/bicycles` that displays all bicycles to any visitor, and allows create, edit, and delete actions only for admin users.

#### Scenario: Anonymous visitor views bicycle list
- **WHEN** a visitor without a token navigates to `/bicycles`
- **THEN** the page displays a table with all bicycles showing brand, type, and status, with no admin controls visible

#### Scenario: Admin adds a bicycle
- **WHEN** an admin user clicks "Add bicycle" and submits the form with valid data
- **THEN** the new bicycle appears in the list without a full page reload

#### Scenario: Admin edits a bicycle
- **WHEN** an admin user clicks "Edit" on a bicycle row and submits the form
- **THEN** the updated data is reflected in the list

#### Scenario: Admin deletes a bicycle
- **WHEN** an admin user clicks "Delete" on a bicycle row and confirms
- **THEN** the bicycle is removed from the list

#### Scenario: Customer does not see admin controls
- **WHEN** a user authenticated as `customer` views `/bicycles`
- **THEN** the page shows the table but hides the "Add bicycle", "Edit", and "Delete" controls
