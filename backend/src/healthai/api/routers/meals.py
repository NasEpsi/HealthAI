from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from healthai.db import get_db
from healthai.models.meal_analysis import MealAnalysis
from healthai.api.schemas.meal import MealAnalysisCreate

router = APIRouter(prefix="/meals", tags=["Meals"])


@router.post("/analyze")
def save_meal_analysis(
    payload: MealAnalysisCreate,
    db: Session = Depends(get_db),
):
    meal = MealAnalysis(**payload.model_dump())

    db.add(meal)
    db.commit()
    db.refresh(meal)

    return meal


@router.get("/history/{user_id}")
def get_meal_history(
    user_id: int,
    db: Session = Depends(get_db),
):
    meals = (
        db.query(MealAnalysis)
        .filter(MealAnalysis.user_id == user_id)
        .order_by(MealAnalysis.submitted_at.desc())
        .all()
    )

    return meals