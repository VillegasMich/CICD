## MODIFIED Requirements

### Requirement: Delete a bicycle
The system SHALL expose a `DELETE /api/v1/bicycles/{id}` endpoint that removes a bicycle from the database, provided it has no active rental.

#### Scenario: Delete bicycle with no rentals
- **WHEN** a client sends `DELETE /api/v1/bicycles/1` and bicycle 1 exists with no active rental
- **THEN** the system returns `204 No Content` and the bicycle is removed

#### Scenario: Cannot delete bicycle with active rental
- **WHEN** a client sends `DELETE /api/v1/bicycles/1` and bicycle 1 has an active rental (status `rented`)
- **THEN** the system returns `400 Bad Request`

## ADDED Requirements

### Requirement: Bicycle status syncs with rental lifecycle
The system SHALL automatically update the bicycle `status` field when a rental is started or completed.

#### Scenario: Bicycle becomes rented when rental starts
- **WHEN** a rental is successfully created for bicycle id 1
- **THEN** bicycle 1 status changes from `available` to `rented`

#### Scenario: Bicycle becomes available when rental completes
- **WHEN** a rental for bicycle id 1 is successfully completed
- **THEN** bicycle 1 status changes from `rented` to `available`
