## ADDED Requirements

### Requirement: Monolith folder structure
The repository SHALL follow a predefined folder structure separating backend (`app/`) and frontend (`frontend/`) within a single repo. The FastAPI entry point SHALL be `main.py` at the root level.

#### Scenario: Backend directories exist
- **WHEN** the repository is cloned
- **THEN** the following directories SHALL exist: `app/models/`, `app/schemas/`, `app/routers/`, `app/services/`

#### Scenario: Frontend scaffold exists
- **WHEN** the repository is cloned
- **THEN** the `frontend/` directory SHALL contain a Vite-based React project with `package.json` and `src/main.jsx`

#### Scenario: Entry point is runnable
- **WHEN** `uvicorn main:app --reload` is executed from the project root
- **THEN** the FastAPI application SHALL start without errors

### Requirement: Environment configuration
The project SHALL provide a `.env.example` file documenting all required environment variables. A `.env` file SHALL never be committed to version control.

#### Scenario: Example env file exists
- **WHEN** the repository is cloned
- **THEN** `.env.example` SHALL exist at the project root and include at minimum: `DATABASE_URL`

#### Scenario: .env is ignored by git
- **WHEN** a `.env` file is created locally
- **THEN** git SHALL not track it (it MUST be listed in `.gitignore`)

### Requirement: Dependency manifest
The project SHALL declare all Python dependencies in `requirements.txt` at the project root.

#### Scenario: Core dependencies are declared
- **WHEN** `requirements.txt` is read
- **THEN** it SHALL include at minimum: `fastapi`, `uvicorn`, `sqlalchemy`, `asyncpg`, `alembic`, `pydantic`, `python-dotenv`

#### Scenario: Dependencies are installable
- **WHEN** `pip install -r requirements.txt` is executed in a clean Python environment
- **THEN** all packages SHALL install without conflicts

### Requirement: Health-check endpoint
The API SHALL expose a health-check endpoint that returns the server status without requiring authentication.

#### Scenario: Health check returns 200
- **WHEN** a GET request is made to `/api/v1/health`
- **THEN** the response SHALL have status code 200 and body `{"status": "ok"}`

#### Scenario: Health check requires no auth
- **WHEN** a GET request is made to `/api/v1/health` without any Authorization header
- **THEN** the response SHALL still return 200

### Requirement: Docker-based local database
The project SHALL include a `docker-compose.yml` that provisions a PostgreSQL database for local development.

#### Scenario: Database starts with Docker
- **WHEN** `docker-compose up -d db` is executed
- **THEN** a PostgreSQL 16 instance SHALL be accessible at `localhost:5432` with the credentials defined in `docker-compose.yml`

#### Scenario: Data persists across restarts
- **WHEN** the Docker container is stopped and restarted
- **THEN** previously created data SHALL still be present (volume-backed persistence)
