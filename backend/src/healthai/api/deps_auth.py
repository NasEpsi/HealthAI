from fastapi import Header, HTTPException


def get_current_user_id(x_user_id: str | None = Header(default=None, alias="X-User-Id")) -> str:
    if not x_user_id or not x_user_id.strip():
        raise HTTPException(status_code=401, detail="Authentification requise (X-User-Id).")
    return x_user_id.strip()
