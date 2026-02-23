from __future__ import annotations

import os
from datetime import date
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import select

from healthai.db import SessionLocal
from healthai.models.utilisateur import Utilisateur
from healthai.models.session_sport import SessionSport
from healthai.etl.validators import validate_columns
from healthai.etl.quality import start_run, finish_run

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

def _to_num(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce")

def _user_key(r) -> tuple:
    exp = str(r["Experience_Level"]).strip() if pd.notna(r["Experience_Level"]) else None
    return (
        int(r["Age"]),
        str(r["Gender"]).strip(),
        float(r["Height (m)"]),
        exp,
    )

def run_fitness_ingest() -> None:
    path = os.getenv("FITNESS_CSV", "/app/data/raw/fitness_tracker.csv")
    import_date = date.today()

    db: Session = SessionLocal()
    run = start_run(db, "fitness_ingest")

    rows_read = rows_inserted = rows_rejected = missing_values = duplicates = 0

    try:
        df = pd.read_csv(path)
        rows_read = len(df)

        vr = validate_columns(list(df.columns), REQUIRED_COLS)
        if not vr.ok:
            raise ValueError(f"Missing columns in fitness CSV: {vr.missing_columns}")

        # normalisation
        df["Gender"] = df["Gender"].astype(str).str.strip()
        df["Workout_Type"] = df["Workout_Type"].astype(str).str.strip()
        df["Experience_Level"] = df["Experience_Level"].astype(str).str.strip()

        # conversions numériques
        df["Age"] = pd.to_numeric(df["Age"], errors="coerce")
        df["Weight (kg)"] = _to_num(df["Weight (kg)"])
        df["Height (m)"] = _to_num(df["Height (m)"])
        df["Max_BPM"] = pd.to_numeric(df["Max_BPM"], errors="coerce")
        df["Avg_BPM"] = pd.to_numeric(df["Avg_BPM"], errors="coerce")
        df["Resting_BPM"] = pd.to_numeric(df["Resting_BPM"], errors="coerce")
        df["Session_Duration (hours)"] = _to_num(df["Session_Duration (hours)"])
        df["Calories_Burned"] = _to_num(df["Calories_Burned"])
        df["Fat_Percentage"] = _to_num(df["Fat_Percentage"])
        df["Water_Intake (liters)"] = _to_num(df["Water_Intake (liters)"])
        df["Workout_Frequency (days/week)"] = pd.to_numeric(df["Workout_Frequency (days/week)"], errors="coerce")
        df["BMI"] = _to_num(df["BMI"])

        missing_values = int(df.isna().sum().sum())

        # déduplication "profil + session" (approx)
        before = len(df)
        df = df.drop_duplicates(subset=[
            "Age", "Gender", "Height (m)", "Experience_Level",
            "Workout_Type", "Session_Duration (hours)", "Calories_Burned"
        ])
        duplicates = before - len(df)

        # Règles de rejet minimales
        df_valid = df[
            df["Age"].between(10, 100, inclusive="both")
            & df["Height (m)"].between(1.0, 2.5, inclusive="both")
        ].copy()
        rows_rejected = len(df) - len(df_valid)

        inserted_sessions = 0

        # création utilisateur : on "déduplique" par (age, gender, height, experience_level)
        # On crée une "journée" par user (date = date d'import)
        # => agrégation pour respecter UNIQUE(id_user, session_date)
        groups = df_valid.groupby(
            ["Age", "Gender", "Height (m)", "Experience_Level"],
            dropna=False
        )

        for (age, gender, height, exp), g in groups:
            age = int(age)
            gender = str(gender).strip()
            height = float(height)
            exp = str(exp).strip() if pd.notna(exp) else None

            # chercher / créer l'utilisateur
            user_id = db.execute(
                select(Utilisateur.id_user).where(
                    Utilisateur.age == age,
                    Utilisateur.gender == gender,
                    Utilisateur.height_m == height,
                    Utilisateur.experience_level == exp,
                )
            ).scalar_one_or_none()

            if user_id is None:
                user = Utilisateur(age=age, gender=gender, height_m=height, experience_level=exp)
                db.add(user)
                db.flush()
                user_id = user.id_user

            # Agrégations "journalières"
            # - calories_burned : somme
            # - duration : somme
            # - bpm / bmi / fat% / weight : moyenne
            calories_sum = float(g["Calories_Burned"].sum(skipna=True))
            duration_sum = float(g["Session_Duration (hours)"].sum(skipna=True))

            def mean(col: str):
                v = g[col].mean(skipna=True)
                return None if pd.isna(v) else float(v)

            # workout_type : le plus fréquent
            workout_mode = None
            if "Workout_Type" in g.columns:
                vc = g["Workout_Type"].dropna().astype(str).str.strip().value_counts()
                workout_mode = None if vc.empty else vc.index[0]

            # water intake : somme (logique "dans la journée")
            water_sum = float(g["Water_Intake (liters)"].sum(skipna=True)) if "Water_Intake (liters)" in g.columns else None

            freq_mode = None
            if "Workout_Frequency (days/week)" in g.columns:
                vc2 = g["Workout_Frequency (days/week)"].dropna().astype(int).value_counts()
                freq_mode = None if vc2.empty else int(vc2.index[0])

            session = SessionSport(
                id_user=user_id,
                session_date=import_date,
                weight_kg=mean("Weight (kg)"),
                max_bpm=int(g["Max_BPM"].max(skipna=True)) if g["Max_BPM"].notna().any() else None,
                avg_bpm=int(mean("Avg_BPM")) if mean("Avg_BPM") is not None else None,
                resting_bpm=int(mean("Resting_BPM")) if mean("Resting_BPM") is not None else None,
                session_duration_hours=duration_sum,
                calories_burned=calories_sum,
                workout_type=workout_mode,
                fat_percentage=mean("Fat_Percentage"),
                water_intake_liters=water_sum,
                workout_frequency_days_per_week=freq_mode,
                bmi=mean("BMI"),
            )

            # IMPORTANT : si l’ETL est relancé le même jour, on met à jour au lieu de planter
            existing = db.execute(
                select(SessionSport.id_session).where(
                    SessionSport.id_user == user_id,
                    SessionSport.session_date == import_date,
                )
            ).scalar_one_or_none()

            if existing is None:
                db.add(session)
            else:
                # update "simple"
                db.query(SessionSport).filter(
                    SessionSport.id_user == user_id,
                    SessionSport.session_date == import_date,
                ).update({
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
                })

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

        print(f"[fitness] OK rows_read={rows_read} inserted_sessions={rows_inserted} rejected={rows_rejected}")

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