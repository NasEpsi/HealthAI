from __future__ import annotations

import os
from datetime import date
from typing import Optional

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from healthai.db import SessionLocal
from healthai.etl.quality import finish_run, start_run
from healthai.etl.validators import validate_columns
from healthai.models.session_sport import SessionSport
from healthai.models.utilisateur import Utilisateur

REQUIRED_COLS = [
    "Age",
    "Gender",
    "Weight (kg)",
    "Height (m)",
    "Max_BPM",
    "Avg_BPM",
    "Resting_BPM",
    "Session_Duration (hours)",
    "Calories_Burned",
    "Workout_Type",
    "Fat_Percentage",
    "Water_Intake (liters)",
    "Workout_Frequency (days/week)",
    "Experience_Level",
    "BMI",
]


# ---------------------------
# Helpers
# ---------------------------
def _to_num(series: pd.Series) -> pd.Series:
    """Convert to numeric; invalid values become NaN."""
    return pd.to_numeric(series, errors="coerce")


def _clean_str(series: pd.Series) -> pd.Series:
    """
    Normalize string-like columns:
    - cast to string
    - strip
    - replace empty / 'nan' / 'none' with NaN
    """
    s = series.astype(str).str.strip()
    s = s.replace(
        {
            "": pd.NA,
            "nan": pd.NA,
            "NaN": pd.NA,
            "None": pd.NA,
            "none": pd.NA,
            "NULL": pd.NA,
            "null": pd.NA,
        }
    )
    return s


def _mean_or_none(g: pd.DataFrame, col: str) -> Optional[float]:
    v = g[col].mean(skipna=True)
    return None if pd.isna(v) else float(v)


def _mode_or_none(g: pd.DataFrame, col: str) -> Optional[str]:
    if col not in g.columns:
        return None
    vc = g[col].dropna().astype(str).str.strip().value_counts()
    return None if vc.empty else str(vc.index[0])


# ---------------------------
# Main ETL
# ---------------------------
def run_fitness_ingest() -> None:
    path = os.getenv("FITNESS_CSV", "/app/data/raw/fitness_tracker.csv")
    import_date = date.today()

    db: Session = SessionLocal()
    run = start_run(db, "fitness_ingest")

    rows_read = 0
    rows_inserted = 0
    rows_rejected = 0
    missing_values = 0
    duplicates = 0

    try:
        df = pd.read_csv(path)
        rows_read = len(df)

        vr = validate_columns(list(df.columns), REQUIRED_COLS)
        if not vr.ok:
            raise ValueError(f"Missing columns in fitness CSV: {vr.missing_columns}")

        # ---- Normalize text columns
        df["Gender"] = _clean_str(df["Gender"])
        df["Workout_Type"] = _clean_str(df["Workout_Type"])
        df["Experience_Level"] = _clean_str(df["Experience_Level"])

        # Business rule: Experience_Level must be explicit
        # If missing, use "UNKNOWN"
        df["Experience_Level"] = df["Experience_Level"].fillna("UNKNOWN")

        # ---- Numeric conversions
        df["Age"] = _to_num(df["Age"])
        df["Weight (kg)"] = _to_num(df["Weight (kg)"])
        df["Height (m)"] = _to_num(df["Height (m)"])
        df["Max_BPM"] = _to_num(df["Max_BPM"])
        df["Avg_BPM"] = _to_num(df["Avg_BPM"])
        df["Resting_BPM"] = _to_num(df["Resting_BPM"])
        df["Session_Duration (hours)"] = _to_num(df["Session_Duration (hours)"])
        df["Calories_Burned"] = _to_num(df["Calories_Burned"])
        df["Fat_Percentage"] = _to_num(df["Fat_Percentage"])
        df["Water_Intake (liters)"] = _to_num(df["Water_Intake (liters)"])
        df["Workout_Frequency (days/week)"] = _to_num(df["Workout_Frequency (days/week)"])
        df["BMI"] = _to_num(df["BMI"])

        # ---- Fix incoherent values (soft-clean)
        # If duration > 15 minutes (0.25h) AND calories == 0, treat calories as missing (NULL)
        bad_cal = (df["Session_Duration (hours)"] > 0.25) & (df["Calories_Burned"] == 0)
        df.loc[bad_cal, "Calories_Burned"] = pd.NA

        # ---- Missing values count after normalization
        missing_values = int(df.isna().sum().sum())

        # ---- Deduplication (approx: same profile + same session signature)
        before = len(df)
        df = df.drop_duplicates(
            subset=[
                "Age",
                "Gender",
                "Height (m)",
                "Experience_Level",
                "Workout_Type",
                "Session_Duration (hours)",
                "Calories_Burned",
            ]
        )
        duplicates = before - len(df)

        # ---- Minimal reject rules (hard validation)
        # Keep dataset “reasonable”, reject rows outside bounds
        df_valid = df[
            df["Age"].between(10, 100, inclusive="both")
            & df["Height (m)"].between(1.0, 2.5, inclusive="both")
        ].copy()

        rows_rejected = len(df) - len(df_valid)

        # ---- Group by user profile to enforce UNIQUE(id_user, session_date)
        # One “daily aggregated session” per user and import_date
        groups = df_valid.groupby(
            ["Age", "Gender", "Height (m)", "Experience_Level"],
            dropna=False,
        )

        inserted_sessions = 0

        for (age, gender, height, exp), g in groups:
            age_i = int(age) if pd.notna(age) else None
            gender_s = str(gender).strip() if pd.notna(gender) else None
            height_f = float(height) if pd.notna(height) else None
            exp_s = str(exp).strip() if pd.notna(exp) and str(exp).strip() else "UNKNOWN"

            # Safety: should not happen due to df_valid, but keep robust
            if age_i is None or gender_s is None or height_f is None:
                continue

            # Find / create user
            user_id = db.execute(
                select(Utilisateur.id_user).where(
                    Utilisateur.age == age_i,
                    Utilisateur.gender == gender_s,
                    Utilisateur.height_m == height_f,
                    Utilisateur.experience_level == exp_s,
                )
            ).scalar_one_or_none()

            if user_id is None:
                user = Utilisateur(
                    age=age_i,
                    gender=gender_s,
                    height_m=height_f,
                    experience_level=exp_s,
                )
                db.add(user)
                db.flush()
                user_id = user.id_user

            # Aggregations (daily)
            # calories/duration/water: sum (daily totals)
            calories_sum = g["Calories_Burned"].sum(skipna=True)
            calories_sum = None if pd.isna(calories_sum) else float(calories_sum)

            duration_sum = g["Session_Duration (hours)"].sum(skipna=True)
            duration_sum = None if pd.isna(duration_sum) else float(duration_sum)

            water_sum = g["Water_Intake (liters)"].sum(skipna=True)
            water_sum = None if pd.isna(water_sum) else float(water_sum)

            # workout_type: mode
            workout_mode = _mode_or_none(g, "Workout_Type")

            # frequency: mode (integer)
            freq_mode = None
            if "Workout_Frequency (days/week)" in g.columns:
                vc2 = g["Workout_Frequency (days/week)"].dropna()
                if not vc2.empty:
                    # round to int because data may be float after to_numeric
                    vc2_int = vc2.round().astype(int).value_counts()
                    freq_mode = None if vc2_int.empty else int(vc2_int.index[0])

            session = SessionSport(
                id_user=user_id,
                session_date=import_date,
                weight_kg=_mean_or_none(g, "Weight (kg)"),
                max_bpm=int(g["Max_BPM"].max(skipna=True)) if g["Max_BPM"].notna().any() else None,
                avg_bpm=int(_mean_or_none(g, "Avg_BPM")) if _mean_or_none(g, "Avg_BPM") is not None else None,
                resting_bpm=int(_mean_or_none(g, "Resting_BPM")) if _mean_or_none(g, "Resting_BPM") is not None else None,
                session_duration_hours=duration_sum,
                calories_burned=calories_sum,
                workout_type=workout_mode,
                fat_percentage=_mean_or_none(g, "Fat_Percentage"),
                water_intake_liters=water_sum,
                workout_frequency_days_per_week=freq_mode,
                bmi=_mean_or_none(g, "BMI"),
            )

            # Upsert behavior: rerun same day updates instead of failing
            existing_id = db.execute(
                select(SessionSport.id_session).where(
                    SessionSport.id_user == user_id,
                    SessionSport.session_date == import_date,
                )
            ).scalar_one_or_none()

            if existing_id is None:
                db.add(session)
            else:
                db.query(SessionSport).filter(
                    SessionSport.id_user == user_id,
                    SessionSport.session_date == import_date,
                ).update(
                    {
                        "weight_kg": session.weight_kg,
                        "max_bpm": session.max_bpm,
                        "avg_bpm": session.avg_bpm,
                        "resting_bpm": session.resting_bpm,
                        "session_duration_hours": session.session_duration_hours,
                        "calories_burned": session.calories_burned,
                        "workout_type": session.workout_type,
                        "fat_percentage": session.fat_percentage,
                        "water_intake_liters": session.water_intake_liters,
                        "workout_frequency_days_per_week": session.workout_frequency_days_per_week,
                        "bmi": session.bmi,
                    }
                )

            inserted_sessions += 1

        db.commit()
        rows_inserted = inserted_sessions

        finish_run(
            db,
            run,
            status="SUCCESS",
            rows_read=rows_read,
            rows_inserted=rows_inserted,
            rows_rejected=rows_rejected,
            missing_values_count=missing_values,
            duplicates_count=duplicates,
        )

        print(
            f"[fitness] OK rows_read={rows_read} inserted_sessions={rows_inserted} "
            f"rejected={rows_rejected}"
        )

    except Exception as e:
        db.rollback()
        finish_run(
            db,
            run,
            status="FAILED",
            rows_read=rows_read,
            rows_inserted=rows_inserted,
            rows_rejected=rows_rejected,
            missing_values_count=missing_values,
            duplicates_count=duplicates,
            error_message=str(e),
        )
        raise
    finally:
        db.close()