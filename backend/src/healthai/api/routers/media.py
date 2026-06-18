from fastapi import APIRouter, HTTPException

from healthai.api.schemas.social import CloudinaryConfigRead
from healthai.services.cloudinary_service import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
    is_cloudinary_configured,
)

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/cloudinary-config", response_model=CloudinaryConfigRead)
def get_cloudinary_config():
    if not is_cloudinary_configured():
        raise HTTPException(
            status_code=503,
            detail="Cloudinary non configuré. Définissez CLOUDINARY_CLOUD_NAME et CLOUDINARY_UPLOAD_PRESET.",
        )
    return CloudinaryConfigRead(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        upload_preset=CLOUDINARY_UPLOAD_PRESET,
    )
