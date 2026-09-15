import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FoodSource(str, enum.Enum):
    seed = "seed"  # базовый справочник
    ai_estimate = "ai_estimate"  # оценка через распознавание фото
    user = "user"  # добавлено пользователем вручную


class FoodItem(Base):
    """Справочник продуктов: КБЖУ в расчёте на 100г."""

    __tablename__ = "food_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    source: Mapped[FoodSource] = mapped_column(Enum(FoodSource, name="food_source_enum"), default=FoodSource.user)

    calories_per_100g: Mapped[float] = mapped_column(Float, nullable=False)
    protein_per_100g: Mapped[float] = mapped_column(Float, nullable=False)
    fat_per_100g: Mapped[float] = mapped_column(Float, nullable=False)
    carbs_per_100g: Mapped[float] = mapped_column(Float, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
