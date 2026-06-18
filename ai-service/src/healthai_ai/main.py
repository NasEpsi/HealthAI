from fastapi import FastAPI
from healthai_ai.routers import nutrition, workout, vision
from fastapi.middleware.cors import CORSMiddleware

import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

_DEFAULT_CORS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://localhost",
    "capacitor://localhost",
    "ionic://localhost",
    "http://localhost",
]

_extra = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = _DEFAULT_CORS + [o.strip() for o in _extra.split(",") if o.strip()]

app = FastAPI(title="HealthAI API Recommendation")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(nutrition.router)
app.include_router(workout.router)
app.include_router(vision.router)


@app.get("/health")
def health():
    return {"status": "ai ok"}