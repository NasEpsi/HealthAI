from sqlalchemy import String, Numeric, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from ..db import Base

class Aliment(Base):
    __tablename__ = "aliment"

    id_food: Mapped[int] = mapped_column(primary_key=True)
    food_item: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    calories_kcal: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)
    protein_g: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)
    carbohydrates_g: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)
    fat_g: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)
    fiber_g: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)
    sugars_g: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)
    sodium_mg: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)
    cholesterol_mg: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)

    source: Mapped[str | None] = mapped_column(String(100), nullable=True)

    __table_args__ = (
        CheckConstraint("calories_kcal IS NULL OR calories_kcal >= 0", name="ck_food_cal"),
        CheckConstraint("protein_g IS NULL OR protein_g >= 0", name="ck_food_prot"),
        CheckConstraint("carbohydrates_g IS NULL OR carbohydrates_g >= 0", name="ck_food_carbs"),
        CheckConstraint("fat_g IS NULL OR fat_g >= 0", name="ck_food_fat"),
        CheckConstraint("fiber_g IS NULL OR fiber_g >= 0", name="ck_food_fiber"),
        CheckConstraint("sugars_g IS NULL OR sugars_g >= 0", name="ck_food_sugars"),
        CheckConstraint("sodium_mg IS NULL OR sodium_mg >= 0", name="ck_food_sodium"),
        CheckConstraint("cholesterol_mg IS NULL OR cholesterol_mg >= 0", name="ck_food_chol"),
    )