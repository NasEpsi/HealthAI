import os

DATABASE_URL = os.getenv("DATABASE_URL", "")
API_KEY = os.getenv("API_KEY", "change_me")

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