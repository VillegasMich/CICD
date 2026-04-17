## 1. Project Root Configuration

- [x] 1.1 Create `requirements.txt` with dependencies: `fastapi`, `uvicorn[standard]`, `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `pydantic`, `pydantic-settings`, `python-dotenv`
- [x] 1.2 Create `.env.example` with variable: `DATABASE_URL=postgresql+asyncpg://bikes:bikes1234@localhost:5432/bikes_project`
- [x] 1.3 Create `.gitignore` including `.env`, `__pycache__/`, `*.pyc`, `.venv/`
- [x] 1.4 Create `docker-compose.yml` with PostgreSQL 16 service (user: `bikes`, password: `bikes1234`, db: `bikes_project`, port: `5432`, volume-backed)

## 2. Backend Folder Structure

- [x] 2.1 Create `app/__init__.py` (empty)
- [x] 2.2 Create `app/models/__init__.py` (empty)
- [x] 2.3 Create `app/schemas/__init__.py` (empty)
- [x] 2.4 Create `app/routers/__init__.py` (empty)
- [x] 2.5 Create `app/services/__init__.py` (empty)

## 3. Database Configuration

- [x] 3.1 Create `app/database.py` with: async engine from `DATABASE_URL`, `AsyncSessionLocal` factory, `Base` declarative class, and `get_db` async dependency function
- [x] 3.2 Initialize Alembic: run `alembic init alembic` and update `alembic.ini` to use `DATABASE_URL` from environment
- [x] 3.3 Update `alembic/env.py` to import `Base` metadata and use the async engine

## 4. Database Models

- [x] 4.1 Create `app/models/bicycle.py` with `Bicycle` model: `id` (PK), `brand` (String), `type` (String), `status` (Enum: `available`, `rented`)
- [x] 4.2 Create `app/models/user.py` with `User` model: `id` (PK), `name` (String), `email` (String, unique), `hashed_password` (String), `role` (Enum: `admin`, `customer`)
- [x] 4.3 Create `app/models/rental.py` with `Rental` model: `id` (PK), `user_id` (FK → users), `bicycle_id` (FK → bicycles), `start_time` (DateTime), `end_time` (DateTime, nullable), `status` (Enum: `active`, `completed`)
- [x] 4.4 Update `app/models/__init__.py` to import all three models so Alembic detects them
- [x] 4.5 Generate initial Alembic migration: `alembic revision --autogenerate -m "initial schema"`

## 5. FastAPI Entry Point

- [x] 5.1 Create `main.py` with FastAPI app instance, include API router with prefix `/api/v1`, and mount static files for the React frontend build (`frontend/dist`)
- [x] 5.2 Create `app/routers/health.py` with `GET /health` endpoint returning `{"status": "ok"}`
- [x] 5.3 Register the health router in `main.py`

## 6. React Frontend Scaffold

- [x] 6.1 Scaffold React app with Vite inside `frontend/`: `npm create vite@latest frontend -- --template react`
- [x] 6.2 Update `frontend/vite.config.js` to add a proxy: forward `/api` requests to `http://localhost:8000`
- [x] 6.3 Add `frontend/` to `.gitignore` exclusions for `node_modules/` and `dist/`

## 7. Verification

- [x] 7.1 Start the database with `docker-compose up -d db` and verify PostgreSQL is accessible at `localhost:5432`
- [x] 7.2 Run `alembic upgrade head` and confirm tables `bicycles`, `users`, `rentals` are created
- [x] 7.3 Start the FastAPI server with `uvicorn main:app --reload` and confirm `GET /api/v1/health` returns `{"status": "ok"}`
- [x] 7.4 Start the frontend dev server with `npm run dev` inside `frontend/` and confirm the React app loads in the browser
