from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from healthai.api.deps import get_db
from healthai.api.security import require_api_key
from healthai.models.aliment import Aliment
from healthai.api.schemas.food import FoodCreate, FoodUpdate, FoodOut

router = APIRouter(
    prefix="/foods",
    tags=["Foods"],
    dependencies=[Depends(require_api_key)]
)


@router.get("", response_model=List[FoodOut])
def list_foods(
    q: Optional[str] = Query(default=None, description="Search by food_item"),
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(Aliment)
    if q:
        query = query.filter(Aliment.food_item.ilike(f"%{q}%"))
    return query.order_by(Aliment.id_food.desc()).limit(limit).all()


@router.get("/{food_id}", response_model=FoodOut)
def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.get(Aliment, food_id)
    if not food:
        raise HTTPException(404, "Food not found")
    return food


@router.post("", response_model=FoodOut)
def create_food(data: FoodCreate, db: Session = Depends(get_db)):
    food = Aliment(**data.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food


@router.put("/{food_id}", response_model=FoodOut)
def update_food(food_id: int, data: FoodUpdate, db: Session = Depends(get_db)):
    food = db.get(Aliment, food_id)
    if not food:
        raise HTTPException(404, "Food not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(food, key, value)

    db.commit()
    db.refresh(food)
    return food


@router.delete("/{food_id}")
def delete_food(food_id: int, db: Session = Depends(get_db)):
    food = db.get(Aliment, food_id)
    if not food:
        raise HTTPException(404, "Food not found")

    db.delete(food)
    db.commit()
    return {"status": "deleted"}