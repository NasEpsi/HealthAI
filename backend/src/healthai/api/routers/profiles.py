from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from healthai.db import get_db
from healthai.models.user_profile import UserProfile
from healthai.api.schemas.profile import UserProfileCreate, UserProfileRead, UserProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("/", response_model=UserProfileRead)
def create_profile(payload: UserProfileCreate, db: Session = Depends(get_db)):
    existing = db.query(UserProfile).filter(UserProfile.user_id == payload.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="A profile already exists for this user.")

    profile = UserProfile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}", response_model=UserProfileRead)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile


@router.put("/{user_id}", response_model=UserProfileRead)
def update_profile(user_id: int, payload: UserProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile