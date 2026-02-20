from typing import Literal
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class DashboardPeriod(BaseModel):
    start_date: datetime
    end_date: datetime

class CategoryTotal(BaseModel):
    category: str
    total: float

class TransactionSummary(BaseModel):
    id: UUID
    description: str
    amount: float
    type: str
    date: datetime
    category: str

    model_config = ConfigDict(from_attributes=True)

class DashboardResponse(BaseModel):
    period: DashboardPeriod
    total_income: float
    total_expense: float
    balance: float
    expenses_by_category: list[CategoryTotal]
    income_by_category: list[CategoryTotal] 
    last_transactions: list[TransactionSummary]