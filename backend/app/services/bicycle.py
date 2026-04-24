from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.bicycle import Bicycle
from app.models.rental import Rental, RentalStatus
from app.schemas.bicycle import BicycleCreate, BicycleUpdate


async def get_all(db: AsyncSession) -> list[Bicycle]:
    result = await db.execute(select(Bicycle))
    return result.scalars().all()


async def get_by_id(db: AsyncSession, bicycle_id: int) -> Bicycle:
    result = await db.execute(select(Bicycle).where(Bicycle.id == bicycle_id))
    bicycle = result.scalar_one_or_none()
    if not bicycle:
        raise HTTPException(status_code=404, detail="Bicycle not found")
    return bicycle


async def create(db: AsyncSession, data: BicycleCreate) -> Bicycle:
    bicycle = Bicycle(**data.model_dump())
    db.add(bicycle)
    await db.commit()
    await db.refresh(bicycle)
    return bicycle


async def update(db: AsyncSession, bicycle_id: int, data: BicycleUpdate) -> Bicycle:
    bicycle = await get_by_id(db, bicycle_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(bicycle, field, value)
    await db.commit()
    await db.refresh(bicycle)
    return bicycle


async def delete(db: AsyncSession, bicycle_id: int) -> None:
    bicycle = await get_by_id(db, bicycle_id)
    active_rental = await db.execute(
        select(Rental).where(
            Rental.bicycle_id == bicycle_id,
            Rental.status == RentalStatus.active,
        )
    )
    if active_rental.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Cannot delete a bicycle with an active rental"
        )
    await db.delete(bicycle)
    await db.commit()
