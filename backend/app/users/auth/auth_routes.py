from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError # Importação essencial para capturar a colisão
from sqlalchemy.orm import Session

from app.core.dependecies import get_db
from app.core.security import get_current_user
from app.users.models import User
from app.users.schemas import UserSchema
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
        try:
            user = _build_user_from_payload(payload)
            db.add(user)
            db.flush() # Tenta salvar
            ensure_default_categories(db, user.id)
            db.commit()
            db.refresh(user)
        except IntegrityError:
            # Captura a colisão! Se cair aqui, a outra requisição concorrente já salvou.
            db.rollback() 
            user = db.get(User, user_id)
    else:
        email = payload.get("email")
        metadata = payload.get("user_metadata") or {}
        
        # Otimização: Apenas faz commit se houver mudança real
        changed = False
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

        if changed:
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
        try:
            user = _build_user_from_payload(payload)
            db.add(user)
            db.flush()
            ensure_default_categories(db, user.id)
            db.commit()
            db.refresh(user)
        except IntegrityError:
            # Captura a duplicidade gerada pela concorrência
            db.rollback()
            user = db.get(User, user_id)

    return user