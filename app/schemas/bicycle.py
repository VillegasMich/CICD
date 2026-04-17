from typing import Optional
from pydantic import BaseModel
from app.models.bicycle import BicycleStatus


class BicycleCreate(BaseModel):
    brand: str
    type: str
    status: BicycleStatus = BicycleStatus.available


class BicycleUpdate(BaseModel):
    brand: Optional[str] = None
    type: Optional[str] = None
    status: Optional[BicycleStatus] = None


class BicycleResponse(BaseModel):
    id: int
    brand: str
    type: str
    status: BicycleStatus

    model_config = {"from_attributes": True}
