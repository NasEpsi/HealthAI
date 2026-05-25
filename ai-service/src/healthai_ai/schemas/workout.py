from pydantic import BaseModel
from typing import List, Optional, Any


class WorkoutRequest(BaseModel):
    user_id: int
    goal: str
    level: str = "beginner"
    duration: int = 30
    equipment: Optional[List[str]] = []
    limitations: Optional[List[str]] = []


class WorkoutResponse(BaseModel):
    level: str
    duration: int
    plan: List[Any]
    score: float