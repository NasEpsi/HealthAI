from __future__ import annotations

import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..deps import get_db
from ..security import require_api_key

# Répertoire partagé via docker-compose: ./data -> /app/data
EXPORT_DIR = Path(os.getenv("EXPORT_DIR", "/app/data/cleaned")).resolve()

router = APIRouter(prefix="/exports", tags=["Exports"], dependencies=[Depends(require_api_key)])


def _safe_resolve(filename: str) -> Path:
    # Empêche ../ etc.
    candidate = (EXPORT_DIR / filename).resolve()
    if not str(candidate).startswith(str(EXPORT_DIR)):
        raise HTTPException(status_code=400, detail="Invalid filename")
    return candidate


@router.get("")
def list_exports():
    if not EXPORT_DIR.exists():
        return {"export_dir": str(EXPORT_DIR), "files": []}

    files = []
    for p in sorted(EXPORT_DIR.glob("*")):
        if p.is_file():
            files.append({
                "name": p.name,
                "size_bytes": p.stat().st_size,
            })

    return {"export_dir": str(EXPORT_DIR), "files": files}


@router.get("/{filename}")
def download_export(filename: str):
    path = _safe_resolve(filename)
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    # Content-Type auto selon extension
    media_type = "application/octet-stream"
    if filename.endswith(".csv"):
        media_type = "text/csv"
    elif filename.endswith(".json"):
        media_type = "application/json"

    return FileResponse(
        path=str(path),
        media_type=media_type,
        filename=filename,
    )


@router.post("/run")
def run_exports(db: Session = Depends(get_db)):
    """
    Lance l’export côté serveur. Pratique pour une démo ou une automatisation.
    """
    # Import local pour éviter les imports inutiles au démarrage
    from healthai.etl.export_data import main as export_main

    export_main()
    return {"status": "ok", "message": "Exports generated in data/cleaned"}