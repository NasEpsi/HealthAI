from fastapi import FastAPI, Depends
from .security import require_api_key
from healthai.api.routers.kpis import router as kpis_router
from healthai.api.routers.exports import router as exports_router
from healthai.api.routers.users import router as users_router
from healthai.api.routers.foods import router as foods_router
from healthai.api.routers.sessions import router as sessions_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HealthAI Backend")
app.include_router(kpis_router)
app.include_router(exports_router)
app.include_router(users_router)
app.include_router(foods_router)
app.include_router(sessions_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/secure-ping", dependencies=[Depends(require_api_key)])
def secure_ping():
    return {"status": "secure ok"}