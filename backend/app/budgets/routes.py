from uuid import UUID

from fastapi import APIRouter, Depends

from app.budgets.schemas import BudgetCreate, BudgetResponse, BudgetUpdate
from app.budgets.services import BudgetService
from app.core.dependecies import get_db
from app.core.security import get_current_user

budgets_router = APIRouter(prefix="/budgets", tags=["budgets"])


@budgets_router.get("", response_model=list[BudgetResponse])
async def list_budgets(
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = BudgetService(db, current_user["sub"])
    return service.list_budgets()


@budgets_router.post("", response_model=BudgetResponse)
async def create_budget(
    budget_data: BudgetCreate,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = BudgetService(db, current_user["sub"])
    return service.create_budget(budget_data)


@budgets_router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: UUID,
    budget_data: BudgetUpdate,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = BudgetService(db, current_user["sub"])
    return service.update_budget(budget_id, budget_data)


@budgets_router.delete("/{budget_id}")
async def delete_budget(
    budget_id: UUID,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = BudgetService(db, current_user["sub"])
    return service.delete_budget(budget_id)
