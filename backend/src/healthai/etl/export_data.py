from __future__ import annotations

import os
from datetime import datetime
import pandas as pd
from sqlalchemy import text

from healthai.db import engine

OUT_DIR = os.getenv("EXPORT_DIR", "/app/data/cleaned")

def _ensure_out_dir() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

def _stamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def export_table(query_sql: str, base_name: str) -> dict:
    df = pd.read_sql_query(text(query_sql), con=engine)

    ts = _stamp()
    csv_path = os.path.join(OUT_DIR, f"{base_name}_{ts}.csv")
    json_path = os.path.join(OUT_DIR, f"{base_name}_{ts}.json")

    df.to_csv(csv_path, index=False, encoding="utf-8")
    df.to_json(json_path, orient="records", force_ascii=False)

    return {
        "name": base_name,
        "rows": int(len(df)),
        "csv": csv_path,
        "json": json_path,
    }

def main() -> None:
    _ensure_out_dir()

    exports: list[dict] = []

    # Export 1 : Aliments (référentiel)
    exports.append(export_table(
        """
        SELECT
          id_food, food_item, category,
          calories_kcal, protein_g, carbohydrates_g, fat_g,
          fiber_g, sugars_g, sodium_mg, cholesterol_mg,
          source
        FROM aliment
        ORDER BY id_food;
        """,
        "foods"
    ))

    # Export 2 : Logs nutrition (nettoyés)
    exports.append(export_table(
        """
        SELECT
          nl.id_nutrition_log,
          nl.log_date,
          nl.meal_type,
          nl.water_intake_ml,
          nl.id_user,
          nl.id_food,
          a.food_item,
          a.category,
          a.calories_kcal, a.protein_g, a.carbohydrates_g, a.fat_g
        FROM nutrition_log nl
        JOIN aliment a ON a.id_food = nl.id_food
        ORDER BY nl.id_nutrition_log;
        """,
        "nutrition_logs"
    ))

    # Export 3 : Sessions sport (nettoyées)
    exports.append(export_table(
        """
        SELECT
          s.id_session,
          s.session_date,
          s.id_user,
          u.age, u.gender, u.height_m, u.experience_level,
          s.weight_kg, s.max_bpm, s.avg_bpm, s.resting_bpm,
          s.session_duration_hours, s.calories_burned,
          s.workout_type, s.fat_percentage, s.water_intake_liters,
          s.workout_frequency_days_per_week, s.bmi
        FROM session_sport s
        JOIN utilisateur u ON u.id_user = s.id_user
        ORDER BY s.id_session;
        """,
        "fitness_sessions"
    ))

    # Export 4 : KPIs (prêts PowerBI si besoin)
    exports.append(export_table(
        """
        SELECT * FROM v_quality_runs ORDER BY id_run DESC;
        """,
        "kpi_quality_runs"
    ))
    exports.append(export_table(
        """
        SELECT * FROM v_users_age_groups;
        """,
        "kpi_users_age_groups"
    ))
    exports.append(export_table(
        """
        SELECT * FROM v_fitness_top_workouts;
        """,
        "kpi_fitness_top_workouts"
    ))
    exports.append(export_table(
        """
        SELECT * FROM v_nutrition_top_foods;
        """,
        "kpi_nutrition_top_foods"
    ))

    print("=== EXPORT DONE ===")
    for e in exports:
        print(f"- {e['name']}: rows={e['rows']}\n  csv={e['csv']}\n  json={e['json']}")

if __name__ == "__main__":
    main()