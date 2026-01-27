from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class TransactionBase(BaseModel):
    description: Optional[str] = None
    type: str
    date: Optional[datetime] = None
    category: str
    amount: float


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    type: Optional[str] = None
    date: Optional[datetime] = None
    category: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }