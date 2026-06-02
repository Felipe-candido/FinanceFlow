from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.categories.schemas import CategoryResponse


TransactionType = Literal["income", "expense"]


class RecurrenceCreate(BaseModel):
    is_recurring: bool = False
    recurrence_interval_months: int = Field(default=1, ge=1, le=12)
    recurrence_end_date: Optional[datetime] = None
    recurrence_occurrences: Optional[int] = Field(default=None, ge=2, le=360)

    @model_validator(mode="after")
    def validate_recurrence(self):
        if not self.is_recurring:
            if self.recurrence_end_date or self.recurrence_occurrences:
                raise ValueError(
                    "is_recurring precisa ser true para usar parametros de recorrencia."
                )
            return self

        if self.recurrence_end_date and self.recurrence_occurrences:
            raise ValueError(
                "Use apenas recurrence_end_date ou recurrence_occurrences para recorrencia."
            )

        return self


class TransactionCreate(RecurrenceCreate):
    description: Optional[str] = None
    type: TransactionType
    date: Optional[datetime] = None
    category_id: Optional[UUID] = None
    amount: float


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    type: Optional[TransactionType] = None
    date: Optional[datetime] = None
    category_id: Optional[UUID] = None
    amount: Optional[float] = None


class TransactionResponse(BaseModel):
    id: UUID
    description: Optional[str] = None
    type: TransactionType
    date: Optional[datetime] = None
    category_id: UUID
    amount: float
    created_at: datetime
    category: CategoryResponse
    recurring_transaction_id: Optional[UUID] = None
    recurrence_sequence: Optional[int] = None

    model_config = {
        "from_attributes": True,
    }


class RecurringTransactionUpdate(BaseModel):
    is_active: bool


class RecurringTransactionResponse(BaseModel):
    id: UUID
    description: Optional[str] = None
    type: TransactionType
    start_date: datetime
    amount: float
    category_id: UUID
    category: CategoryResponse
    interval_months: int
    end_date: Optional[datetime] = None
    total_occurrences: Optional[int] = None
    generated_occurrences: int
    is_active: bool
    created_at: datetime
    next_occurrence_date: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
    }
