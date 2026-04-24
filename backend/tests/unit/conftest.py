import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
os.environ.setdefault("JWT_SECRET", "test-secret")

from unittest.mock import AsyncMock

from fastapi.testclient import TestClient
import pytest
from main import app
from app.database import get_db

@pytest.fixture
def db():
    return AsyncMock()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()
    