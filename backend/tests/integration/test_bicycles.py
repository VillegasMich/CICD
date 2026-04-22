async def test_get_bicycles(async_client, bicycle):
    response = await async_client.get("/api/v1/bicycles")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_get_bicycle_by_id(async_client, bicycle):
    response = await async_client.get(f"/api/v1/bicycles/{bicycle['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == bicycle["id"]
    assert data["brand"] == "Test Brand"
    assert data["type"] == "Mountain"


async def test_get_bicycle_by_id_not_found(async_client):
    response = await async_client.get("/api/v1/bicycles/999999")
    assert response.status_code == 404


async def test_create_bicycle(async_client, admin_token):
    response = await async_client.post(
        "/api/v1/bicycles",
        json={"brand": "Brand A", "type": "Mountain", "status": "available"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["brand"] == "Brand A"
    assert data["type"] == "Mountain"
    assert data["status"] == "available"
    await async_client.delete(
        f"/api/v1/bicycles/{data['id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )


async def test_update_bicycle(async_client, admin_token, bicycle):
    response = await async_client.put(
        f"/api/v1/bicycles/{bicycle['id']}",
        json={"brand": "Brand B", "type": "Mountain"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["brand"] == "Brand B"
    assert data["type"] == "Mountain"


async def test_delete_bicycle(async_client, admin_token):
    r = await async_client.post(
        "/api/v1/bicycles",
        json={"brand": "To Delete", "type": "Road", "status": "available"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 201
    response = await async_client.delete(
        f"/api/v1/bicycles/{r.json()['id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 204


async def test_delete_bicycle_with_active_rental(async_client, admin_token, customer, bicycle):
    r = await async_client.post(
        "/api/v1/rentals",
        json={"bicycle_id": bicycle["id"]},
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
    assert r.status_code == 201
    rental_id = r.json()["id"]

    response = await async_client.delete(
        f"/api/v1/bicycles/{bicycle['id']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot delete a bicycle with an active rental"

    # Complete the rental so the bicycle fixture teardown can delete the bike
    await async_client.put(
        f"/api/v1/rentals/{rental_id}/complete",
        headers={"Authorization": f"Bearer {customer['token']}"},
    )
