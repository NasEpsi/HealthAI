from sqlalchemy import Integer, String, Date, Numeric, ForeignKey, CheckConstraint, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column
from ..db import Base

class SessionSport(Base):
    __tablename__ = "session_sport"

    id_session: Mapped[int] = mapped_column(primary_key=True)
    id_user: Mapped[int] = mapped_column(ForeignKey("utilisateur.id_user", ondelete="CASCADE"), nullable=False)

    session_date: Mapped[str] = mapped_column(Date, nullable=False)

    weight_kg: Mapped[float | None] = mapped_column(Numeric(6,2), nullable=True)
    max_bpm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    avg_bpm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resting_bpm: Mapped[int | None] = mapped_column(Integer, nullable=True)

    session_duration_hours: Mapped[float | None] = mapped_column(Numeric(4,2), nullable=True)
    calories_burned: Mapped[float | None] = mapped_column(Numeric(8,2), nullable=True)

    workout_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    fat_percentage: Mapped[float | None] = mapped_column(Numeric(5,2), nullable=True)
    water_intake_liters: Mapped[float | None] = mapped_column(Numeric(4,2), nullable=True)
    workout_frequency_days_per_week: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bmi: Mapped[float | None] = mapped_column(Numeric(5,2), nullable=True)

    __table_args__ = (
        UniqueConstraint("id_user", "session_date", name="uq_user_session_date"),
        Index("idx_session_user", "id_user"),

        CheckConstraint("weight_kg IS NULL OR (weight_kg BETWEEN 30 AND 250)", name="ck_s_weight"),
        CheckConstraint("max_bpm IS NULL OR (max_bpm BETWEEN 40 AND 220)", name="ck_s_maxbpm"),
        CheckConstraint("avg_bpm IS NULL OR (avg_bpm BETWEEN 40 AND 220)", name="ck_s_avgbpm"),
        CheckConstraint("resting_bpm IS NULL OR (resting_bpm BETWEEN 30 AND 150)", name="ck_s_restbpm"),
        CheckConstraint("fat_percentage IS NULL OR (fat_percentage BETWEEN 0 AND 70)", name="ck_s_fatpct"),
        CheckConstraint("workout_frequency_days_per_week IS NULL OR (workout_frequency_days_per_week BETWEEN 0 AND 7)", name="ck_s_freq"),
        CheckConstraint("bmi IS NULL OR (bmi BETWEEN 10 AND 60)", name="ck_s_bmi"),
        CheckConstraint("session_duration_hours IS NULL OR session_duration_hours >= 0", name="ck_s_duration"),
        CheckConstraint("calories_burned IS NULL OR calories_burned >= 0", name="ck_s_calburn"),
        CheckConstraint("water_intake_liters IS NULL OR water_intake_liters >= 0", name="ck_s_water"),
    )