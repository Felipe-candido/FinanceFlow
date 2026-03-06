from app.core.dependecies import get_db
from datetime import datetime
from app.categories.services import CategoryService
from fastapi import APIRouter, Depends, HTTPException
from app.categories.schemas import CategoryBase, CategoryResponse
from app.core.security import get_current_user

category_router = APIRouter(prefix="/categories", tags=["categories"])

@category_router.get("/list", response_model=list[CategoryResponse])
async def list_categories(
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
      ):
     
     current_user_id = current_user["sub"]
     service = CategoryService(db, current_user_id)
     return service.list_categories()
