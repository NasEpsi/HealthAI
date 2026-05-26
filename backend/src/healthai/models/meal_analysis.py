from datetime import datetime, UTC

from sqlalchemy import (
    JSON,
    String,
    Float,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import Mapped, mapped_column

from healthai.db import Base


class MealAnalysis(Base):
    __tablename__ = "meal_analysis"

    id_meal: Mapped[int] = mapped_column(
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("utilisateur.id_user")
    )

    image_url: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    detected_foods_json: Mapped[list] = mapped_column(
        JSON
    )

    estimated_calories: Mapped[float] = mapped_column(
        Float
    )

    estimated_proteins: Mapped[float] = mapped_column(
        Float
    )

    estimated_carbs: Mapped[float] = mapped_column(
        Float
    )

    estimated_fats: Mapped[float] = mapped_column(
        Float
    )

    analysis_status: Mapped[str] = mapped_column(
        String
    )

    analysis_source: Mapped[str] = mapped_column(
        String
    )

    raw_ai_response: Mapped[dict] = mapped_column(
        JSON
    )