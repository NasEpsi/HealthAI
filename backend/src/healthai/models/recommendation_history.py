from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from healthai.db import Base


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("utilisateur.id", ondelete="CASCADE"), nullable=False)

    recommendation_type = Column(String(30), nullable=False)
    reference_id = Column(Integer, nullable=True)
    source_table = Column(String(50), nullable=True)

    displayed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    user_feedback = Column(String(50), nullable=True)
    was_applied = Column(Boolean, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)