from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from healthai.api.security import require_api_key


# Routers
from healthai.api.routers.kpis import router as kpis_router
from healthai.api.routers.exports import router as exports_router
from healthai.api.routers.users import router as users_router
from healthai.api.routers.foods import router as foods_router
from healthai.api.routers.sessions import router as sessions_router

# routers IA
from healthai.api.routers import profiles, meals, recommendations, posts, media

# DB
from healthai.db import Base, engine

# Import modèles
from healthai.models.utilisateur import Utilisateur
from healthai.models.aliment import Aliment
from healthai.models.nutrition_log import NutritionLog
from healthai.models.session_sport import SessionSport
from healthai.models.qualite_run import QualiteDonneesRun
from healthai.models.user_profile import UserProfile
from healthai.models.meal_analysis import MealAnalysis
from healthai.models.nutrition_recommendation import NutritionRecommendation
from healthai.models.workout_recommendation import WorkoutRecommendation
from healthai.models.recommendation_history import RecommendationHistory
from healthai.models.social import Post, Comment, PostLike

app = FastAPI(title="HealthAI API")


# Création des tables
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(kpis_router)
app.include_router(exports_router)
app.include_router(users_router)
app.include_router(foods_router)
app.include_router(sessions_router)

app.include_router(profiles.router)
app.include_router(meals.router)
app.include_router(recommendations.router)
app.include_router(posts.router)
app.include_router(media.router)

# CORS
import os
from healthai.config import CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response, Request
import time

REQUEST_COUNT = Counter(
    "healthai_api_requests_total",
    "Nombre total de requêtes API",
    ["method", "endpoint", "status_code"]
)

@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code
    ).inc()

    return response

@app.get("/metrics", include_in_schema=False)
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Routes
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/secure-ping", dependencies=[Depends(require_api_key)])
def secure_ping():
    return {"status": "secure ok"}



