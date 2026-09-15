from typing import Optional

from pydantic import BaseModel, Field


class RecognizedFoodItem(BaseModel):
    name: str
    estimated_grams: float = Field(gt=0)
    confidence: str  # "high" | "medium" | "low"
    calories: float = Field(ge=0)
    protein_g: float = Field(ge=0)
    fat_g: float = Field(ge=0)
    carbs_g: float = Field(ge=0)


class PhotoRecognitionResult(BaseModel):
    items: list[RecognizedFoodItem]
    notes: Optional[str] = None
    photo_url: str
