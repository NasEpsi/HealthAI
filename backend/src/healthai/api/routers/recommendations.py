from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from healthai.db import get_db
from healthai.models.nutrition_recommendation import NutritionRecommendation
from healthai.models.workout_recommendation import WorkoutRecommendation
from healthai.models.recommendation_history import RecommendationHistory
from healthai.api.schemas.recommendation import (
    NutritionRecommendationCreate,
    NutritionRecommendationRead,
    WorkoutRecommendationCreate,
    WorkoutRecommendationRead,
    RecommendationHistoryCreate,
    RecommendationHistoryRead,
)
from healthai.services.ai_client import get_nutrition_recommendation
from healthai.services.ai_client import get_workout_recommendation

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/nutrition")
def generate_nutrition(payload: dict, db: Session = Depends(get_db)):

    ai_result = get_nutrition_recommendation(payload)

    item = NutritionRecommendation(
        user_id=payload["user_id"],
        recommendation_text=ai_result.get("summary", ""),
        improvement_suggestions_json=ai_result.get("actions", []),
        confidence_score=ai_result.get("score", 0),
        generated_by="healthai_ai_service"
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    history = RecommendationHistory(
        user_id=payload["user_id"],
        recommendation_type="nutrition",
        reference_id=item.id,
        source_table="nutrition_recommendation"
    )

    db.add(history)
    db.commit()

    return {
        "recommendation_id": item.id,
        "ai_result": ai_result
    }

@router.post("/workout")
def generate_workout(payload: dict, db: Session = Depends(get_db)):

    ai_result = get_workout_recommendation(payload)

    item = WorkoutRecommendation(
        user_id=payload["user_id"],
        goal_context=payload.get("goal"),
        fitness_level=payload.get("level"),
        recommendation_text="Programme généré automatiquement",
        workout_plan_json=ai_result.get("plan", []),
        confidence_score=ai_result.get("score", 0),
        generated_by="healthai_ai_service"
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    history = RecommendationHistory(
        user_id=payload["user_id"],
        recommendation_type="workout",
        reference_id=item.id,
        source_table="workout_recommendation"
    )

    db.add(history)
    db.commit()

    return {
        "recommendation_id": item.id,
        "ai_result": ai_result
    }


@router.post("/history", response_model=RecommendationHistoryRead)
def create_history_entry(payload: RecommendationHistoryCreate, db: Session = Depends(get_db)):
    item = RecommendationHistory(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/history/{user_id}", response_model=list[RecommendationHistoryRead])
def get_history(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.user_id == user_id)
        .order_by(RecommendationHistory.created_at.desc())
        .all()
    )