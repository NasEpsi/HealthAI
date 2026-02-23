from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class SessionBase(BaseModel):
    id_user: int = Field(..., ge=1)
    session_date: date

    weight_kg: Optional[float] = Field(None, ge=30, le=250)
    max_bpm: Optional[int] = Field(None, ge=40, le=220)
    avg_bpm: Optional[int] = Field(None, ge=40, le=220)
    resting_bpm: Optional[int] = Field(None, ge=30, le=150)

    session_duration_hours: Optional[float] = Field(None, ge=0)
    calories_burned: Optional[float] = Field(None, ge=0)

    workout_type: Optional[str] = Field(None, max_length=100)

    fat_percentage: Optional[float] = Field(None, ge=0, le=70)
    water_intake_liters: Optional[float] = Field(None, ge=0)

    workout_frequency_days_per_week: Optional[int] = Field(None, ge=0, le=7)
    bmi: Optional[float] = Field(None, ge=10, le=60)


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    session_date: Optional[date] = None

    weight_kg: Optional[float] = Field(None, ge=30, le=250)
    max_bpm: Optional[int] = Field(None, ge=40, le=220)
    avg_bpm: Optional[int] = Field(None, ge=40, le=220)
    resting_bpm: Optional[int] = Field(None, ge=30, le=150)

    session_duration_hours: Optional[float] = Field(None, ge=0)
    calories_burned: Optional[float] = Field(None, ge=0)

    workout_type: Optional[str] = Field(None, max_length=100)

    fat_percentage: Optional[float] = Field(None, ge=0, le=70)
    water_intake_liters: Optional[float] = Field(None, ge=0)

    workout_frequency_days_per_week: Optional[int] = Field(None, ge=0, le=7)
    bmi: Optional[float] = Field(None, ge=10, le=60)


class SessionOut(SessionBase):
    id_session: int

    class Config:
        from_attributes = True