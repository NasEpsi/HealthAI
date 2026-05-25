from pydantic import BaseModel
from typing import Any


class MealImageAnalysisResponse(BaseModel):
    filename: str
    detected_foods: list[Any]
    totals: dict
    advice: str
    score: float