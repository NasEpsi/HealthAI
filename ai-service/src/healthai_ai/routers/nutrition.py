from datetime import datetime, UTC
import logging

from fastapi import APIRouter
from healthai_ai.mongo import nutrition_collection, safe_insert_one
from healthai_ai.schemas.nutrition import NutritionRequest, NutritionResponse
from healthai_ai.services.nutrition_engine import generate_nutrition_recommendation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai/nutrition", tags=["AI Nutrition"])


@router.post("/recommend", response_model=NutritionResponse)
def recommend(payload: NutritionRequest):
    data = payload.model_dump()
    try:
        result = generate_nutrition_recommendation(data)

        safe_insert_one(
            nutrition_collection,
            {
                "type": "nutrition",
                "status": "success",
                "engine_version": "v1.0-rule-based",
                "input": data,
                "output": result,
                "created_at": datetime.now(UTC),
            },
            "nutrition recommendation",
        )

        return result

    except Exception as exc:
        logger.exception("Nutrition recommendation failed")

        fallback = {
            "summary": "Service IA indisponible, recommandation nutritionnelle générique appliquée.",
            "actions": ["Privilégier un repas équilibré avec protéines, légumes et féculents adaptés."],
            "score": 0,
            "meal_plan": [],
        }

        safe_insert_one(
            nutrition_collection,
            {
                "type": "nutrition",
                "status": "fallback",
                "engine_version": "v1.0-rule-based",
                "error": str(exc),
                "input": data,
                "output": fallback,
                "created_at": datetime.now(UTC),
            },
            "nutrition fallback",
        )

        return fallback
