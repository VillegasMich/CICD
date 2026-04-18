"""
Integration tests for the bicycles router — mirrors unit/test_bicycles.py scope.
"""
from datetime import datetime

from app.core.security import create_access_token, hash_password
from app.models.bicycle import Bicycle, BicycleStatus
from app.models.rental import Rental, RentalStatus
from app.models.user import User, UserRole


def _admin(db):
    user = User(
        name="Admin User",
        email="admin@example.com",
        hashed_password=hash_password("adminpass"),
        role=UserRole.admin,
    )
    db.add(user)
    return user


async def test_get_bicycles(async_client, db):
    db.add(Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.rented))
    db.add(Bicycle(brand="Brand B", type="Road", status=BicycleStatus.available))
    await db.commit()

    response = await async_client.get("/api/v1/bicycles")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert {b["brand"] for b in data} == {"Brand A", "Brand B"}


async def test_get_bicycle_by_id(async_client, db):
    bike = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.available)
    db.add(bike)
    await db.commit()
    await db.refresh(bike)

    response = await async_client.get(f"/api/v1/bicycles/{bike.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == bike.id
    assert data["brand"] == "Brand A"
    assert data["type"] == "Mountain"


async def test_get_bicycle_by_id_not_found(async_client):
    response = await async_client.get("/api/v1/bicycles/999")
    assert response.status_code == 404


async def test_create_bicycle(async_client, db):
    admin = _admin(db)
    await db.commit()
    await db.refresh(admin)
    token = create_access_token(admin.id, admin.role.value)

    response = await async_client.post(
        "/api/v1/bicycles",
        json={"brand": "Brand A", "type": "Mountain", "status": "available"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["brand"] == "Brand A"
    assert data["type"] == "Mountain"
    assert data["status"] == "available"


async def test_update_bicycle(async_client, db):
    admin = _admin(db)
    bike = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.available)
    db.add(bike)
    await db.commit()
    await db.refresh(admin)
    await db.refresh(bike)
    token = create_access_token(admin.id, admin.role.value)

    response = await async_client.put(
        f"/api/v1/bicycles/{bike.id}",
        json={"brand": "Brand B", "type": "Mountain"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["brand"] == "Brand B"
    assert data["type"] == "Mountain"


async def test_delete_bicycle(async_client, db):
    admin = _admin(db)
    bike = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.available)
    db.add(bike)
    await db.commit()
    await db.refresh(admin)
    await db.refresh(bike)
    token = create_access_token(admin.id, admin.role.value)

    response = await async_client.delete(
        f"/api/v1/bicycles/{bike.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204


async def test_delete_bicycle_with_active_rental(async_client, db):
    admin = _admin(db)
    customer = User(
        name="Customer",
        email="customer@example.com",
        hashed_password=hash_password("pass123"),
        role=UserRole.customer,
    )
    bike = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.rented)
    db.add(customer)
    db.add(bike)
    await db.commit()
    await db.refresh(admin)
    await db.refresh(customer)
    await db.refresh(bike)

    rental = Rental(
        bicycle_id=bike.id,
        user_id=customer.id,
        start_time=datetime.utcnow(),
        status=RentalStatus.active,
    )
    db.add(rental)
    await db.commit()

    token = create_access_token(admin.id, admin.role.value)
    response = await async_client.delete(
        f"/api/v1/bicycles/{bike.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot delete a bicycle with an active rental"
