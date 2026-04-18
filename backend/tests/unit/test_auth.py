
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException

import pytest

from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.services.auth import authenticate, get_user_by_email, get_user_by_id, register

@pytest.mark.asyncio
async def test_get_user_by_email(db):
    user = User(id=1, name="Test User", email="test@example.com", hashed_password="hashed", role=UserRole.customer)
    result = MagicMock()
    db.execute.return_value = result
    result.scalar_one_or_none.return_value = user

    response = await get_user_by_email(db, "test@example.com")

    assert response == user

@pytest.mark.asyncio
async def test_get_user_by_email_not_found(db):
    result = MagicMock()
    db.execute.return_value = result
    result.scalar_one_or_none.return_value = None

    response = await get_user_by_email(db, "nonexistent@example.com")

    assert response is None

@pytest.mark.asyncio
async def test_get_user_by_id(db):
    user = User(id=1, name="Test User", email="test@example.com", hashed_password="hashed", role=UserRole.customer)
    db.get.return_value = user
    response = await get_user_by_id(db, 1)

    assert response == user

@pytest.mark.asyncio
async def test_register(db):
    from app.schemas.auth import RegisterRequest
    data = RegisterRequest(name="Test User", email="test@example.com", password="password123")

    no_existing = MagicMock()
    no_existing.scalar_one_or_none.return_value = None
    db.execute.return_value = no_existing
    db.commit = AsyncMock()
    db.refresh = AsyncMock()

    response = await register(db, data)

    assert response.name == data.name
    assert response.email == data.email
    assert response.hashed_password != data.password

@pytest.mark.asyncio
async def test_register_existing_email(db):
    existing_user = User(id=1, name="Existing User", email="test@example.com", hashed_password="hashed", role=UserRole.customer)
    result = MagicMock()
    db.execute.return_value = result
    result.scalar_one_or_none.return_value = existing_user
    with pytest.raises(HTTPException) as exc_info:
        await register(db, existing_user)
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email already registered"

@pytest.mark.asyncio
async def test_authenticate(db):
    from app.core.security import hash_password
    plain_password = "password123"
    user = User(id=1, name="Test User", email="test@example.com",
                hashed_password=hash_password(plain_password), role=UserRole.customer)
    result = MagicMock()
    db.execute.return_value = result
    result.scalar_one_or_none.return_value = user

    response = await authenticate(db, "test@example.com", plain_password)

    assert decode_access_token(response)["sub"] == str(user.id)
