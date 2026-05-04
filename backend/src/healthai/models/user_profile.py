from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from healthai.db import Base


class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("utilisateur.id", ondelete="CASCADE"), unique=True, nullable=False)

    age = Column(Integer, nullable=True)
    sex = Column(String(20), nullable=True)
    height_cm = Column(Numeric(5, 2), nullable=True)
    weight_kg = Column(Numeric(5, 2), nullable=True)

    activity_level = Column(String(50), nullable=True)
    health_goal = Column(String(100), nullable=True)
    daily_calorie_target = Column(Integer, nullable=True)

    allergies = Column(Text, nullable=True)
    dietary_preferences = Column(Text, nullable=True)
    injuries = Column(Text, nullable=True)

    available_equipment = Column(Text, nullable=True)
    available_days = Column(Text, nullable=True)
    session_duration_pref = Column(Integer, nullable=True)
    sleep_goal = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)