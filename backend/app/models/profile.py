import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Sex(str, enum.Enum):
    male = "male"
    female = "female"


class ActivityLevel(str, enum.Enum):
    sedentary = "sedentary"  # мало/нет физической активности
    light = "light"  # лёгкая активность 1-3 раза в неделю
    moderate = "moderate"  # умеренная активность 3-5 раз в неделю
    active = "active"  # высокая активность 6-7 раз в неделю
    very_active = "very_active"  # очень высокая активность, физическая работа


class Goal(str, enum.Enum):
    lose_weight = "lose_weight"
    maintain = "maintain"
    gain_weight = "gain_weight"


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sex: Mapped[Optional[Sex]] = mapped_column(Enum(Sex, name="sex_enum"), nullable=True)
    birth_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    height_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    activity_level: Mapped[Optional[ActivityLevel]] = mapped_column(
        Enum(ActivityLevel, name="activity_level_enum"), nullable=True
    )
    goal: Mapped[Optional[Goal]] = mapped_column(Enum(Goal, name="goal_enum"), nullable=True)

    # Если заполнено — используется вместо автоматического расчёта по формуле
    target_calories_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    target_protein_g_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    target_fat_g_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    target_carbs_g_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="profile")
