from pydantic import BaseModel
from typing import List, Optional


class NutritionRequest(BaseModel):
    user_id: int
    goal: str
    calories: float = 0
    proteins: float = 0
    carbs: float = 0
    fats: float = 0
    detected_foods: Optional[List[str]] = []


class NutritionResponse(BaseModel):
    summary: str
    actions: List[str]
    score: float