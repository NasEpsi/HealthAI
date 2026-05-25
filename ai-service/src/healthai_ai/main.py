from fastapi import FastAPI
from healthai_ai.routers import nutrition, workout, vision

import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI(title="HealthAI API Recommendation")

app.include_router(nutrition.router)
app.include_router(workout.router)
app.include_router(vision.router)


@app.get("/health")
def health():
    return {"status": "ai ok"}