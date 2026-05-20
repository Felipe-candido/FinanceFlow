from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.categories.schemas import CategoryResponse


class BudgetBase(BaseModel):
    category_id: UUID
    limit: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category_id: UUID | None = None
    limit: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)


class BudgetResponse(BudgetBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    category: CategoryResponse

    model_config = {
        "from_attributes": True,
    }
