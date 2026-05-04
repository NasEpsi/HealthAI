from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from healthai.db import Base


class WorkoutRecommendation(Base):
    __tablename__ = "workout_recommendation"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("utilisateur.id", ondelete="CASCADE"), nullable=False)

    goal_context = Column(String(100), nullable=True)
    fitness_level = Column(String(50), nullable=True)
    available_equipment = Column(Text, nullable=True)
    duration_preference = Column(Integer, nullable=True)
    physical_limitations = Column(Text, nullable=True)

    workout_plan_json = Column(JSONB, nullable=True)
    recommendation_text = Column(Text, nullable=False)

    progression_level = Column(String(50), nullable=True)
    confidence_score = Column(Numeric(4, 2), nullable=True)
    generated_by = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)