# Bicycle Rental App

Web application for managing and renting bicycles. Users can browse available bicycles, rent them from the detail page, and track active/completed rentals. Administrators can manage the inventory. Built as a monolith with a FastAPI backend and a React frontend.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy (async)
- **Frontend:** React, Vite
- **Database:** PostgreSQL 16
- **Migrations:** Alembic
- **Local environment:** Docker

## Prerequisites

- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd CICD
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

The default `.env` values work out of the box with the Docker setup.

### 3. Start the database

```bash
docker-compose up -d db
```

### 4. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 5. Run database migrations

```bash
alembic upgrade head
```

### 6. Start the backend

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### 7. Start the frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

The React app will be available at `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to FastAPI automatically.

## Project Structure

```
/
├── main.py                  # FastAPI entry point
├── requirements.txt         # Python dependencies
├── docker-compose.yml       # Local PostgreSQL setup
├── .env.example             # Environment variables template
├── alembic/                 # Database migrations
├── app/
│   ├── database.py          # DB engine, session, Base
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── routers/             # API route handlers
│   └── services/            # Business logic
└── frontend/
    ├── vite.config.js
    └── src/
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/health` | Health check | No |
| GET | `/api/v1/bicycles` | List all bicycles | No |
| GET | `/api/v1/bicycles/{id}` | Get bicycle by ID | No |
| POST | `/api/v1/bicycles` | Create a bicycle | Admin (TODO) |
| PUT | `/api/v1/bicycles/{id}` | Update a bicycle | Admin (TODO) |
| DELETE | `/api/v1/bicycles/{id}` | Delete a bicycle | Admin (TODO) |
| GET | `/api/v1/rentals` | List all rentals | No |
| POST | `/api/v1/rentals` | Start a rental | Auth (TODO) |
| PUT | `/api/v1/rentals/{id}/complete` | Complete a rental | Auth (TODO) |

## Testing Rentals

Since authentication is not yet implemented, rentals require a `user_id` supplied manually. Insert a test user with:

```bash
python -m scripts.seed_test_user
```

Then use the printed `id` when renting a bicycle from the UI.

## Database Models

| Model | Description |
|-------|-------------|
| `Bicycle` | Rentable bicycles with brand, type and status |
| `User` | Registered users with admin/customer roles |
| `Rental` | Rental records linking users to bicycles |
