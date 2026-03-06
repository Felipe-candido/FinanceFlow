from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.categories.schemas import CategoryResponse


class TransactionBase(BaseModel):
    description: Optional[str] = None
    type: str
    date: Optional[datetime] = None
    category_id: Optional[UUID] = None
    amount: float


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    type: Optional[str] = None
    date: Optional[datetime] = None
    category_id: Optional[UUID] = None


class TransactionResponse(TransactionBase):
    id: UUID
    created_at: datetime
    category: CategoryResponse

    model_config = {
        "from_attributes": True
    }



