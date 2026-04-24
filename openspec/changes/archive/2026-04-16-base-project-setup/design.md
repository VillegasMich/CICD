## Context

The repository is currently empty (no application code). This design defines the folder structure, technical decisions, and conventions that every future feature will follow. Getting this right upfront prevents structural refactors later.

## Goals / Non-Goals

**Goals:**
- Define a clear, scalable folder structure for both backend and frontend
- Set up FastAPI with async SQLAlchemy and a working database connection
- Scaffold the React frontend with Vite
- Create base SQLAlchemy models for the three core entities
- Establish a single entry point (`main.py`) that wires everything together

**Non-Goals:**
- Authentication/authorization (separate change)
- Business logic endpoints (CRUD, rentals — separate changes)
- Frontend UI components or routing

## Decisions

### 1. Single-repo monolith
Both frontend and backend live in the same repository. The FastAPI app serves the built React assets in production via `StaticFiles`.

**Rationale:** Simplifies deployment, version control, and team coordination for a project of this scope. A microservices split would add overhead with no benefit at this stage.

**Alternative considered:** Separate repos for frontend/backend — rejected due to added CI complexity.

### 2. Folder structure

```
/
├── main.py                  # FastAPI entry point
├── requirements.txt
├── .env.example
├── app/
│   ├── database.py          # Engine, session factory, Base
│   ├── models/
│   │   ├── bicycle.py
│   │   ├── user.py
│   │   └── rental.py
│   ├── schemas/             # Pydantic request/response models
│   ├── routers/             # APIRouter per entity
│   └── services/            # Business logic layer
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        └── main.jsx
```

**Rationale:** Separating models, schemas, routers, and services follows a clean layered architecture that scales well as features are added. Each layer has a single responsibility.

### 3. Async SQLAlchemy
Use `AsyncSession` with `asyncpg` for PostgreSQL in all environments.

**Rationale:** FastAPI is async-first. Using sync SQLAlchemy sessions would block the event loop under load. Async sessions align with the framework's design.

**Alternative considered:** Sync SQLAlchemy — simpler but incompatible with async endpoints.

### 4. PostgreSQL in all environments via Docker
PostgreSQL is used in both development and production. A `docker-compose.yml` at the project root spins up the database locally with a single command.

```
docker-compose up -d db
```

The `DATABASE_URL` is set via `.env` and `.env.example` documents the required variables.

**Rationale:** Using the same database engine in development and production eliminates an entire class of bugs caused by SQLite/PostgreSQL behavioral differences (type handling, constraints, date formats, etc.). Docker removes the need for manual PostgreSQL installation — every developer gets an identical environment instantly.

**Alternative considered:** SQLite for development — rejected because it silently masks real database behavior and has caused production bugs in practice.

**docker-compose.yml (database service):**
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: bikes
      POSTGRES_PASSWORD: bikes1234
      POSTGRES_DB: bikes_project
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 5. Database models

**Bicycle**
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | auto-increment |
| brand | String | required |
| type | String | e.g. mountain, road, urban |
| status | Enum | available / rented |

**User**
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | auto-increment |
| name | String | required |
| email | String | unique |
| hashed_password | String | never store plaintext |
| role | Enum | admin / customer |

**Rental**
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | auto-increment |
| user_id | FK → User | |
| bicycle_id | FK → Bicycle | |
| start_time | DateTime | UTC |
| end_time | DateTime | nullable until completed |
| status | Enum | active / completed |

### 6. Health-check endpoint

`GET /api/v1/health` returns `{"status": "ok"}`. No auth required.

**Rationale:** Provides a minimal endpoint to verify the server is running before any feature is built.

## Risks / Trade-offs

- **Async complexity** → Mitigation: keep service functions simple at this stage; async is mostly transparent with SQLAlchemy 2.x.
- **Docker required for development** → Mitigation: document clearly in README; Docker Desktop is available for Windows, Mac, and Linux and is standard in most teams.
- **Vite dev server vs FastAPI dev server** (two processes in development) → Mitigation: document in README how to run both; configure Vite proxy to forward `/api` requests to FastAPI.

## Migration Plan

This is a greenfield setup — no migration needed. Running `alembic init` and the first `alembic revision --autogenerate` will create the initial schema from the models.

## Open Questions

- Should `alembic` be configured in this change or deferred to the first feature that writes to the database?
- Does the team want a `Makefile` or `justfile` for common dev commands (`make run`, `make migrate`, etc.)?
