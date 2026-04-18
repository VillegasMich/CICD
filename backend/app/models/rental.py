import enum
from datetime import datetime
from sqlalchemy import Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class RentalStatus(str, enum.Enum):
    active = "active"
    completed = "completed"


class Rental(Base):
    __tablename__ = "rentals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    bicycle_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("bicycles.id"), nullable=False
    )
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[RentalStatus] = mapped_column(
        Enum(RentalStatus), nullable=False, default=RentalStatus.active
    )
