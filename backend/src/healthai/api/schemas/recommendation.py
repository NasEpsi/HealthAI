from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class NutritionRecommendationCreate(BaseModel):
    user_id: int
    meal_analysis_id: Optional[int] = None
    goal_context: Optional[str] = None
    budget_constraint: Optional[str] = None
    allergy_context: Optional[str] = None
    diet_context: Optional[str] = None
    recommendation_text: str
    improvement_suggestions_json: Optional[Any] = None
    meal_plan_json: Optional[Any] = None
    confidence_score: Optional[float] = None
    generated_by: Optional[str] = None


class NutritionRecommendationRead(NutritionRecommendationCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutRecommendationCreate(BaseModel):
    user_id: int
    goal_context: Optional[str] = None
    fitness_level: Optional[str] = None
    available_equipment: Optional[str] = None
    duration_preference: Optional[int] = None
    physical_limitations: Optional[str] = None
    workout_plan_json: Optional[Any] = None
    recommendation_text: str
    progression_level: Optional[str] = None
    confidence_score: Optional[float] = None
    generated_by: Optional[str] = None


class WorkoutRecommendationRead(WorkoutRecommendationCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationHistoryCreate(BaseModel):
    user_id: int
    recommendation_type: str
    reference_id: Optional[int] = None
    source_table: Optional[str] = None
    user_feedback: Optional[str] = None
    was_applied: Optional[bool] = None


class RecommendationHistoryRead(RecommendationHistoryCreate):
    id: int
    displayed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True