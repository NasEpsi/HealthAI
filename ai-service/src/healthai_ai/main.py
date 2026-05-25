from fastapi import FastAPI
from healthai_ai.routers import nutrition, workout

app = FastAPI(title="HealthAI AI Service")

app.include_router(nutrition.router)
app.include_router(workout.router)


@app.get("/health")
def health():
    return {"status": "ai ok"}

import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)