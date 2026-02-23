from sqlalchemy import String, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from ..db import Base
from datetime import datetime

class QualiteDonneesRun(Base):
    __tablename__ = "qualite_donnees_run"

    id_run: Mapped[int] = mapped_column(primary_key=True)
    pipeline_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str | None] = mapped_column(String(20), nullable=True)

    rows_read: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rows_inserted: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rows_rejected: Mapped[int | None] = mapped_column(Integer, nullable=True)
    missing_values_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duplicates_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)