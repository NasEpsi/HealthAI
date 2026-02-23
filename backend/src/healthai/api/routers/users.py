from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from healthai.api.deps import get_db
from healthai.api.security import require_api_key
from healthai.models.utilisateur import Utilisateur
from healthai.api.schemas.user import UserCreate, UserUpdate, UserOut

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(require_api_key)]
)


@router.get("", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(Utilisateur).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(Utilisateur, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.post("", response_model=UserOut)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    user = Utilisateur(**data.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.get(Utilisateur, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(Utilisateur, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    db.delete(user)
    db.commit()
    return {"status": "deleted"}