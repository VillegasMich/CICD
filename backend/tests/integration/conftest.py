import os

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

# JWT_SECRET must be set before app is imported so Settings() validates cleanly.
# DATABASE_URL must be provided by the environment (Docker / CI staging).
os.environ.setdefault("JWT_SECRET", "test-secret")

if not os.getenv("DATABASE_URL"):
    raise RuntimeError(
        "DATABASE_URL is not set. Integration tests must be run inside the Docker "
        "container where the staging database is available."
    )

from main import app
from app.database import Base, get_db


test_engine = create_async_engine(os.getenv("DATABASE_URL"), echo=False, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@pytest.fixture(autouse=True)
async def clean_db():
    yield
    async with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())


@pytest.fixture
async def db():
    async with TestSessionLocal() as session:
        yield session


@pytest.fixture
async def async_client():
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
