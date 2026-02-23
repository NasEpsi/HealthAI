from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import Session
from healthai.models.qualite_run import QualiteDonneesRun

def start_run(db: Session, pipeline_name: str) -> QualiteDonneesRun:
    run = QualiteDonneesRun(
        pipeline_name=pipeline_name,
        started_at=datetime.utcnow(),
        status="RUNNING",
        rows_read=0,
        rows_inserted=0,
        rows_rejected=0,
        missing_values_count=0,
        duplicates_count=0,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run

def finish_run(
    db: Session,
    run: QualiteDonneesRun,
    *,
    status: str,
    rows_read: int,
    rows_inserted: int,
    rows_rejected: int,
    missing_values_count: int,
    duplicates_count: int,
    error_message: str | None = None,
) -> None:
    run.ended_at = datetime.utcnow()
    run.status = status
    run.rows_read = rows_read
    run.rows_inserted = rows_inserted
    run.rows_rejected = rows_rejected
    run.missing_values_count = missing_values_count
    run.duplicates_count = duplicates_count
    run.error_message = error_message
    db.commit()