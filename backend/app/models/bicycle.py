import enum
from sqlalchemy import Integer, String, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class BicycleStatus(str, enum.Enum):
    available = "available"
    rented = "rented"


class Bicycle(Base):
    __tablename__ = "bicycles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[BicycleStatus] = mapped_column(
        Enum(BicycleStatus), nullable=False, default=BicycleStatus.available
    )
