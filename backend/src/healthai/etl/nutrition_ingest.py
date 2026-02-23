from __future__ import annotations

import os
from datetime import date
import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from healthai.db import SessionLocal
from healthai.models.aliment import Aliment
from healthai.models.nutrition_log import NutritionLog
from healthai.etl.validators import validate_columns
from healthai.etl.quality import start_run, finish_run

REQUIRED_COLS = [
    "Food_Item",
    "Category",
    "Calories (kcal)",
    "Protein (g)",
    "Carbohydrates (g)",
    "Fat (g)",
    "Fiber (g)",
    "Sugars (g)",
    "Sodium (mg)",
    "Cholesterol (mg)",
    "Meal_Type",
    "Water_Intake (ml)",
]

def _to_num(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce")

def run_nutrition_ingest() -> None:
    path = os.getenv("NUTRITION_CSV", "/app/data/raw/daily_food_nutrition.csv")
    import_date = date.today()

    db: Session = SessionLocal()
    run = start_run(db, "nutrition_ingest")

    rows_read = rows_inserted = rows_rejected = missing_values = duplicates = 0

    try:
        df = pd.read_csv(
            path,
            engine="python",           # plus tolérant
            sep=",",
            on_bad_lines="skip"        # skip lignes cassées
        )
        # Lecture brute pour compter le total de lignes fichier (hors header)
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            total_lines = sum(1 for _ in f) - 1  # - header

        rows_read = total_lines
        rows_parsed = len(df)

        # lignes rejetées au parsing
        rows_rejected += max(0, rows_read - rows_parsed)

        # validation colonnes
        vr = validate_columns(list(df.columns), REQUIRED_COLS)
        if not vr.ok:
            raise ValueError(f"Missing columns in nutrition CSV: {vr.missing_columns}")

        # nettoyage de base
        df["Food_Item"] = df["Food_Item"].astype(str).str.strip()
        df["Category"] = df["Category"].astype(str).str.strip()

        # conversions numériques
        df["Calories (kcal)"] = _to_num(df["Calories (kcal)"])
        df["Protein (g)"] = _to_num(df["Protein (g)"])
        df["Carbohydrates (g)"] = _to_num(df["Carbohydrates (g)"])
        df["Fat (g)"] = _to_num(df["Fat (g)"])
        df["Fiber (g)"] = _to_num(df["Fiber (g)"])
        df["Sugars (g)"] = _to_num(df["Sugars (g)"])
        df["Sodium (mg)"] = _to_num(df["Sodium (mg)"])
        df["Cholesterol (mg)"] = _to_num(df["Cholesterol (mg)"])
        df["Water_Intake (ml)"] = pd.to_numeric(df["Water_Intake (ml)"], errors="coerce")

        # stats qualité
        missing_values = int(df.isna().sum().sum())

        # déduplication sur l'identité de l'aliment + meal_type + water intake (simple)
        before = len(df)
        df = df.drop_duplicates(subset=["Food_Item", "Category", "Meal_Type", "Water_Intake (ml)"])
        duplicates = before - len(df)

        # règle : Food_Item obligatoire
        df_valid = df[df["Food_Item"].notna() & (df["Food_Item"].str.len() > 0)].copy()
        rows_rejected = len(df) - len(df_valid)

        # upsert aliments (par food_item)
        inserted_logs = 0

        for _, r in df_valid.iterrows():
            food_item = str(r["Food_Item"]).strip()

            existing_food_id = db.execute(
                select(Aliment.id_food).where(Aliment.food_item == food_item)
            ).scalar_one_or_none()

            if existing_food_id is None:
                food = Aliment(
                    food_item=food_item,
                    category=str(r["Category"]) if pd.notna(r["Category"]) else None,
                    calories_kcal=r["Calories (kcal)"],
                    protein_g=r["Protein (g)"],
                    carbohydrates_g=r["Carbohydrates (g)"],
                    fat_g=r["Fat (g)"],
                    fiber_g=r["Fiber (g)"],
                    sugars_g=r["Sugars (g)"],
                    sodium_mg=r["Sodium (mg)"],
                    cholesterol_mg=r["Cholesterol (mg)"],
                    source="Daily Food & Nutrition Dataset",
                )
                db.add(food)
                db.flush()  # pour récupérer id_food
                food_id = food.id_food
            else:
                food_id = existing_food_id

            # nutrition_log sans user (id_user null) + date d'import
            log = NutritionLog(
                id_user=None,
                id_food=food_id,
                log_date=import_date,
                meal_type=str(r["Meal_Type"]) if pd.notna(r["Meal_Type"]) else None,
                water_intake_ml=int(r["Water_Intake (ml)"]) if pd.notna(r["Water_Intake (ml)"]) else None,
            )
            db.add(log)
            inserted_logs += 1

        db.commit()
        rows_inserted = inserted_logs

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
        print(f"[nutrition] OK rows_read={rows_read} inserted_logs={rows_inserted} rejected={rows_rejected}")

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