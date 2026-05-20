from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from app.core.dependecies import get_db
from sqlalchemy.orm import Session
from app.users.schemas import UserSchema
from app.core.security import get_current_user
from app.users.models import User
from app.categories.services import ensure_default_categories



auth_router = APIRouter(prefix="/auth", tags=["auth"])


def _build_user_from_payload(payload: dict) -> User:
    metadata = payload.get("user_metadata") or {}
    full_name = metadata.get("name") or metadata.get("full_name") or "Usuario"

    return User(
        id=UUID(payload["sub"]),
        email=payload.get("email") or metadata.get("email") or "",
        name=full_name,
        last_name=metadata.get("last_name"),
    )


@auth_router.post("/sync", response_model=UserSchema)
async def sync_user(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = UUID(payload["sub"])
    user = db.get(User, user_id)

    if not user:
        user = _build_user_from_payload(payload)
        db.add(user)
        db.flush()
    else:
        email = payload.get("email")
        metadata = payload.get("user_metadata") or {}
        if email:
            user.email = email
        if metadata.get("name") or metadata.get("full_name"):
            user.name = metadata.get("name") or metadata.get("full_name")
        if metadata.get("last_name"):
            user.last_name = metadata.get("last_name")

    ensure_default_categories(db, user.id)
    db.commit()
    db.refresh(user)

    return user

@auth_router.get("/me", response_model=UserSchema)
async def get_user_info(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = UUID(payload["sub"])

    user = db.get(User, user_id)
    if not user:
        user = _build_user_from_payload(payload)
        db.add(user)
        db.flush()
        ensure_default_categories(db, user.id)
        db.commit()
        db.refresh(user)

    return user

