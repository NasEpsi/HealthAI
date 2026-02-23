from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from healthai.api.deps import get_db
from healthai.api.security import require_api_key
from healthai.models.session_sport import SessionSport
from healthai.models.utilisateur import Utilisateur
from healthai.api.schemas.session import SessionCreate, SessionUpdate, SessionOut

router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"],
    dependencies=[Depends(require_api_key)]
)


@router.get("", response_model=List[SessionOut])
def list_sessions(
    user_id: Optional[int] = Query(default=None, ge=1),
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    q = db.query(SessionSport)
    if user_id is not None:
        q = q.filter(SessionSport.id_user == user_id)
    return q.order_by(SessionSport.id_session.desc()).limit(limit).all()


@router.get("/{session_id}", response_model=SessionOut)
def get_session(session_id: int, db: Session = Depends(get_db)):
    s = db.get(SessionSport, session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    return s


@router.post("", response_model=SessionOut)
def create_session(data: SessionCreate, db: Session = Depends(get_db)):
    # check user exists
    u = db.get(Utilisateur, data.id_user)
    if not u:
        raise HTTPException(400, "User does not exist")

    # respect unique (id_user, session_date)
    existing = db.query(SessionSport).filter(
        SessionSport.id_user == data.id_user,
        SessionSport.session_date == data.session_date,
    ).first()
    if existing:
        raise HTTPException(409, "Session already exists for this user and date")

    s = SessionSport(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.put("/{session_id}", response_model=SessionOut)
def update_session(session_id: int, data: SessionUpdate, db: Session = Depends(get_db)):
    s = db.get(SessionSport, session_id)
    if not s:
        raise HTTPException(404, "Session not found")

    payload = data.model_dump(exclude_unset=True)

    # si on change session_date, vérifier l'unicité
    if "session_date" in payload and payload["session_date"] != s.session_date:
        conflict = db.query(SessionSport).filter(
            SessionSport.id_user == s.id_user,
            SessionSport.session_date == payload["session_date"],
            SessionSport.id_session != s.id_session,
        ).first()
        if conflict:
            raise HTTPException(409, "Another session already exists for this user and date")

    for k, v in payload.items():
        setattr(s, k, v)

    db.commit()
    db.refresh(s)
    return s


@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    s = db.get(SessionSport, session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    db.delete(s)
    db.commit()
    return {"status": "deleted"}