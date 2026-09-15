import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.diary import EntrySource, MealType


class MealEntryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    meal_type: MealType
    grams: float = Field(gt=0)
    calories: float = Field(ge=0)
    protein_g: float = Field(ge=0)
    fat_g: float = Field(ge=0)
    carbs_g: float = Field(ge=0)
    food_item_id: Optional[uuid.UUID] = None
    photo_url: Optional[str] = None
    source: EntrySource = EntrySource.manual
    logged_at: Optional[datetime] = None  # по умолчанию — текущее время


class MealEntryUpdate(BaseModel):
    name: Optional[str] = None
    meal_type: Optional[MealType] = None
    grams: Optional[float] = Field(default=None, gt=0)
    calories: Optional[float] = Field(default=None, ge=0)
    protein_g: Optional[float] = Field(default=None, ge=0)
    fat_g: Optional[float] = Field(default=None, ge=0)
    carbs_g: Optional[float] = Field(default=None, ge=0)
    logged_at: Optional[datetime] = None


class MealEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    meal_type: MealType
    source: EntrySource
    grams: float
    calories: float
    protein_g: float
    fat_g: float
    carbs_g: float
    photo_url: Optional[str]
    logged_at: datetime
    created_at: datetime


class DailySummary(BaseModel):
    date: str
    total_calories: float
    total_protein_g: float
    total_fat_g: float
    total_carbs_g: float
    entries: list[MealEntryOut]
