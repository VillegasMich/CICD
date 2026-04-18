from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.rental import RentalCreate, RentalResponse
from app.services import rental as rental_service

router = APIRouter(tags=["rentals"])


@router.get("", response_model=list[RentalResponse])
async def list_rentals(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return await rental_service.get_all(db)


@router.post("", response_model=RentalResponse, status_code=201)
async def start_rental(
    data: RentalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await rental_service.create(db, data, current_user.id)


@router.put("/{rental_id}/complete", response_model=RentalResponse)
async def complete_rental(
    rental_id: int,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return await rental_service.complete(db, rental_id)
