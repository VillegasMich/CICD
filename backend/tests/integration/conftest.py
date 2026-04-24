import os
import uuid

import pytest
from httpx import AsyncClient
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


@pytest.fixture
async def async_client():
    async with AsyncClient(base_url=BACKEND_URL) as ac:
        yield ac


@pytest.fixture
async def customer(async_client):
    email = f"customer_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"
    r = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Test Customer", "email": email, "password": password},
    )
    assert r.status_code == 201
    user_id = r.json()["id"]
    r = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert r.status_code == 200
    return {"id": user_id, "email": email, "password": password, "token": r.json()["access_token"]}


@pytest.fixture
async def admin_token(async_client):
    r = await async_client.post(
        "/api/v1/auth/login",
        json={"email": os.getenv("ADMIN_EMAIL"), "password": os.getenv("ADMIN_PASSWORD")},
    )
    assert r.status_code == 200
    return r.json()["access_token"]


@pytest.fixture
async def bicycle(async_client, admin_token):
    r = await async_client.post(
        "/api/v1/bicycles",
        json={"brand": "Test Brand", "type": "Mountain", "status": "available"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 201
    bike = r.json()
    yield bike
    await async_client.delete(
        f"/api/v1/bicycles/{bike['id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
