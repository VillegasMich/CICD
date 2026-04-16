## ADDED Requirements

### Requirement: Async database engine and session
The application SHALL configure an async SQLAlchemy engine using `asyncpg` as the PostgreSQL driver. A session factory SHALL be provided for use in FastAPI dependency injection.

#### Scenario: Database connection is established on startup
- **WHEN** the FastAPI application starts
- **THEN** the async engine SHALL connect to the PostgreSQL instance defined in `DATABASE_URL` without errors

#### Scenario: Session is available as a dependency
- **WHEN** a router endpoint declares `session: AsyncSession = Depends(get_db)`
- **THEN** a valid async session SHALL be injected and automatically closed after the request completes

### Requirement: Declarative base model
The project SHALL define a SQLAlchemy `Base` class used as the parent for all ORM models.

#### Scenario: All models inherit from Base
- **WHEN** any ORM model class is defined
- **THEN** it SHALL inherit from the shared `Base` and be registered in the metadata

### Requirement: Bicycle model
The database SHALL contain a `bicycles` table representing rentable bicycles.

#### Scenario: Bicycle table is created
- **WHEN** database migrations are applied
- **THEN** the `bicycles` table SHALL exist with columns: `id`, `brand`, `type`, `status`

#### Scenario: Bicycle status is constrained
- **WHEN** a bicycle record is inserted with an invalid status value
- **THEN** the database SHALL reject the insertion with a constraint error

### Requirement: User model
The database SHALL contain a `users` table representing registered users of the application.

#### Scenario: User table is created
- **WHEN** database migrations are applied
- **THEN** the `users` table SHALL exist with columns: `id`, `name`, `email`, `hashed_password`, `role`

#### Scenario: User email is unique
- **WHEN** a second user is inserted with an email that already exists
- **THEN** the database SHALL reject the insertion with a unique constraint violation

#### Scenario: User role is constrained
- **WHEN** a user record is inserted with an invalid role value
- **THEN** the database SHALL reject the insertion with a constraint error

### Requirement: Rental model
The database SHALL contain a `rentals` table linking users to bicycles with rental tracking.

#### Scenario: Rental table is created
- **WHEN** database migrations are applied
- **THEN** the `rentals` table SHALL exist with columns: `id`, `user_id`, `bicycle_id`, `start_time`, `end_time`, `status`

#### Scenario: Rental references valid user
- **WHEN** a rental is inserted with a `user_id` that does not exist in `users`
- **THEN** the database SHALL reject the insertion with a foreign key constraint error

#### Scenario: Rental references valid bicycle
- **WHEN** a rental is inserted with a `bicycle_id` that does not exist in `bicycles`
- **THEN** the database SHALL reject the insertion with a foreign key constraint error

#### Scenario: end_time is nullable
- **WHEN** a rental is created with only `start_time` and no `end_time`
- **THEN** the record SHALL be saved successfully with `end_time` as NULL

### Requirement: Alembic migrations
The project SHALL use Alembic for database schema migrations. An initial migration SHALL be generated from the base models.

#### Scenario: Initial migration creates all tables
- **WHEN** `alembic upgrade head` is executed against a clean database
- **THEN** tables `bicycles`, `users`, and `rentals` SHALL be created
