from fastapi import APIRouter, Depends
from app.users.schemas import UserSchema
from app.users.auth.auth_service import sync_user
from app.core.dependecies import get_db
from sqlalchemy.orm import Session



auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register")
async def register_user(payload: dict, 
                        db: Session = Depends(get_db)):

      sync_user(payload, db)
      return {"message": "User registered successfully:", "user": payload}