from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from app.users.schemas import UserSchema
from app.users.auth.auth_service import sync_user
from app.core.dependecies import get_db
from sqlalchemy.orm import Session
from app.users.schemas import UserSchema
from app.core.security import get_current_user
from app.users.models import User
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import security

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.get("/me", response_model=UserSchema)
async def get_user_info(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = payload["sub"]

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

