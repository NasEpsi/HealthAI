from fastapi import APIRouter
from healthai_ai.services.workout_engine import generate_workout_plan
from healthai_ai.mongo import workout_collection

router = APIRouter(prefix="/ai/workout", tags=["AI Workout"])


@router.post("/recommend")
def recommend(data: dict):
    result = generate_workout_plan(data)

    doc = {
        "input": data,
        "output": result
    }

    workout_collection.insert_one(doc)

    return result