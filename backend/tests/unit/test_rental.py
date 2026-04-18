"""
Unit tests for rental service functions.
"""

from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException

import pytest

from app.services.rental import complete, create, get_all
from app.models.bicycle import Bicycle, BicycleStatus
from app.schemas.rental import RentalCreate
from app.models.rental import Rental

@pytest.mark.asyncio
async def test_get_all(db):
    rentals = [
        Rental(id=1, bicycle_id=1, user_id=1, status="active"),
        Rental(id=2, bicycle_id=2, user_id=2, status="completed"),
    ]
    result = MagicMock()
    result.scalars.return_value.all.return_value = rentals
    db.execute.return_value = result

    response = await get_all(db)

    assert response == rentals

@pytest.mark.asyncio
async def test_create_rental(db):
    bike = Bicycle(id=1, brand="Brand A", type="Mountain", status=BicycleStatus.available)
    rental_data = RentalCreate(bicycle_id=1)
    db.get.return_value = bike
    db.commit = AsyncMock()
    db.refresh = AsyncMock()

    response = await create(db, rental_data, user_id=1)

    assert response.bicycle_id == rental_data.bicycle_id
    assert response.user_id == 1
    assert response.status == "active"
    assert bike.status == BicycleStatus.rented

@pytest.mark.asyncio
async def test_create_rental_bicycle_not_found(db):
    db.get.return_value = None
    rental_data = RentalCreate(bicycle_id=999)

    with pytest.raises(HTTPException) as exc_info:
        await create(db, rental_data, user_id=1)
        assert exc_info.value.status_code == 404

@pytest.mark.asyncio
async def test_create_rental_bicycle_not_available(db):
    bike = Bicycle(id=1, brand="Brand A", type="Mountain", status=BicycleStatus.rented)
    rental_data = RentalCreate(bicycle_id=1)

    db.get.return_value = bike

    with pytest.raises(HTTPException) as exc_info:
        await create(db, rental_data, user_id=1)
        assert exc_info.value.status_code == 400

@pytest.mark.asyncio
async def test_complete_rental(db):
    rental = Rental(id=1, bicycle_id=1, user_id=1, status="active")
    bike = Bicycle(id=1, brand="Brand A", type="Mountain", status=BicycleStatus.rented)
    
    db.get.side_effect = [rental, bike]
    db.commit = AsyncMock()
    db.refresh = AsyncMock()

    response = await complete(db, 1)

    assert response.status == "completed"
    assert bike.status == BicycleStatus.available

@pytest.mark.asyncio
async def test_complete_rental_not_found(db):
    db.get.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        await complete(db, 999)
        assert exc_info.value.status_code == 404

@pytest.mark.asyncio
async def test_complete_rental_not_active(db):
    rental = Rental(id=1, bicycle_id=1, user_id=1, status="completed")
    db.get.return_value = rental

    with pytest.raises(HTTPException) as exc_info:
        await complete(db, 1)
        assert exc_info.value.status_code == 400
