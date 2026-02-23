from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..deps import get_db
from ..security import require_api_key

router = APIRouter(prefix="/kpis", tags=["KPIs"], dependencies=[Depends(require_api_key)])

@router.get("/quality")
def kpi_quality(db: Session = Depends(get_db)):
    # Dernières exécutions ETL
    q = text("""
        SELECT
          id_run, pipeline_name, started_at, ended_at, status,
          rows_read, rows_inserted, rows_rejected,
          missing_values_count, duplicates_count
        FROM qualite_donnees_run
        ORDER BY id_run DESC
        LIMIT 20;
    """)
    rows = db.execute(q).mappings().all()
    return {"runs": list(rows)}

@router.get("/users")
def kpi_users(db: Session = Depends(get_db)):
    # Répartition par âge + genre + niveau
    q_age = text("""
        SELECT
          CASE
            WHEN age < 18 THEN '<18'
            WHEN age BETWEEN 18 AND 24 THEN '18-24'
            WHEN age BETWEEN 25 AND 34 THEN '25-34'
            WHEN age BETWEEN 35 AND 44 THEN '35-44'
            WHEN age BETWEEN 45 AND 54 THEN '45-54'
            ELSE '55+'
          END AS age_group,
          COUNT(*)::int AS count
        FROM utilisateur
        GROUP BY age_group
        ORDER BY
          CASE age_group
            WHEN '<18' THEN 1
            WHEN '18-24' THEN 2
            WHEN '25-34' THEN 3
            WHEN '35-44' THEN 4
            WHEN '45-54' THEN 5
            ELSE 6
          END;
    """)
    q_gender = text("""
        SELECT gender, COUNT(*)::int AS count
        FROM utilisateur
        GROUP BY gender
        ORDER BY count DESC;
    """)
    q_exp = text("""
        SELECT COALESCE(experience_level, 'UNKNOWN') AS experience_level,
               COUNT(*)::int AS count
        FROM utilisateur
        GROUP BY COALESCE(experience_level, 'UNKNOWN')
        ORDER BY count DESC;
    """)

    return {
        "age_groups": list(db.execute(q_age).mappings().all()),
        "genders": list(db.execute(q_gender).mappings().all()),
        "experience_levels": list(db.execute(q_exp).mappings().all()),
    }

@router.get("/fitness")
def kpi_fitness(db: Session = Depends(get_db)):
    q = text("""
        SELECT
          COUNT(*)::int AS sessions,
          ROUND(AVG(calories_burned)::numeric, 2) AS avg_calories_burned,
          ROUND(SUM(calories_burned)::numeric, 2) AS total_calories_burned,
          ROUND(AVG(session_duration_hours)::numeric, 2) AS avg_duration_hours,
          ROUND(AVG(avg_bpm)::numeric, 2) AS avg_avg_bpm,
          ROUND(AVG(resting_bpm)::numeric, 2) AS avg_resting_bpm,
          ROUND(AVG(max_bpm)::numeric, 2) AS avg_max_bpm
        FROM session_sport;
    """)
    q_workout = text("""
        SELECT COALESCE(workout_type, 'UNKNOWN') AS workout_type,
               COUNT(*)::int AS count
        FROM session_sport
        GROUP BY COALESCE(workout_type, 'UNKNOWN')
        ORDER BY count DESC
        LIMIT 10;
    """)
    return {
        "summary": db.execute(q).mappings().one(),
        "top_workouts": list(db.execute(q_workout).mappings().all()),
    }

@router.get("/nutrition")
def kpi_nutrition(db: Session = Depends(get_db)):
    q_macros = text("""
        SELECT
          COUNT(*)::int AS logs,
          ROUND(AVG(a.calories_kcal)::numeric, 2) AS avg_calories,
          ROUND(AVG(a.protein_g)::numeric, 2) AS avg_protein,
          ROUND(AVG(a.carbohydrates_g)::numeric, 2) AS avg_carbs,
          ROUND(AVG(a.fat_g)::numeric, 2) AS avg_fat,
          ROUND(AVG(a.fiber_g)::numeric, 2) AS avg_fiber,
          ROUND(AVG(a.sugars_g)::numeric, 2) AS avg_sugars,
          ROUND(AVG(a.sodium_mg)::numeric, 2) AS avg_sodium_mg
        FROM nutrition_log nl
        JOIN aliment a ON a.id_food = nl.id_food;
    """)
    q_top_food = text("""
        SELECT a.food_item, COUNT(*)::int AS count
        FROM nutrition_log nl
        JOIN aliment a ON a.id_food = nl.id_food
        GROUP BY a.food_item
        ORDER BY count DESC
        LIMIT 10;
    """)
    q_meals = text("""
        SELECT COALESCE(meal_type, 'UNKNOWN') AS meal_type,
               COUNT(*)::int AS count
        FROM nutrition_log
        GROUP BY COALESCE(meal_type, 'UNKNOWN')
        ORDER BY count DESC;
    """)

    return {
        "macros_summary": db.execute(q_macros).mappings().one(),
        "top_foods": list(db.execute(q_top_food).mappings().all()),
        "meal_types": list(db.execute(q_meals).mappings().all()),
    }