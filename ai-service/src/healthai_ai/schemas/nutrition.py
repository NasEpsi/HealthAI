from fastapi import APIRouter, HTTPException
from healthai_ai.services.nutrition_engine import generate_nutrition_recommendation
from healthai_ai.mongo import nutrition_collection
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai/nutrition", tags=["AI Nutrition"])


@router.post("/recommend")
def recommend(data: dict):
    try:
        logger.info(f"Incoming nutrition request: {data}")

        result = generate_nutrition_recommendation(data)

        nutrition_collection.insert_one({
            "input": data,
            "output": result
        })

        return result

    except Exception as e:
        logger.error(f"Error in nutrition service: {str(e)}")

        # 🔥 fallback
        return {
            "summary": "Impossible de générer une recommandation pour le moment",
            "actions": ["Réessayer plus tard"],
            "score": 0
        }