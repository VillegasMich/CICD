## ADDED Requirements

### Requirement: User can log in via the login page
The system SHALL allow a registered user to authenticate through the login form and be redirected to the main application view.

#### Scenario: Successful login
- **WHEN** a user submits valid credentials on the login page
- **THEN** the system redirects the user to the bicycles listing page

#### Scenario: Failed login with wrong password
- **WHEN** a user submits an incorrect password
- **THEN** the system displays an error message and remains on the login page

### Requirement: User can view the bicycle listing
The system SHALL display a list of bicycles to an authenticated user.

#### Scenario: Bicycles list is visible after login
- **WHEN** an authenticated user navigates to the bicycles page
- **THEN** the system displays at least one bicycle entry

#### Scenario: User can navigate to bicycle detail
- **WHEN** an authenticated user clicks on a bicycle from the list
- **THEN** the system navigates to the bicycle detail page showing its information

### Requirement: User can view their rentals
The system SHALL display the rentals associated with the authenticated user.

#### Scenario: Rentals page is accessible
- **WHEN** an authenticated user navigates to the rentals page
- **THEN** the system displays the rentals view without errors

### Requirement: Cypress tests run in CI
The system SHALL execute the Cypress e2e test suite as part of the frontend CI pipeline on every push or pull request to develop.

#### Scenario: CI runs Cypress headlessly
- **WHEN** a push or pull request targets the develop branch
- **THEN** the CI pipeline installs dependencies, starts the dev server, and runs all Cypress specs with a zero exit code on success
