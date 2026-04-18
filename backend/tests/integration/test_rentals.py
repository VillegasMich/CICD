"""
Integration tests for the rentals router — mirrors unit/test_rental.py scope.
"""
from datetime import datetime

from app.core.security import create_access_token, hash_password
from app.models.bicycle import Bicycle, BicycleStatus
from app.models.rental import Rental, RentalStatus
from app.models.user import User, UserRole


def _customer(db):
    user = User(
        name="Test Customer",
        email="customer@example.com",
        hashed_password=hash_password("pass123"),
        role=UserRole.customer,
    )
    db.add(user)
    return user


async def test_get_all(async_client, db):
    customer = _customer(db)
    bike1 = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.rented)
    bike2 = Bicycle(brand="Brand B", type="Road", status=BicycleStatus.rented)
    db.add(bike1)
    db.add(bike2)
    await db.commit()
    await db.refresh(customer)
    await db.refresh(bike1)
    await db.refresh(bike2)

    rental1 = Rental(bicycle_id=bike1.id, user_id=customer.id, start_time=datetime.utcnow(), status=RentalStatus.active)
    rental2 = Rental(bicycle_id=bike2.id, user_id=customer.id, start_time=datetime.utcnow(), status=RentalStatus.completed)
    db.add(rental1)
    db.add(rental2)
    await db.commit()

    token = create_access_token(customer.id, customer.role.value)
    response = await async_client.get(
        "/api/v1/rentals",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_create_rental(async_client, db):
    customer = _customer(db)
    bike = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.available)
    db.add(bike)
    await db.commit()
    await db.refresh(customer)
    await db.refresh(bike)

    token = create_access_token(customer.id, customer.role.value)
    response = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": bike.id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["bicycle_id"] == bike.id
    assert data["user_id"] == customer.id
    assert data["status"] == "active"


async def test_create_rental_bicycle_not_found(async_client, db):
    customer = _customer(db)
    await db.commit()
    await db.refresh(customer)

    token = create_access_token(customer.id, customer.role.value)
    response = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": 999},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Bicycle not found"


async def test_create_rental_bicycle_not_available(async_client, db):
    customer = _customer(db)
    bike = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.rented)
    db.add(bike)
    await db.commit()
    await db.refresh(customer)
    await db.refresh(bike)

    token = create_access_token(customer.id, customer.role.value)
    response = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": bike.id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Bicycle is not available"


async def test_complete_rental(async_client, db):
    customer = _customer(db)
    bike = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.rented)
    db.add(bike)
    await db.commit()
    await db.refresh(customer)
    await db.refresh(bike)

    rental = Rental(bicycle_id=bike.id, user_id=customer.id, start_time=datetime.utcnow(), status=RentalStatus.active)
    db.add(rental)
    await db.commit()
    await db.refresh(rental)

    token = create_access_token(customer.id, customer.role.value)
    response = await async_client.put(
        f"/api/v1/rentals/{rental.id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == rental.id
    assert data["status"] == "completed"


async def test_complete_rental_not_found(async_client, db):
    customer = _customer(db)
    await db.commit()
    await db.refresh(customer)

    token = create_access_token(customer.id, customer.role.value)
    response = await async_client.put(
        "/api/v1/rentals/999/complete",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Rental not found"


async def test_complete_rental_not_active(async_client, db):
    customer = _customer(db)
    bike = Bicycle(brand="Brand A", type="Mountain", status=BicycleStatus.available)
    db.add(bike)
    await db.commit()
    await db.refresh(customer)
    await db.refresh(bike)

    rental = Rental(bicycle_id=bike.id, user_id=customer.id, start_time=datetime.utcnow(), status=RentalStatus.completed)
    db.add(rental)
    await db.commit()
    await db.refresh(rental)

    token = create_access_token(customer.id, customer.role.value)
    response = await async_client.put(
        f"/api/v1/rentals/{rental.id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Rental is not active"
