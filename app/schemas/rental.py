from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.rental import RentalStatus


class RentalCreate(BaseModel):
    bicycle_id: int
    user_id: int


class RentalResponse(BaseModel):
    id: int
    bicycle_id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: RentalStatus

    model_config = {"from_attributes": True}
