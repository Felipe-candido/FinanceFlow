from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.budgets.models import Budget
from app.categories.models import Category
from app.categories.services import ensure_default_categories
from app.core.dependecies import get_db
from app.core.security import get_current_user
from app.settings.models import UserSettings
from app.transactions.models import RecurringTransaction, Transaction
from app.users.models import User
from app.users.schemas import UserSchema

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


def _apply_payload_to_user(user: User, payload: dict) -> bool:
    metadata = payload.get("user_metadata") or {}
    changed = False

    email = payload.get("email") or metadata.get("email")
    if email and user.email != email:
        user.email = email
        changed = True

    name = metadata.get("name") or metadata.get("full_name")
    if name and user.name != name:
        user.name = name
        changed = True

    last_name = metadata.get("last_name")
    if last_name and user.last_name != last_name:
        user.last_name = last_name
        changed = True

    return changed


def _move_user_data(db: Session, old_user_id: UUID, new_user_id: UUID) -> None:
    for model in (Category, Budget, UserSettings, RecurringTransaction, Transaction):
        db.execute(
            update(model)
            .where(model.user_id == old_user_id)
            .values(user_id=new_user_id)
        )


def _replace_user_id(db: Session, existing_user: User, payload: dict) -> User:
    new_user_id = UUID(payload["sub"])
    if existing_user.id == new_user_id:
        _apply_payload_to_user(existing_user, payload)
        return existing_user

    old_user_id = existing_user.id
    replacement = _build_user_from_payload(payload)
    replacement.stripe_customer_id = existing_user.stripe_customer_id
    replacement.subscription_status = existing_user.subscription_status
    replacement.price_id = existing_user.price_id

    existing_user.email = f"replaced-{old_user_id}@local.invalid"
    db.flush()
    db.add(replacement)
    db.flush()
    _move_user_data(db, old_user_id, new_user_id)
    db.delete(existing_user)
    db.flush()

    return replacement


def _get_or_sync_user(db: Session, payload: dict) -> User:
    user_id = UUID(payload["sub"])
    user = db.get(User, user_id)

    if user:
        _apply_payload_to_user(user, payload)
        ensure_default_categories(db, user.id)
        db.commit()
        db.refresh(user)
        return user

    metadata = payload.get("user_metadata") or {}
    email = payload.get("email") or metadata.get("email")
    existing_user = (
        db.query(User).filter(User.email == email).first()
        if email
        else None
    )

    try:
        if existing_user:
            user = _replace_user_id(db, existing_user, payload)
        else:
            user = _build_user_from_payload(payload)
            db.add(user)
            db.flush()

        ensure_default_categories(db, user.id)
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        user = db.get(User, user_id)
        if user:
            return user

        if email:
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                user = _replace_user_id(db, existing_user, payload)
                ensure_default_categories(db, user.id)
                db.commit()
                db.refresh(user)
                return user

        raise HTTPException(status_code=409, detail="Could not sync user")


@auth_router.post("/sync", response_model=UserSchema)
async def sync_user(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_or_sync_user(db, payload)


@auth_router.get("/me", response_model=UserSchema)
async def get_user_info(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_or_sync_user(db, payload)
