from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from healthai.db import get_db
from healthai.models.meal_analysis import MealAnalysis
from healthai.api.schemas.meal import MealAnalysisCreate, MealAnalysisRead

router = APIRouter(prefix="/meals", tags=["meals"])


@router.post("/analyze", response_model=MealAnalysisRead)
def create_meal_analysis(payload: MealAnalysisCreate, db: Session = Depends(get_db)):
    meal = MealAnalysis(**payload.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.get("/history/{user_id}", response_model=list[MealAnalysisRead])
def get_meal_history(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(MealAnalysis)
        .filter(MealAnalysis.user_id == user_id)
        .order_by(MealAnalysis.created_at.desc())
        .all()
    )