from datetime import datetime, UTC
import logging

from fastapi import APIRouter
from healthai_ai.mongo import workout_collection, safe_insert_one
from healthai_ai.schemas.workout import WorkoutRequest, WorkoutResponse
from healthai_ai.services.workout_engine import generate_workout_plan

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai/workout", tags=["AI Workout"])


@router.post("/recommend", response_model=WorkoutResponse)
def recommend(payload: WorkoutRequest):
    data = payload.model_dump()
    try:
        result = generate_workout_plan(data)

        safe_insert_one(
            workout_collection,
            {
                "type": "workout",
                "status": "success",
                "engine_version": "v1.0-rule-based",
                "input": data,
                "output": result,
                "created_at": datetime.now(UTC),
            },
            "workout recommendation",
        )

        return result

    except Exception as exc:
        logger.exception("Workout recommendation failed")

        fallback = {
            "level": payload.level,
            "duration": payload.duration,
            "plan": [],
            "score": 0,
        }

        safe_insert_one(
            workout_collection,
            {
                "type": "workout",
                "status": "fallback",
                "engine_version": "v1.0-rule-based",
                "error": str(exc),
                "input": data,
                "output": fallback,
                "created_at": datetime.now(UTC),
            },
            "workout fallback",
        )

        return fallback
