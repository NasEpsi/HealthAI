from datetime import datetime, UTC
import logging

from fastapi import APIRouter, UploadFile, File, Form

from healthai_ai.mongo import nutrition_collection, safe_insert_one
from healthai_ai.schemas.vision import MealImageAnalysisResponse
from healthai_ai.services.food_detection import detect_foods_from_image, calculate_totals
from healthai_ai.services.llm_generator import generate_meal_advice

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai/vision", tags=["AI Vision"])


@router.post("/meal/analyze", response_model=MealImageAnalysisResponse)
async def analyze_meal_image(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    goal: str = Form("maintain"),
):
    try:
        detected_foods = detect_foods_from_image(file.filename)
        totals = calculate_totals(detected_foods)
        advice = generate_meal_advice(goal, detected_foods, totals)

        result = {
            "filename": file.filename,
            "detected_foods": detected_foods,
            "totals": totals,
            "advice": advice,
            "score": 0.75,
        }

        safe_insert_one(
            nutrition_collection,
            {
                "type": "meal_image_analysis",
                "status": "success",
                "engine_version": "v1.0-simulated-vision",
                "user_id": user_id,
                "input": {
                    "filename": file.filename,
                    "goal": goal,
                },
                "output": result,
                "created_at": datetime.now(UTC),
            },
            "meal image analysis",
        )

        return result

    except Exception as exc:
        logger.exception("Meal image analysis failed")

        fallback = {
            "filename": file.filename,
            "detected_foods": [],
            "totals": {
                "calories": 0,
                "proteins": 0,
                "carbs": 0,
                "fats": 0,
            },
            "advice": "Impossible d'analyser l'image. Une recommandation générique peut être appliquée.",
            "score": 0,
        }

        safe_insert_one(
            nutrition_collection,
            {
                "type": "meal_image_analysis",
                "status": "fallback",
                "engine_version": "v1.0-simulated-vision",
                "user_id": user_id,
                "error": str(exc),
                "created_at": datetime.now(UTC),
            },
            "meal image fallback",
        )

        return fallback
