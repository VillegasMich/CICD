"""
Integration tests for the auth router — mirrors unit/test_auth.py scope.
"""
from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole


async def test_register(async_client):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert data["role"] == "customer"
    assert "id" in data


async def test_register_existing_email(async_client, db):
    user = User(
        name="Existing User",
        email="test@example.com",
        hashed_password=hash_password("password123"),
        role=UserRole.customer,
    )
    db.add(user)
    await db.commit()

    response = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "New User", "email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


async def test_authenticate(async_client, db):
    user = User(
        name="Test User",
        email="test@example.com",
        hashed_password=hash_password("password123"),
        role=UserRole.customer,
    )
    db.add(user)
    await db.commit()

    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


async def test_get_user_by_id_via_me(async_client, db):
    user = User(
        name="Test User",
        email="test@example.com",
        hashed_password=hash_password("password123"),
        role=UserRole.customer,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id, user.role.value)
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user.id
    assert data["email"] == user.email
    assert data["name"] == user.name


async def test_me_unauthorized(async_client):
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401
