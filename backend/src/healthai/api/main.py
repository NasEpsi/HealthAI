from fastapi import FastAPI, Depends
from .security import require_api_key
from healthai.api.routers.kpis import router as kpis_router
from healthai.api.routers.exports import router as exports_router

app = FastAPI(title="HealthAI Backend")
app.include_router(kpis_router)
app.include_router(exports_router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/secure-ping", dependencies=[Depends(require_api_key)])
def secure_ping():
    return {"status": "secure ok"}