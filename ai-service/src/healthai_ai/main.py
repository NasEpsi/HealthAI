import logging
import os
import time

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, generate_latest

from healthai_ai.routers import nutrition, workout, vision

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
CORS_ORIGINS = _DEFAULT_CORS + [origin.strip() for origin in _extra.split(",") if origin.strip()]

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

REQUEST_COUNT = Counter(
    "healthai_ai_requests_total",
    "Nombre total de requetes du microservice IA",
    ["method", "endpoint", "status_code"],
)


@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code,
    ).inc()

    logger.debug(
        "Handled %s %s in %.3fs",
        request.method,
        request.url.path,
        time.time() - start_time,
    )
    return response


@app.get("/metrics", include_in_schema=False)
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/health")
def health():
    return {"status": "ai ok"}
