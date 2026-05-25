from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from healthai.db import Base


class MealAnalysis(Base):
    __tablename__ = "meal_analysis"

    id_meal = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("utilisateur.id_user", ondelete="CASCADE"), nullable=False)

    image_url = Column(String, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    detected_foods_json = Column(JSONB, nullable=True)

    estimated_calories = Column(Numeric(8, 2), nullable=True)
    estimated_proteins = Column(Numeric(8, 2), nullable=True)
    estimated_carbs = Column(Numeric(8, 2), nullable=True)
    estimated_fats = Column(Numeric(8, 2), nullable=True)

    analysis_status = Column(String(30), nullable=True)
    analysis_source = Column(String(100), nullable=True)

    raw_ai_response = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)