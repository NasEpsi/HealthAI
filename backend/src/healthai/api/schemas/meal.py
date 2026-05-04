from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class MealAnalysisCreate(BaseModel):
    user_id: int
    image_url: Optional[str] = None
    detected_foods_json: Optional[Any] = None
    estimated_calories: Optional[float] = None
    estimated_proteins: Optional[float] = None
    estimated_carbs: Optional[float] = None
    estimated_fats: Optional[float] = None
    analysis_status: Optional[str] = None
    analysis_source: Optional[str] = None
    raw_ai_response: Optional[Any] = None


class MealAnalysisRead(BaseModel):
    id: int
    user_id: int
    image_url: Optional[str] = None
    submitted_at: datetime
    detected_foods_json: Optional[Any] = None
    estimated_calories: Optional[float] = None
    estimated_proteins: Optional[float] = None
    estimated_carbs: Optional[float] = None
    estimated_fats: Optional[float] = None
    analysis_status: Optional[str] = None
    analysis_source: Optional[str] = None
    raw_ai_response: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True