import uuid


async def test_register(async_client):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": email, "password": "password123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert data["name"] == "Test User"
    assert data["role"] == "customer"
    assert "id" in data


async def test_register_existing_email(async_client):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    await async_client.post(
        "/api/v1/auth/register",
        json={"name": "First User", "email": email, "password": "password123"},
    )
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Second User", "email": email, "password": "password123"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


async def test_authenticate(async_client):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": email, "password": "password123"},
    )
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


async def test_get_user_by_id_via_me(async_client, customer):
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == customer["id"]
    assert data["email"] == customer["email"]


async def test_me_unauthorized(async_client):
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401
