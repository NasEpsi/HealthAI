from fastapi import APIRouter
from healthai_ai.services.nutrition_engine import generate_nutrition_recommendation
from healthai_ai.mongo import nutrition_collection

router = APIRouter(prefix="/ai/nutrition", tags=["AI Nutrition"])


@router.post("/recommend")
def recommend(data: dict):
    result = generate_nutrition_recommendation(data)

    doc = {
        "input": data,
        "output": result
    }

    nutrition_collection.insert_one(doc)

    return {"recommendation": result}