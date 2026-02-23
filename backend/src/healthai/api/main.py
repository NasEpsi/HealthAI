from fastapi import FastAPI, Depends
from .security import require_api_key

app = FastAPI(title="HealthAI Backend")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/secure-ping", dependencies=[Depends(require_api_key)])
def secure_ping():
    return {"status": "secure ok"}