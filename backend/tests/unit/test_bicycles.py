"""
 Unit tests for the bicycles endpoint.
"""
from unittest.mock import AsyncMock, MagicMock

from fastapi import HTTPException
import pytest
from app.models.bicycle import Bicycle, BicycleStatus
from app.schemas.bicycle import BicycleCreate, BicycleUpdate
from app.services.bicycle import delete, get_by_id, update, create, get_all

@pytest.mark.asyncio
async def test_get_bicycles(db):
    bikes = [
        Bicycle(id=1, brand="Brand A", type="Mountain", status=BicycleStatus.rented),
        Bicycle(id=2, brand="Brand B", type="Road", status=BicycleStatus.available),
    ]
    result = MagicMock()
    result.scalars.return_value.all.return_value = bikes
    db.execute.return_value = result

    response = await get_all(db)

    assert response == bikes

@pytest.mark.asyncio
async def test_get_bicycle_by_id(db):
    bike = Bicycle(id=1, brand="Brand A", type="Mountain", status=BicycleStatus.rented)
    result = MagicMock()
    result.scalar_one_or_none.return_value = bike
    db.execute.return_value = result

    response = await get_by_id(db, 1)

    assert response == bike

@pytest.mark.asyncio
async def test_get_bicycle_by_id_not_found(db):
    result = MagicMock()
    result.scalar_one_or_none.return_value = None
    db.execute.return_value = result

    with pytest.raises(HTTPException) as exc_info:
        await get_by_id(db, 999)
        assert exc_info.value.status_code == 404

@pytest.mark.asyncio
async def test_create_bicycle(db):
    bike_data = BicycleCreate(brand="Brand A", type="Mountain", status=BicycleStatus.available) 
    db.commit = AsyncMock()
    db.refresh = AsyncMock()

    response = await create(db, bike_data)

    assert response.brand == bike_data.brand
    assert response.type == bike_data.type

@pytest.mark.asyncio
async def test_update_bicycle(db):
    bike = Bicycle(id=1, brand="Brand A", type="Mountain", status=BicycleStatus.available)
    db.commit = AsyncMock()
    db.refresh = AsyncMock()

    result = MagicMock()
    result.scalar_one_or_none.return_value = bike
    db.execute.return_value = result

    update_data = BicycleUpdate(brand="Brand B", type="Mountain")
    response = await update(db, 1, update_data)

    assert response.brand == "Brand B"
    assert response.type == "Mountain"

@pytest.mark.asyncio
async def test_delete_bicycle(db):
    bike = Bicycle(id=1, brand="Brand A", type="Mountain", status=BicycleStatus.available)

    bike_result = MagicMock()
    bike_result.scalar_one_or_none.return_value = bike

    no_active_rental = MagicMock()
    no_active_rental.scalar_one_or_none.return_value = None

    db.execute.side_effect = [bike_result, no_active_rental]
    db.delete = AsyncMock()
    db.commit = AsyncMock()

    response = await delete(db, 1)

    assert response is None
    db.delete.assert_awaited_once_with(bike)
    db.commit.assert_awaited_once()

@pytest.mark.asyncio
async def test_delete_bicycle_with_active_rental(db):
    bike = Bicycle(id=1, brand="Brand A", type="Mountain", status=BicycleStatus.rented)

    bike_result = MagicMock()
    bike_result.scalar_one_or_none.return_value = bike

    active_rental = MagicMock()
    active_rental.scalar_one_or_none.return_value = True

    db.execute.side_effect = [bike_result, active_rental]
    db.delete = AsyncMock()
    db.commit = AsyncMock()

    with pytest.raises(HTTPException) as exc_info:
        await delete(db, 1)
        assert exc_info.value.status_code == 400
        db.delete.assert_not_awaited()
        db.commit.assert_not_awaited()


