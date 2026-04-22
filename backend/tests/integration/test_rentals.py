async def test_get_all(async_client, customer, bicycle):
    # Two sequential rentals on the same bike; each completed before the next starts
    for _ in range(2):
        r = await async_client.post(
            "/api/v1/rentals",
            json={"bicycle_id": bicycle["id"]},
            headers={"Authorization": f"Bearer {customer['token']}"},
        )
        assert r.status_code == 201
        await async_client.put(
            f"/api/v1/rentals/{r.json()['id']}/complete",
            headers={"Authorization": f"Bearer {customer['token']}"},
        )

    response = await async_client.get(
        "/api/v1/rentals",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert response.status_code == 200


async def test_create_rental(async_client, customer, bicycle):
    response = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": bicycle["id"]},
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["bicycle_id"] == bicycle["id"]
    assert data["user_id"] == customer["id"]
    assert data["status"] == "active"
    # Complete so the bicycle fixture teardown can delete the bike
    await async_client.put(
        f"/api/v1/rentals/{data['id']}/complete",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )


async def test_create_rental_bicycle_not_found(async_client, customer):
    response = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": 999999},
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Bicycle not found"


async def test_create_rental_bicycle_not_available(async_client, customer, bicycle):
    r = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": bicycle["id"]},
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert r.status_code == 201
    rental_id = r.json()["id"]

    response = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": bicycle["id"]},
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Bicycle is not available"

    # Complete so the bicycle fixture teardown can delete the bike
    await async_client.put(
        f"/api/v1/rentals/{rental_id}/complete",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )


async def test_complete_rental(async_client, customer, bicycle):
    r = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": bicycle["id"]},
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert r.status_code == 201
    rental_id = r.json()["id"]

    response = await async_client.put(
        f"/api/v1/rentals/{rental_id}/complete",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == rental_id
    assert data["status"] == "completed"


async def test_complete_rental_not_found(async_client, customer):
    response = await async_client.put(
        "/api/v1/rentals/999999/complete",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Rental not found"


async def test_complete_rental_not_active(async_client, customer, bicycle):
    r = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": bicycle["id"]},
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert r.status_code == 201
    rental_id = r.json()["id"]

    await async_client.put(
        f"/api/v1/rentals/{rental_id}/complete",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )

    response = await async_client.put(
        f"/api/v1/rentals/{rental_id}/complete",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Rental is not active"
