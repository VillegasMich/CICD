## MODIFIED Requirements

### Requirement: Alembic migrations
The project SHALL use Alembic for database schema migrations. An initial migration SHALL be generated from the base models. In cloud environments (staging, production), migrations SHALL be executed as a separate one-off ECS task before each deployment. The app container SHALL NOT run migrations on startup.

#### Scenario: Initial migration creates all tables
- **WHEN** `alembic upgrade head` is executed against a clean database
- **THEN** tables `bicycles`, `users`, and `rentals` SHALL be created

#### Scenario: Cloud migrations run via CI, not app startup
- **WHEN** a new version is deployed to staging or production
- **THEN** the migration ECS task SHALL run `alembic upgrade head` before the app service is updated

#### Scenario: Local development still runs migrations via entrypoint
- **WHEN** `docker-compose up` is run locally
- **THEN** migrations SHALL run via the local entrypoint script (not via ECS task)
