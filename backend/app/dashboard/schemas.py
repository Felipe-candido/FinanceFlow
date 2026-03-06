from datetime import datetime
from pydantic import BaseModel
from typing import List
from app.transactions.schemas import TransactionResponse


class DashboardPeriod(BaseModel):
    start_date: datetime
    end_date: datetime


class CategoryTotal(BaseModel):
    category: str
    total: float
    color: str

class DashboardResponse(BaseModel):

    period: DashboardPeriod

    total_income: float
    total_expense: float
    balance: float

    expenses_by_category: List[CategoryTotal]
    income_by_category: List[CategoryTotal]

    last_transactions: List[TransactionResponse]