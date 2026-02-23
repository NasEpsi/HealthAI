from sqlalchemy import Integer, String, Date, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column
from ..db import Base

class NutritionLog(Base):
    __tablename__ = "nutrition_log"

    id_nutrition_log: Mapped[int] = mapped_column(primary_key=True)

    id_user: Mapped[int | None] = mapped_column(ForeignKey("utilisateur.id_user", ondelete="SET NULL"), nullable=True)
    id_food: Mapped[int] = mapped_column(ForeignKey("aliment.id_food", ondelete="CASCADE"), nullable=False)

    log_date: Mapped[str] = mapped_column(Date, nullable=False)
    meal_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    water_intake_ml: Mapped[int | None] = mapped_column(Integer, nullable=True)

    __table_args__ = (
        CheckConstraint("water_intake_ml IS NULL OR water_intake_ml >= 0", name="ck_nut_water"),
        Index("idx_nutrition_user_date", "id_user", "log_date"),
    )