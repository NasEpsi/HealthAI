from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserProfileBase(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    health_goal: Optional[str] = None
    daily_calorie_target: Optional[int] = None
    allergies: Optional[str] = None
    dietary_preferences: Optional[str] = None
    injuries: Optional[str] = None
    available_equipment: Optional[str] = None
    available_days: Optional[str] = None
    session_duration_pref: Optional[int] = None
    sleep_goal: Optional[int] = None


class UserProfileCreate(UserProfileBase):
    user_id: int


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileRead(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True