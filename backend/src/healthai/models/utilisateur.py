from sqlalchemy import String, Integer, Numeric, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from ..db import Base

class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id_user: Mapped[int] = mapped_column(primary_key=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    height_m: Mapped[float | None] = mapped_column(Numeric(4,2), nullable=True)
    experience_level: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        CheckConstraint("age BETWEEN 10 AND 100", name="ck_user_age"),
        CheckConstraint("height_m IS NULL OR (height_m BETWEEN 1.00 AND 2.50)", name="ck_user_height"),
    )