from uuid import UUID

from fastapi import APIRouter, Depends

from app.categories.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from app.categories.services import CategoryService
from app.core.dependecies import get_db
from app.core.security import get_current_user

category_router = APIRouter(prefix="/categories", tags=["categories"])


@category_router.get("/list", response_model=list[CategoryResponse])
async def list_categories(
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = CategoryService(db, current_user["sub"])
    return service.list_categories()


@category_router.post("", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = CategoryService(db, current_user["sub"])
    return service.create_category(category_data)


@category_router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID,
    category_data: CategoryUpdate,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = CategoryService(db, current_user["sub"])
    return service.update_category(category_id, category_data)


@category_router.delete("/{category_id}")
async def delete_category(
    category_id: UUID,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = CategoryService(db, current_user["sub"])
    return service.delete_category(category_id)
