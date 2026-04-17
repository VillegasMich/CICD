from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.bicycle import Bicycle, BicycleStatus
from app.models.rental import Rental, RentalStatus
from app.schemas.rental import RentalCreate


async def get_all(db: AsyncSession) -> list[Rental]:
    result = await db.execute(select(Rental))
    return result.scalars().all()


async def create(db: AsyncSession, data: RentalCreate) -> Rental:
    bicycle = await db.get(Bicycle, data.bicycle_id)
    if not bicycle:
        raise HTTPException(status_code=404, detail="Bicycle not found")
    if bicycle.status != BicycleStatus.available:
        raise HTTPException(status_code=400, detail="Bicycle is not available")

    bicycle.status = BicycleStatus.rented
    rental = Rental(
        bicycle_id=data.bicycle_id,
        user_id=data.user_id,
        start_time=datetime.utcnow(),
        status=RentalStatus.active,
    )
    db.add(rental)
    await db.commit()
    await db.refresh(rental)
    return rental


async def complete(db: AsyncSession, rental_id: int) -> Rental:
    rental = await db.get(Rental, rental_id)
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    if rental.status != RentalStatus.active:
        raise HTTPException(status_code=400, detail="Rental is not active")

    rental.end_time = datetime.utcnow()
    rental.status = RentalStatus.completed

    bicycle = await db.get(Bicycle, rental.bicycle_id)
    if bicycle:
        bicycle.status = BicycleStatus.available

    await db.commit()
    await db.refresh(rental)
    return rental
