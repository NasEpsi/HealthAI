from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from healthai.db import Base


class NutritionRecommendation(Base):
    __tablename__ = "nutrition_recommendation"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("utilisateur.id_user", ondelete="CASCADE"), nullable=False)
    meal_analysis_id = Column(Integer, ForeignKey("meal_analysis.id_meal", ondelete="SET NULL"), nullable=True)

    goal_context = Column(String(100), nullable=True)
    budget_constraint = Column(String(100), nullable=True)
    allergy_context = Column(Text, nullable=True)
    diet_context = Column(Text, nullable=True)

    recommendation_text = Column(Text, nullable=False)
    improvement_suggestions_json = Column(JSONB, nullable=True)
    meal_plan_json = Column(JSONB, nullable=True)

    confidence_score = Column(Numeric(4, 2), nullable=True)
    generated_by = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)