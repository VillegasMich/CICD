## Why

The project has no application code yet. We need to establish the foundational structure of the monolith — backend (FastAPI) and frontend (React) — including database configuration, folder layout, and base dependencies, so that all future features (bicycle CRUD, rentals, auth) can be built on top of a consistent and working base.

## What Changes

- Initialize the FastAPI backend project structure under `app/` with routers, models, schemas, services, and database modules
- Initialize the React frontend project under `frontend/` using Vite
- Configure SQLAlchemy with async support and a base database session
- Create the initial SQLAlchemy models for `Bicycle`, `User`, and `Rental`
- Add a health-check endpoint at `GET /api/v1/health`
- Add project-level configuration files: `requirements.txt`, `.env.example`, `main.py`

## Capabilities

### New Capabilities

- `project-structure`: Monolith folder layout, entry point (`main.py`), and configuration for both backend and frontend
- `database-setup`: SQLAlchemy async engine, session factory, base model, and initial table definitions for `Bicycle`, `User`, and `Rental`

### Modified Capabilities

None — this is the initial setup, no existing specs to modify.

## Non-goals

- No authentication logic (JWT will be a separate change)
- No CRUD endpoints for bicycles or rentals (separate changes)
- No UI components beyond the React scaffold
- No deployment or CI/CD configuration

## Impact

- Creates `app/` directory with backend structure
- Creates `frontend/` directory with React + Vite scaffold
- Creates `main.py` as the FastAPI entry point
- Creates `requirements.txt` with core dependencies (fastapi, uvicorn, sqlalchemy, alembic, pydantic)
- No existing code is modified (greenfield)
