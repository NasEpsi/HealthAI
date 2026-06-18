from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from healthai.api.deps_auth import get_current_user_id
from healthai.api.schemas.social import SocialUserRead, SocialUserSync
from healthai.db import get_db
from healthai.models.social import SocialUser

router = APIRouter(prefix="/social/users", tags=["social-users"])


@router.put("/me", response_model=SocialUserRead)
def sync_my_profile(
    payload: SocialUserSync,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    email = payload.email.strip().lower()
    existing = db.query(SocialUser).filter(SocialUser.user_id == user_id).first()

    if existing:
        existing.email = email
        existing.name = payload.name.strip()
        existing.avatar_url = payload.avatar_url
    else:
        email_taken = (
            db.query(SocialUser)
            .filter(SocialUser.email == email, SocialUser.user_id != user_id)
            .first()
        )
        if email_taken:
            raise HTTPException(status_code=409, detail="Cet email est déjà utilisé par un autre compte.")

        existing = SocialUser(
            user_id=user_id,
            email=email,
            name=payload.name.strip(),
            avatar_url=payload.avatar_url,
        )
        db.add(existing)

    db.commit()
    db.refresh(existing)
    return SocialUserRead.model_validate(existing)


@router.get("/search", response_model=list[SocialUserRead])
def search_users(
    q: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    term = f"%{q.strip().lower()}%"
    users = (
        db.query(SocialUser)
        .filter(
            SocialUser.user_id != user_id,
            or_(
                SocialUser.name.ilike(term),
                SocialUser.email.ilike(term),
            ),
        )
        .order_by(SocialUser.name.asc())
        .limit(limit)
        .all()
    )
    return [SocialUserRead.model_validate(u) for u in users]
