from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.bicycle import BicycleCreate, BicycleUpdate, BicycleResponse
from app.services import bicycle as bicycle_service

router = APIRouter(tags=["bicycles"])


@router.get("/", response_model=list[BicycleResponse])
async def list_bicycles(db: AsyncSession = Depends(get_db)):
    return await bicycle_service.get_all(db)


@router.get("/{bicycle_id}", response_model=BicycleResponse)
async def get_bicycle(bicycle_id: int, db: AsyncSession = Depends(get_db)):
    return await bicycle_service.get_by_id(db, bicycle_id)


@router.post("/", response_model=BicycleResponse, status_code=201)
async def create_bicycle(data: BicycleCreate, db: AsyncSession = Depends(get_db)):
    # TODO: restrict to admin role once auth is implemented
    return await bicycle_service.create(db, data)


@router.put("/{bicycle_id}", response_model=BicycleResponse)
async def update_bicycle(bicycle_id: int, data: BicycleUpdate, db: AsyncSession = Depends(get_db)):
    # TODO: restrict to admin role once auth is implemented
    return await bicycle_service.update(db, bicycle_id, data)


@router.delete("/{bicycle_id}", status_code=204)
async def delete_bicycle(bicycle_id: int, db: AsyncSession = Depends(get_db)):
    # TODO: restrict to admin role once auth is implemented
    await bicycle_service.delete(db, bicycle_id)
