import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.profile import ActivityLevel, Goal, Sex


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    created_at: datetime


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    sex: Optional[Sex] = None
    birth_date: Optional[datetime] = None
    height_cm: Optional[float] = Field(default=None, gt=0, lt=300)
    weight_kg: Optional[float] = Field(default=None, gt=0, lt=500)
    activity_level: Optional[ActivityLevel] = None
    goal: Optional[Goal] = None
    target_calories_override: Optional[float] = Field(default=None, gt=0)
    target_protein_g_override: Optional[float] = Field(default=None, ge=0)
    target_fat_g_override: Optional[float] = Field(default=None, ge=0)
    target_carbs_g_override: Optional[float] = Field(default=None, ge=0)


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str]
    sex: Optional[Sex]
    birth_date: Optional[datetime]
    height_cm: Optional[float]
    weight_kg: Optional[float]
    activity_level: Optional[ActivityLevel]
    goal: Optional[Goal]
    target_calories_override: Optional[float]
    target_protein_g_override: Optional[float]
    target_fat_g_override: Optional[float]
    target_carbs_g_override: Optional[float]


class DailyTargets(BaseModel):
    calories: float
    protein_g: float
    fat_g: float
    carbs_g: float
    is_estimated: bool  # False если пользователь задал override вручную
